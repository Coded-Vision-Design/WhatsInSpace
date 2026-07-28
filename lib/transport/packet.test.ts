import { describe, it, expect } from "vitest";
import {
  crc8, cobsEncode, cobsDecode, buildFrame, buildCommand, parsePayload,
  parseOrient, FrameReader, PKT, CMD,
} from "./packet";

function orientBody(q: number[], altDeg: number, azDeg: number, flags: number, seq: number): Uint8Array {
  const b = new Uint8Array(14);
  const dv = new DataView(b.buffer);
  dv.setInt16(0, Math.round(q[0] * 32767), true);
  dv.setInt16(2, Math.round(q[1] * 32767), true);
  dv.setInt16(4, Math.round(q[2] * 32767), true);
  dv.setInt16(6, Math.round(q[3] * 32767), true);
  dv.setInt16(8, Math.round(altDeg * 100), true);
  dv.setInt16(10, Math.round(azDeg * 100), true);
  dv.setUint8(12, flags);
  dv.setUint8(13, seq);
  return b;
}

describe("COBS", () => {
  it("round-trips data containing zero bytes", () => {
    for (const input of [[1, 2, 3], [0, 0, 0], [0, 1, 0, 2], [255, 0, 255], []]) {
      const enc = cobsEncode(input);
      expect(Array.from(enc)).not.toContain(0); // no zeros inside an encoded payload
      expect(Array.from(cobsDecode(enc)!)).toEqual(input);
    }
  });

  it("round-trips a 300-byte run (forces a 0xFF block split)", () => {
    const input = Array.from({ length: 300 }, (_, i) => (i % 254) + 1);
    expect(Array.from(cobsDecode(cobsEncode(input))!)).toEqual(input);
  });
});

describe("CRC8", () => {
  it("is deterministic and order-sensitive", () => {
    expect(crc8([1, 2, 3])).toBe(crc8([1, 2, 3]));
    expect(crc8([1, 2, 3])).not.toBe(crc8([3, 2, 1]));
  });
});

describe("frames", () => {
  it("builds and parses a frame round-trip", () => {
    const body = [10, 20, 30];
    const frame = buildFrame(PKT.STATUS, body);
    expect(frame[frame.length - 1]).toBe(0); // delimiter
    const payload = cobsDecode(frame.subarray(0, frame.length - 1))!;
    const parsed = parsePayload(payload)!;
    expect(parsed.type).toBe(PKT.STATUS);
    expect(Array.from(parsed.body)).toEqual(body);
  });

  it("rejects a corrupted payload (bad CRC)", () => {
    const frame = buildFrame(PKT.STATUS, [1, 2, 3]);
    const payload = cobsDecode(frame.subarray(0, frame.length - 1))!;
    payload[payload.length - 1] ^= 0xff; // flip the CRC
    expect(parsePayload(payload)).toBeNull();
  });

  it("builds a command with args", () => {
    const f = buildCommand(CMD.SET_BRIGHTNESS, [42]);
    const parsed = parsePayload(cobsDecode(f.subarray(0, f.length - 1))!)!;
    expect(parsed.type).toBe(PKT.CMD);
    expect(Array.from(parsed.body)).toEqual([CMD.SET_BRIGHTNESS, 42]);
  });
});

describe("FrameReader", () => {
  it("parses an ORIENT frame and reassembles across split chunks", () => {
    const body = orientBody([1, 0, 0, 0], 42.3, 128.7, 0x21, 7);
    const frame = buildFrame(PKT.ORIENT, body);

    const reader = new FrameReader();
    // Feed the frame split into two arbitrary chunks.
    const mid = Math.floor(frame.length / 2);
    expect(reader.push(frame.subarray(0, mid))).toHaveLength(0);
    const frames = reader.push(frame.subarray(mid));
    expect(frames).toHaveLength(1);

    const o = parseOrient(frames[0].body)!;
    expect(o.q.w).toBeCloseTo(1, 3);
    expect(o.altDeg).toBeCloseTo(42.3, 1);
    expect(o.azDeg).toBeCloseTo(128.7, 1);
    expect(o.flags).toBe(0x21);
    expect(o.seq).toBe(7);
  });

  it("recovers after a garbage byte run then a clean frame", () => {
    const reader = new FrameReader();
    reader.push(Uint8Array.from([5, 6, 7])); // partial junk, no delimiter
    const frame = buildFrame(PKT.STATUS, [9]);
    const frames = reader.push(Uint8Array.from([0, ...frame])); // delimiter flushes junk, then a good frame
    expect(frames).toHaveLength(1);
    expect(frames[0].type).toBe(PKT.STATUS);
  });
});
