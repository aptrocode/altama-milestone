import os
import sys
import socket
import threading
import struct
import hashlib
import base64
import json
import time
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

# --------------------------------------------------------------------------
# 1. OSC & TUIO 1.1 / AUGMENTA PROTOCOL PARSER (Pure Python Standard Library)
# --------------------------------------------------------------------------
def parse_osc_string(data, offset):
    end = data.find(bytes([0]), offset)
    if end == -1:
        end = len(data)
    s = data[offset:end].decode('utf-8', errors='replace')
    new_offset = (end + 4) & ~3
    return s, new_offset

def parse_osc_message(data, offset=0):
    address, offset = parse_osc_string(data, offset)
    if offset >= len(data) or data[offset:offset+1] != b',':
        return address, []
    
    type_tags, offset = parse_osc_string(data, offset)
    args = []
    for tag in type_tags[1:]:
        if tag == 's':
            val, offset = parse_osc_string(data, offset)
            args.append(val)
        elif tag == 'i':
            if offset + 4 <= len(data):
                val = struct.unpack('>i', data[offset:offset+4])[0]
                offset += 4
                args.append(val)
        elif tag == 'f':
            if offset + 4 <= len(data):
                val = struct.unpack('>f', data[offset:offset+4])[0]
                offset += 4
                args.append(val)
    return address, args

def parse_tuio_packet(data):
    messages = []
    bundle_tag = b'#bundle' + bytes([0])
    if data.startswith(bundle_tag):
        offset = 16 # Skip #bundle and 8-byte timetag
        while offset < len(data):
            if offset + 4 > len(data):
                break
            size = struct.unpack('>I', data[offset:offset+4])[0]
            offset += 4
            msg_data = data[offset:offset+size]
            offset += size
            if msg_data.startswith(bundle_tag):
                messages.extend(parse_tuio_packet(msg_data))
            else:
                addr, args = parse_osc_message(msg_data)
                messages.append((addr, args))
    else:
        addr, args = parse_osc_message(data)
        messages.append((addr, args))
    return messages

# --------------------------------------------------------------------------
# 2. UNIVERSAL TOUCH & CURSOR STATE ENGINE (TUIO + AUGMENTA + GENERIC)
# --------------------------------------------------------------------------
class UniversalOscProcessor:
    def __init__(self, on_event=None, cursor_timeout=0.35):
        self.on_event = on_event
        self.cursor_timeout = cursor_timeout
        self.active_cursors = {} # key -> {'id': int, 'x': float, 'y': float, 'last_seen': float, 'protocol': str}
        self.lock = threading.Lock()
        self.running = True
        self.last_log_time = 0
        self.cleanup_thread = threading.Thread(target=self._cleanup_loop, daemon=True)
        self.cleanup_thread.start()

    def _cleanup_loop(self):
        while self.running:
            time.sleep(0.04)
            now = time.time()
            with self.lock:
                expired = []
                for cid, cdata in self.active_cursors.items():
                    if now - cdata['last_seen'] > self.cursor_timeout:
                        expired.append((cid, cdata))
                for cid, cdata in expired:
                    del self.active_cursors[cid]
                    if self.on_event:
                        self.on_event({
                            "type": "pointerup",
                            "id": cdata['id'],
                            "x": cdata['x'],
                            "y": cdata['y'],
                            "protocol": cdata.get('protocol', 'osc')
                        })
                    print(f"[-] [Touch UP] ID={cdata['id']} released (Protocol: {cdata.get('protocol', 'osc')})")

    def process_message(self, addr, args, source_port=None):
        now = time.time()

        # -----------------------------------------------------------
        # A. TUIO 1.1: /tuio/2Dcur (alive, set, fseq)
        # -----------------------------------------------------------
        if addr == '/tuio/2Dcur':
            if not args:
                return
            cmd = args[0]
            if cmd == 'alive':
                alive_ids = set(args[1:])
                with self.lock:
                    to_remove = []
                    for cid, cdata in self.active_cursors.items():
                        if cid.startswith('tuio_'):
                            raw_id = cdata['id']
                            if raw_id not in alive_ids:
                                to_remove.append((cid, cdata))
                    for cid, cdata in to_remove:
                        del self.active_cursors[cid]
                        if self.on_event:
                            self.on_event({
                                "type": "pointerup",
                                "id": cdata['id'],
                                "x": cdata['x'],
                                "y": cdata['y'],
                                "protocol": "TUIO1.1"
                            })
                        print(f"[-] [TUIO UP] ID={cdata['id']} (Port {source_port})")

            elif cmd == 'set' and len(args) >= 4:
                raw_id = int(args[1])
                x = max(0.0, min(1.0, float(args[2])))
                y = max(0.0, min(1.0, float(args[3])))
                cid = f"tuio_{raw_id}"
                with self.lock:
                    if cid not in self.active_cursors:
                        self.active_cursors[cid] = {'id': raw_id, 'x': x, 'y': y, 'last_seen': now, 'protocol': 'TUIO1.1'}
                        if self.on_event:
                            self.on_event({"type": "pointerdown", "id": raw_id, "x": x, "y": y, "protocol": "TUIO1.1"})
                        print(f"[+] [TUIO DOWN] ID={raw_id} at ({x:.3f}, {y:.3f}) (Port {source_port})")
                    else:
                        self.active_cursors[cid]['x'] = x
                        self.active_cursors[cid]['y'] = y
                        self.active_cursors[cid]['last_seen'] = now
                        if self.on_event:
                            self.on_event({"type": "pointermove", "id": raw_id, "x": x, "y": y, "protocol": "TUIO1.1"})

        # -----------------------------------------------------------
        # B. AUGMENTA PROTOCOL (/object/update, /object/enter, /object/leave)
        # -----------------------------------------------------------
        elif addr in ('/object/update', '/object/enter', '/object/update/extra'):
            # args: [frame, id, oid, age, x, y, width, height, ...]
            raw_id = None
            x = None
            y = None
            if len(args) >= 6 and isinstance(args[0], int) and isinstance(args[1], int):
                raw_id = int(args[1])
                x = float(args[4])
                y = float(args[5])
            elif len(args) >= 3:
                raw_id = int(args[0])
                x = float(args[1])
                y = float(args[2])

            if raw_id is not None and x is not None and y is not None:
                x = max(0.0, min(1.0, x))
                y = max(0.0, min(1.0, y))
                cid = f"aug_{raw_id}"
                with self.lock:
                    if cid not in self.active_cursors:
                        self.active_cursors[cid] = {'id': raw_id, 'x': x, 'y': y, 'last_seen': now, 'protocol': 'Augmenta'}
                        if self.on_event:
                            self.on_event({"type": "pointerdown", "id": raw_id, "x": x, "y": y, "protocol": "Augmenta"})
                        print(f"[+] [Augmenta DOWN] ID={raw_id} at ({x:.3f}, {y:.3f}) (Port {source_port})")
                    else:
                        self.active_cursors[cid]['x'] = x
                        self.active_cursors[cid]['y'] = y
                        self.active_cursors[cid]['last_seen'] = now
                        if self.on_event:
                            self.on_event({"type": "pointermove", "id": raw_id, "x": x, "y": y, "protocol": "Augmenta"})

        elif addr == '/object/leave':
            raw_id = None
            if len(args) >= 2 and isinstance(args[1], int):
                raw_id = int(args[1])
            elif len(args) >= 1 and isinstance(args[0], int):
                raw_id = int(args[0])
            if raw_id is not None:
                cid = f"aug_{raw_id}"
                with self.lock:
                    if cid in self.active_cursors:
                        cdata = self.active_cursors.pop(cid)
                        if self.on_event:
                            self.on_event({"type": "pointerup", "id": cdata['id'], "x": cdata['x'], "y": cdata['y'], "protocol": "Augmenta"})
                        print(f"[-] [Augmenta LEAVE] ID={raw_id}")

        # -----------------------------------------------------------
        # C. AUGMENTA PERSON / LEGACY PROTOCOL
        # -----------------------------------------------------------
        elif addr in ('/person/updated', '/person/entered', '/au/personUpdated', '/au/personEntered'):
            if len(args) >= 3:
                raw_id = int(args[0])
                x = max(0.0, min(1.0, float(args[1])))
                y = max(0.0, min(1.0, float(args[2])))
                cid = f"aug_p_{raw_id}"
                with self.lock:
                    if cid not in self.active_cursors:
                        self.active_cursors[cid] = {'id': raw_id, 'x': x, 'y': y, 'last_seen': now, 'protocol': 'AugmentaPerson'}
                        if self.on_event:
                            self.on_event({"type": "pointerdown", "id": raw_id, "x": x, "y": y, "protocol": "AugmentaPerson"})
                        print(f"[+] [Augmenta Person DOWN] ID={raw_id} at ({x:.3f}, {y:.3f})")
                    else:
                        self.active_cursors[cid]['x'] = x
                        self.active_cursors[cid]['y'] = y
                        self.active_cursors[cid]['last_seen'] = now
                        if self.on_event:
                            self.on_event({"type": "pointermove", "id": raw_id, "x": x, "y": y, "protocol": "AugmentaPerson"})

        elif addr in ('/person/willLeave', '/au/personWillLeave'):
            if len(args) >= 1:
                raw_id = int(args[0])
                cid = f"aug_p_{raw_id}"
                with self.lock:
                    if cid in self.active_cursors:
                        cdata = self.active_cursors.pop(cid)
                        if self.on_event:
                            self.on_event({"type": "pointerup", "id": cdata['id'], "x": cdata['x'], "y": cdata['y'], "protocol": "AugmentaPerson"})
                        print(f"[-] [Augmenta Person LEAVE] ID={raw_id}")

        # -----------------------------------------------------------
        # D. TUIO 2.0 PROTOCOL (/tuio2/ptr)
        # -----------------------------------------------------------
        elif addr == '/tuio2/ptr':
            if len(args) >= 5:
                raw_id = int(args[0])
                x = max(0.0, min(1.0, float(args[3])))
                y = max(0.0, min(1.0, float(args[4])))
                cid = f"tuio2_{raw_id}"
                with self.lock:
                    if cid not in self.active_cursors:
                        self.active_cursors[cid] = {'id': raw_id, 'x': x, 'y': y, 'last_seen': now, 'protocol': 'TUIO2.0'}
                        if self.on_event:
                            self.on_event({"type": "pointerdown", "id": raw_id, "x": x, "y": y, "protocol": "TUIO2.0"})
                        print(f"[+] [TUIO 2.0 DOWN] ID={raw_id} at ({x:.3f}, {y:.3f})")
                    else:
                        self.active_cursors[cid]['x'] = x
                        self.active_cursors[cid]['y'] = y
                        self.active_cursors[cid]['last_seen'] = now
                        if self.on_event:
                            self.on_event({"type": "pointermove", "id": raw_id, "x": x, "y": y, "protocol": "TUIO2.0"})

        # -----------------------------------------------------------
        # E. GENERIC OSC TOUCH (/touch, /pointer, /cursor)
        # -----------------------------------------------------------
        elif addr in ('/touch', '/pointer', '/cursor', '/mouse'):
            if len(args) >= 2:
                raw_id = int(args[0]) if len(args) >= 3 else 1
                x = max(0.0, min(1.0, float(args[-2])))
                y = max(0.0, min(1.0, float(args[-1])))
                cid = f"gen_{raw_id}"
                with self.lock:
                    if cid not in self.active_cursors:
                        self.active_cursors[cid] = {'id': raw_id, 'x': x, 'y': y, 'last_seen': now, 'protocol': 'GenericOSC'}
                        if self.on_event:
                            self.on_event({"type": "pointerdown", "id": raw_id, "x": x, "y": y, "protocol": "GenericOSC"})
                        print(f"[+] [OSC Touch DOWN] ID={raw_id} at ({x:.3f}, {y:.3f})")
                    else:
                        self.active_cursors[cid]['x'] = x
                        self.active_cursors[cid]['y'] = y
                        self.active_cursors[cid]['last_seen'] = now
                        if self.on_event:
                            self.on_event({"type": "pointermove", "id": raw_id, "x": x, "y": y, "protocol": "GenericOSC"})

    def stop(self):
        self.running = False

# --------------------------------------------------------------------------
# 3. WEBSOCKET SERVER (RFC 6455 Pure Python Standard Library)
# --------------------------------------------------------------------------
WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

class TuioWebSocketServer:
    def __init__(self, host="0.0.0.0", port=3334):
        self.host = host
        self.port = port
        self.clients = set()
        self.lock = threading.Lock()
        self.running = False
        self.server_sock = None

    def start(self):
        self.running = True
        self.server_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server_sock.bind((self.host, self.port))
        self.server_sock.listen(10)
        threading.Thread(target=self._accept_loop, daemon=True).start()

    def _accept_loop(self):
        while self.running:
            try:
                client_sock, addr = self.server_sock.accept()
                threading.Thread(target=self._handle_client, args=(client_sock,), daemon=True).start()
            except Exception:
                break

    def _handle_client(self, sock):
        try:
            req = sock.recv(2048).decode('utf-8', errors='ignore')
            key = None
            crlf = chr(13) + chr(10)
            for line in req.splitlines():
                if line.lower().startswith('sec-websocket-key:'):
                    key = line.split(':', 1)[1].strip()
                    break
            if not key:
                sock.close()
                return

            accept_val = base64.b64encode(hashlib.sha1((key + WS_GUID).encode('utf-8')).digest()).decode('utf-8')
            resp = crlf.join([
                "HTTP/1.1 101 Switching Protocols",
                "Upgrade: websocket",
                "Connection: Upgrade",
                f"Sec-WebSocket-Accept: {accept_val}",
                "",
                ""
            ])
            sock.sendall(resp.encode('utf-8'))

            with self.lock:
                self.clients.add(sock)

            while self.running:
                data = sock.recv(1024)
                if not data:
                    break
                if len(data) >= 1 and (data[0] & 0x0F) == 8: # Close frame
                    break
        except Exception:
            pass
        finally:
            with self.lock:
                self.clients.discard(sock)
            try:
                sock.close()
            except Exception:
                pass

    def broadcast(self, obj):
        msg = json.dumps(obj).encode('utf-8')
        length = len(msg)
        if length <= 125:
            header = bytes([0x81, length])
        elif length <= 65535:
            header = bytes([0x81, 126]) + struct.pack('>H', length)
        else:
            header = bytes([0x81, 127]) + struct.pack('>Q', length)
        frame = header + msg

        with self.lock:
            disconnected = []
            for client in self.clients:
                try:
                    client.sendall(frame)
                except Exception:
                    disconnected.append(client)
            for d in disconnected:
                self.clients.discard(d)

    def stop(self):
        self.running = False
        if self.server_sock:
            try:
                self.server_sock.close()
            except Exception:
                pass

# --------------------------------------------------------------------------
# 4. MULTI-PORT UDP RECEIVER (PORT 3333, 12000, 13000, 13100)
# --------------------------------------------------------------------------
class MultiPortOscReceiver:
    def __init__(self, ports=[3333, 12000, 13000, 13100], processor=None):
        self.ports = ports
        self.processor = processor
        self.sockets = []
        self.running = False

    def start(self):
        self.running = True
        active_ports = []
        for port in self.ports:
            try:
                sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                sock.bind(("0.0.0.0", port))
                self.sockets.append((sock, port))
                active_ports.append(port)
                threading.Thread(target=self._listen_port, args=(sock, port), daemon=True).start()
            except Exception as e:
                print(f"[!] [UDP Notice] Port {port} could not be bound ({e})")
        return active_ports

    def _listen_port(self, sock, port):
        while self.running:
            try:
                data, addr = sock.recvfrom(65535)
                if data and self.processor:
                    messages = parse_tuio_packet(data)
                    for osc_addr, args in messages:
                        self.processor.process_message(osc_addr, args, source_port=port)
            except Exception:
                break

    def stop(self):
        self.running = False
        for sock, _ in self.sockets:
            try:
                sock.close()
            except Exception:
                pass

# --------------------------------------------------------------------------
# 5. MASTER UNIFIED SERVER RUNNER
# --------------------------------------------------------------------------
def run_all(http_port=8080, tuio_ports=[3333, 12000, 13000, 13100], tuio_ws_port=3334):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    print("=" * 72)
    print("      ALTAMA INTERACTIVE DIGITAL WALL - UNIFIED SENSOR SERVER")
    print("=" * 72)

    # 1. Start WebSocket Bridge
    ws_server = TuioWebSocketServer(host="0.0.0.0", port=tuio_ws_port)
    ws_server.start()
    print(f"[*] [WS BRIDGE]  WebSocket Bridge listening on ws://localhost:{tuio_ws_port}")

    # 2. Start Universal OSC Processor
    def on_touch_event(event):
        ws_server.broadcast(event)

    processor = UniversalOscProcessor(on_event=on_touch_event, cursor_timeout=0.35)

    # 3. Start Multi-Port UDP Receiver
    receiver = MultiPortOscReceiver(ports=tuio_ports, processor=processor)
    bound_ports = receiver.start()
    print(f"[*] [UDP SENSOR] Active UDP listeners on ports: {bound_ports}")
    print(f"    -> Port 3333  : Raw TUIO 1.1 / TUIO 2.0 Standard")
    print(f"    -> Port 12000 : Augmenta Simulator & Augmenta Hardware Default")
    print(f"    -> Port 13000 : Notch / Media Server TUIO Alternative")

    # 4. Start HTTP Server
    print(f"[*] [HTTP WEB]   Serving web application on http://localhost:{http_port}/")
    print("=" * 72)
    print("STATUS: Ready to receive TUIO & Augmenta Simulator touch signals.")
    print("Press Ctrl+C to stop.")
    print("")

    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass

    httpd = ThreadingHTTPServer(("0.0.0.0", http_port), QuietHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("")
        print("Stopping ALTAMA server...")
    finally:
        httpd.server_close()
        receiver.stop()
        processor.stop()
        ws_server.stop()
        print("Server stopped cleanly.")

if __name__ == "__main__":
    port = 8080
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    run_all(http_port=port)
