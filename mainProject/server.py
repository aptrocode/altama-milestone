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
# 1. OSC & TUIO 1.1 PROTOCOL PARSER (Pure Python Standard Library)
# --------------------------------------------------------------------------
def parse_osc_string(data, offset):
    end = data.find(b'\x00', offset)
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
    if data.startswith(b'#bundle\x00'):
        offset = 16 # Skip #bundle and 8-byte timetag
        while offset < len(data):
            if offset + 4 > len(data):
                break
            size = struct.unpack('>I', data[offset:offset+4])[0]
            offset += 4
            msg_data = data[offset:offset+size]
            offset += size
            if msg_data.startswith(b'#bundle\x00'):
                messages.extend(parse_tuio_packet(msg_data))
            else:
                addr, args = parse_osc_message(msg_data)
                messages.append((addr, args))
    else:
        addr, args = parse_osc_message(data)
        messages.append((addr, args))
    return messages

# --------------------------------------------------------------------------
# 2. WEBSOCKET SERVER (RFC 6455 Pure Python)
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
            for line in req.split('\r\n'):
                if line.lower().startswith('sec-websocket-key:'):
                    key = line.split(':', 1)[1].strip()
                    break
            if not key:
                sock.close()
                return

            accept_val = base64.b64encode(hashlib.sha1((key + WS_GUID).encode('utf-8')).digest()).decode('utf-8')
            resp = (
                "HTTP/1.1 101 Switching Protocols\r\n"
                "Upgrade: websocket\r\n"
                "Connection: Upgrade\r\n"
                f"Sec-WebSocket-Accept: {accept_val}\r\n\r\n"
            )
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
# 3. TUIO UDP RECEIVER (PORT 3333)
# --------------------------------------------------------------------------
class TuioUdpReceiver:
    def __init__(self, host="0.0.0.0", port=3333, on_event=None):
        self.host = host
        self.port = port
        self.on_event = on_event
        self.running = False
        self.sock = None
        self.active_cursors = {} # s_id -> (x, y)

    def start(self):
        self.running = True
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.bind((self.host, self.port))
        threading.Thread(target=self._listen_loop, daemon=True).start()

    def _listen_loop(self):
        while self.running:
            try:
                data, addr = self.sock.recvfrom(65535)
                if data:
                    self._handle_packet(data)
            except Exception:
                break

    def _handle_packet(self, data):
        messages = parse_tuio_packet(data)
        for addr, args in messages:
            if addr == '/tuio/2Dcur':
                if not args:
                    continue
                cmd = args[0]
                if cmd == 'alive':
                    # Cursor IDs active in this frame
                    current_alive = set(args[1:])
                    for s_id in list(self.active_cursors.keys()):
                        if s_id not in current_alive:
                            x, y = self.active_cursors.pop(s_id)
                            if self.on_event:
                                self.on_event({
                                    "type": "pointerup",
                                    "id": s_id,
                                    "x": x,
                                    "y": y
                                })
                elif cmd == 'set':
                    # args: ['set', s_id, x, y, X, Y, m]
                    if len(args) >= 4:
                        s_id = args[1]
                        x = float(args[2])
                        y = float(args[3])
                        if s_id not in self.active_cursors:
                            self.active_cursors[s_id] = (x, y)
                            if self.on_event:
                                self.on_event({
                                    "type": "pointerdown",
                                    "id": s_id,
                                    "x": x,
                                    "y": y
                                })
                        else:
                            self.active_cursors[s_id] = (x, y)
                            if self.on_event:
                                self.on_event({
                                    "type": "pointermove",
                                    "id": s_id,
                                    "x": x,
                                    "y": y
                                })

    def stop(self):
        self.running = False
        if self.sock:
            try:
                self.sock.close()
            except Exception:
                pass

# --------------------------------------------------------------------------
# 4. MASTER UNIFIED SERVER RUNNER
# --------------------------------------------------------------------------
def run_all(http_port=8080, tuio_udp_port=3333, tuio_ws_port=3334):
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    print("=" * 68)
    print("       ALTAMA INTERACTIVE DIGITAL WALL - UNIFIED SERVER")
    print("=" * 68)

    # 1. Start WebSocket Bridge
    ws_server = TuioWebSocketServer(host="0.0.0.0", port=tuio_ws_port)
    ws_server.start()
    print(f"[*] [TUIO WS]  WebSocket Bridge listening on ws://localhost:{tuio_ws_port}")

    # 2. Start TUIO UDP Receiver
    def on_tuio_event(event):
        ws_server.broadcast(event)

    tuio_receiver = TuioUdpReceiver(host="0.0.0.0", port=tuio_udp_port, on_event=on_tuio_event)
    tuio_receiver.start()
    print(f"[*] [TUIO UDP] Raw TUIO UDP listener ACTIVE on port {tuio_udp_port}")

    # 3. Start HTTP Server
    print(f"[*] [HTTP]     Serving web application on http://localhost:{http_port}/")
    print("=" * 68)
    print("Ready to receive raw TUIO input (touch/pointer). Press Ctrl+C to stop.\n")

    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            # Suppress excessive HTTP log output
            pass

    httpd = ThreadingHTTPServer(("0.0.0.0", http_port), QuietHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping ALTAMA server...")
    finally:
        httpd.server_close()
        tuio_receiver.stop()
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
