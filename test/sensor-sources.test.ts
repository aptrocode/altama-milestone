import { describe, expect, it } from 'vitest';
import { AugmentaReceiver, normalizedToWall, TuioReceiver } from '../sensor-service/normalized';
import { createOscBundle, createOscMessage, parseOscPacket } from '../shared/osc';

const f = (float: number) => ({ float });

describe('augmenta OSC', () => {
  it('reads protocol v2 objects (frame, id, slotid, age, centroid) and their leave', () => {
    const receiver = new AugmentaReceiver();
    receiver.handle(parseOscPacket(createOscMessage('/object/enter', [10, 42, 0, f(0.1), f(0.25), f(0.5), f(0), f(0)])), 0);
    receiver.handle(parseOscPacket(createOscMessage('/object/update/extra', [11, 42, 0, f(0.9), f(0.9), f(3), f(0.5)])), 10);
    receiver.handle(parseOscPacket(createOscMessage('/scene', [11, 1, f(4), f(3)])), 10);
    expect(receiver.contacts(20)).toEqual([{ id: 'augmenta-42', x: 0.25, y: 0.5 }]);
    receiver.handle(parseOscPacket(createOscMessage('/object/leave', [12, 42, 0, f(0.2), f(0.25), f(0.5)])), 30);
    expect(receiver.contacts(40)).toEqual([]);
  });

  it('reads protocol v1 persons and expires silent objects', () => {
    const receiver = new AugmentaReceiver(500);
    receiver.handle(parseOscPacket(createOscMessage('/au/personUpdated', [7, 1, 30, f(0.75), f(0.125)])), 0);
    expect(receiver.contacts(100)).toEqual([{ id: 'augmenta-7', x: 0.75, y: 0.125 }]);
    expect(receiver.contacts(600)).toEqual([]);
    receiver.handle(parseOscPacket(createOscMessage('/au/personEntered', [8, 1, 0, f(0.5), f(0.5)])), 700);
    receiver.handle(parseOscPacket(createOscMessage('/au/personWillLeave', [8, 1, 9, f(0.5), f(0.5)])), 710);
    expect(receiver.contacts(720)).toEqual([]);
  });
});

describe('tUIO 1.1 cursors', () => {
  function frame(alive: number[], sets: [number, number, number][], fseq: number) {
    return parseOscPacket(createOscBundle([
      createOscMessage('/tuio/2Dcur', ['source', 'sim']),
      createOscMessage('/tuio/2Dcur', ['alive', ...alive]),
      ...sets.map(([id, x, y]) => createOscMessage('/tuio/2Dcur', ['set', id, f(x), f(y), f(0), f(0), f(0)])),
      createOscMessage('/tuio/2Dcur', ['fseq', fseq]),
    ]));
  }

  it('follows alive/set and removes cursors missing from alive', () => {
    const receiver = new TuioReceiver();
    receiver.handle(frame([1, 2], [[1, 0.1, 0.2], [2, 0.5, 0.5]], 1), 0);
    expect(receiver.contacts(10)).toEqual([{ id: 'tuio-1', x: expect.closeTo(0.1, 5), y: expect.closeTo(0.2, 5) }, { id: 'tuio-2', x: 0.5, y: 0.5 }]);
    receiver.handle(frame([2], [[2, 0.6, 0.5]], 2), 20);
    expect(receiver.contacts(30)).toEqual([{ id: 'tuio-2', x: expect.closeTo(0.6, 5), y: 0.5 }]);
    receiver.handle(frame([], [], 3), 40);
    expect(receiver.contacts(50)).toEqual([]);
  });

  it('clears everything when packets stop', () => {
    const receiver = new TuioReceiver(1_000);
    receiver.handle(frame([5], [[5, 0.5, 0.5]], 1), 0);
    expect(receiver.contacts(900)).toHaveLength(1);
    expect(receiver.contacts(1_100)).toEqual([]);
  });
});

describe('normalized mapping', () => {
  it('scales to the logical canvas, optionally inverting Y, and drops points outside 0–1', () => {
    const contacts = [{ id: 'a', x: 0.5, y: 0.25 }, { id: 'b', x: 1.2, y: 0.5 }, { id: 'c', x: 0.1, y: -0.1 }];
    expect(normalizedToWall(contacts, { invertY: false })).toEqual([{ id: 'a', x: 1152, y: 336 }]);
    expect(normalizedToWall(contacts, { invertY: true })).toEqual([{ id: 'a', x: 1152, y: 1008 }]);
  });
});
