// ============================================================================
//  packet.ts - Chartemus wire protocol, the TS mirror of the firmware's
//  src/proto.h. COBS-framed, little-endian binary, CRC8 (poly 0x07).
//    frame  = COBS(payload) + 0x00
//    payload = TYPE(1) + LEN(1) + BODY(LEN) + CRC8(1)   (CRC over TYPE+LEN+BODY)
//  Keep this in lockstep with proto.h.
// ============================================================================

export const PKT = { ORIENT: 0x01, STATUS: 0x02, EVENT: 0x03, LOG: 0x04, CMD: 0x80 } as const;

export const FLAG = {
  SYNCED: 0x01, MAG_ACTIVE: 0x02, MOVING: 0x04, LOW_BATT: 0x08, CALIBRATING: 0x10, HOST: 0x20,
} as const;

export const EVT = {
  SELECT: 0x10, SYNC_CAPTURE: 0x11, SYNC_DONE: 0x12, RECENTER: 0x13, BACK: 0x14, TAP: 0x15, ALIGN_REPORT: 0x16,
} as const;


export const CMD = {
  BEGIN_SYNC: 0x01, ABORT_SYNC: 0x02, SET_TARGET: 0x03, SET_BRIGHTNESS: 0x04,
  CALIB_GYRO: 0x05, CALIB_MAG: 0x06, RECENTER: 0x07, SET_RATE: 0x08, PING: 0x09,
} as const;

// ---- CRC8, poly 0x07, init 0x00 -------------------------------------------
export function crc8(data: Uint8Array | number[]): number {
  let crc = 0;
  for (const b of data) {
    crc ^= b & 0xff;
    for (let i = 0; i < 8; i++) crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
  }
  return crc;
}

// ---- COBS -----------------------------------------------------------------
export function cobsEncode(src: Uint8Array | number[]): Uint8Array {
  const dst: number[] = [0];
  let code = 1, codePos = 0;
  for (const raw of src) {
    const b = raw & 0xff;
    if (b === 0) { dst[codePos] = code; codePos = dst.push(0) - 1; code = 1; }
    else {
      dst.push(b); code++;
      if (code === 0xff) { dst[codePos] = code; codePos = dst.push(0) - 1; code = 1; }
    }
  }
  dst[codePos] = code;
  return Uint8Array.from(dst);
}

export function cobsDecode(src: Uint8Array): Uint8Array | null {
  const dst: number[] = [];
  let i = 0;
  while (i < src.length) {
    const code = src[i++];
    if (code === 0) return null;
    for (let j = 1; j < code; j++) { if (i >= src.length) return null; dst.push(src[i++]); }
    if (code !== 0xff && i < src.length) dst.push(0);
  }
  return Uint8Array.from(dst);
}

// ---- framing --------------------------------------------------------------
/** Build a full on-wire frame (COBS payload + 0x00 delimiter). */
export function buildFrame(type: number, body: Uint8Array | number[] = []): Uint8Array {
  const payload = [type & 0xff, body.length & 0xff, ...Array.from(body, (b) => b & 0xff)];
  payload.push(crc8(payload));
  const enc = cobsEncode(payload);
  return Uint8Array.from([...enc, 0]);
}

export function buildCommand(cmd: number, args: Uint8Array | number[] = []): Uint8Array {
  return buildFrame(PKT.CMD, [cmd, ...Array.from(args, (a) => a & 0xff)]);
}

export interface Frame { type: number; body: Uint8Array; }

/** Validate + split a single decoded payload into {type, body}, or null if bad. */
export function parsePayload(payload: Uint8Array): Frame | null {
  if (payload.length < 3) return null;
  const type = payload[0], len = payload[1];
  if (len + 3 !== payload.length) return null;
  if (crc8(payload.subarray(0, 2 + len)) !== payload[2 + len]) return null;
  return { type, body: payload.subarray(2, 2 + len) };
}

// ---- typed bodies ---------------------------------------------------------
export interface OrientSample {
  q: { w: number; x: number; y: number; z: number };
  altDeg: number; azDeg: number; flags: number; seq: number;
}

export function parseOrient(body: Uint8Array): OrientSample | null {
  if (body.length < 14) return null;
  const dv = new DataView(body.buffer, body.byteOffset, body.byteLength);
  return {
    q: {
      w: dv.getInt16(0, true) / 32767, x: dv.getInt16(2, true) / 32767,
      y: dv.getInt16(4, true) / 32767, z: dv.getInt16(6, true) / 32767,
    },
    altDeg: dv.getInt16(8, true) / 100,
    azDeg: dv.getInt16(10, true) / 100,
    flags: dv.getUint8(12),
    seq: dv.getUint8(13),
  };
}

export interface StatusSample {
  battPct: number; aligned: boolean; syncAgeS: number; fwVersion: number; flags: number; rateHz: number;
}

export function parseStatus(body: Uint8Array): StatusSample | null {
  if (body.length < 10) return null;
  const dv = new DataView(body.buffer, body.byteOffset, body.byteLength);
  return {
    battPct: dv.getUint8(0),
    aligned: dv.getUint8(1) !== 0,
    syncAgeS: dv.getUint8(2) | (dv.getUint8(3) << 8),
    fwVersion: dv.getUint8(6),
    flags: dv.getUint8(7),
    rateHz: dv.getUint8(8),
  };
}

// ---- stateful reassembly over arbitrary chunk boundaries ------------------
export class FrameReader {
  private buf: number[] = [];
  /** Feed raw serial bytes; returns any complete, valid frames found. */
  push(bytes: Uint8Array): Frame[] {
    const out: Frame[] = [];
    for (const b of bytes) {
      if (b === 0) {
        if (this.buf.length) {
          const payload = cobsDecode(Uint8Array.from(this.buf));
          if (payload) { const f = parsePayload(payload); if (f) out.push(f); }
        }
        this.buf = [];
      } else {
        this.buf.push(b);
        if (this.buf.length > 1024) this.buf = []; // overflow guard, resync on next 0x00
      }
    }
    return out;
  }
  reset() { this.buf = []; }
}
