import socket
import struct
import time
import sys

def build_osc_string(s):
    b = s.encode('utf-8') + bytes([0])
    pad = (4 - (len(b) % 4)) % 4
    return b + (bytes([0]) * pad)

# 1. TUIO 1.1 Bundle
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

    bundle = b'#bundle' + bytes([0]) + struct.pack('>Q', 1)
    for msg in messages:
        bundle += struct.pack('>I', len(msg)) + msg
    return bundle

# 2. Augmenta Simulator OSC Message (/object/update)
def make_augmenta_object_update(frame_id, obj_id, x, y, age=1.0):
    addr = build_osc_string('/object/update')
    # format: [frame, id, oid, age, x, y, z, width, height, depth, speed, azim, elevation, ...]
    tags = build_osc_string(',iiifffffffffff')
    args = struct.pack('>iii12f', frame_id, obj_id, obj_id, float(age), float(x), float(y), 0.0, 0.5, 0.5, 1.5, 0.1, 0.0, 0.0, 0.0, 0.0)
    return addr + tags + args

def simulate_touch_hold(x=0.1, y=0.5, hold_seconds=1.2, mode="both"):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    print(f"[*] Simulating Touch Hold ({mode.upper()}) at (x={x}, y={y}) for {hold_seconds}s...")

    frame = 100
    cursor_id = 1
    start_time = time.time()

    # Loop frames at 30 Hz
    while time.time() - start_time < hold_seconds:
        frame += 1
        age = time.time() - start_time

        if mode in ("both", "tuio"):
            bundle = make_tuio_bundle(frame, [(cursor_id, x, y)])
            sock.sendto(bundle, ("127.0.0.1", 3333))

        if mode in ("both", "augmenta"):
            aug_msg = make_augmenta_object_update(frame, cursor_id, x, y, age)
            sock.sendto(aug_msg, ("127.0.0.1", 12000))
            sock.sendto(aug_msg, ("127.0.0.1", 3333))

        time.sleep(0.033)

    # Release touch
    frame += 1
    if mode in ("both", "tuio"):
        bundle_up = make_tuio_bundle(frame, [])
        sock.sendto(bundle_up, ("127.0.0.1", 3333))

    sock.close()
    print("[*] Simulation complete. Touch released.")

if __name__ == "__main__":
    mode = "both"
    x = 0.1
    y = 0.5
    dur = 1.2

    args = sys.argv[1:]
    if args and args[0] in ("tuio", "augmenta", "both"):
        mode = args[0]
        args = args[1:]

    if len(args) > 0:
        x = float(args[0])
    if len(args) > 1:
        y = float(args[1])
    if len(args) > 2:
        dur = float(args[2])

    simulate_touch_hold(x, y, dur, mode)
