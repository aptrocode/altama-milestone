import socket
import struct
import time
import sys

def build_osc_string(s):
    b = s.encode('utf-8') + b'\x00'
    pad = (4 - (len(b) % 4)) % 4
    return b + (b'\x00' * pad)

def make_tuio_bundle(frame_id, active_cursors):
    messages = []
    alive_addr = build_osc_string('/tuio/2Dcur')
    alive_tags = build_osc_string(',' + 's' + ('i' * len(active_cursors)))
    alive_args = build_osc_string('alive') + b''.join(struct.pack('>i', s_id) for s_id, _, _ in active_cursors)
    messages.append(alive_addr + alive_tags + alive_args)

    for s_id, x, y in active_cursors:
        set_addr = build_osc_string('/tuio/2Dcur')
        set_tags = build_osc_string(',sifffff')
        set_args = build_osc_string('set') + struct.pack('>i5f', s_id, float(x), float(y), 0.0, 0.0, 0.0)
        messages.append(set_addr + set_tags + set_args)

    fseq_addr = build_osc_string('/tuio/2Dcur')
    fseq_tags = build_osc_string(',si')
    fseq_args = build_osc_string('fseq') + struct.pack('>i', frame_id)
    messages.append(fseq_addr + fseq_tags + fseq_args)

    bundle = b'#bundle\x00' + struct.pack('>Q', 1)
    for msg in messages:
        bundle += struct.pack('>I', len(msg)) + msg
    return bundle

def simulate_touch_hold(x=0.1, y=0.5, hold_seconds=1.2, host="127.0.0.1", port=3333):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    print(f"[*] Sending TUIO Touch Hold test to UDP {host}:{port} at ({x}, {y}) for {hold_seconds}s...")

    frame = 100
    cursor_id = 1

    # 1. Touch Down
    bundle_down = make_tuio_bundle(frame, [(cursor_id, x, y)])
    sock.sendto(bundle_down, (host, port))
    print(f"[+] Frame {frame}: Touch DOWN sent (Cursor {cursor_id})")

    # 2. Hold with keep-alive
    start_time = time.time()
    while time.time() - start_time < hold_seconds:
        time.sleep(0.05)
        frame += 1
        bundle_hold = make_tuio_bundle(frame, [(cursor_id, x, y)])
        sock.sendto(bundle_hold, (host, port))

    # 3. Touch Up
    frame += 1
    bundle_up = make_tuio_bundle(frame, [])
    sock.sendto(bundle_up, (host, port))
    print(f"[+] Frame {frame}: Touch UP sent (Cursor {cursor_id} released)")
    sock.close()
    print("[*] TUIO simulation finished successfully.")

if __name__ == "__main__":
    x = float(sys.argv[1]) if len(sys.argv) > 1 else 0.1
    y = float(sys.argv[2]) if len(sys.argv) > 2 else 0.5
    duration = float(sys.argv[3]) if len(sys.argv) > 3 else 1.2
    simulate_touch_hold(x, y, duration)
