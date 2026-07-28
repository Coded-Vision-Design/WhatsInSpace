// ============================================================================
//  MockTransport - drive the whole app with no board attached.
//   - "synthetic": a slow yaw sweep + pitch bob (also steerable via setYawPitch
//     from a dev control or pointer), so you can "point" with the mouse.
//   - "replay": loop a recorded array of OrientSamples (deterministic - ideal
//     for tests and visual checks).
// ============================================================================
import {
  type Transport, type TransportStatus, type DeviceEvent, Emitter,
} from "./types";
import { type OrientSample, type StatusSample, FLAG, CMD } from "./packet";
import { qFromYawPitch, deviceLookVector, vectorToAltAz } from "../astro/coordinates";

export interface MockOptions {
  mode?: "synthetic" | "replay";
  replay?: OrientSample[];
  hz?: number;
}

export class MockTransport implements Transport {
  readonly kind = "mock" as const;
  private _status: TransportStatus = "disconnected";
  private orient = new Emitter<OrientSample>();
  private statusE = new Emitter<StatusSample>();
  private event = new Emitter<DeviceEvent>();
  private change = new Emitter<TransportStatus>();

  private timer: ReturnType<typeof setInterval> | null = null;
  private t0 = 0;
  private seq = 0;
  private idx = 0;
  private yawDeg = 0;
  private pitchDeg = 30;
  private manual = false;   // true once a pointer/slider drives the aim

  constructor(private opts: MockOptions = {}) {}

  get status() { return this._status; }
  private setStatus(s: TransportStatus) { this._status = s; this.change.emit(s); }

  onOrient(cb: (s: OrientSample) => void) { return this.orient.add(cb); }
  onStatus(cb: (s: StatusSample) => void) { return this.statusE.add(cb); }
  onEvent(cb: (e: DeviceEvent) => void) { return this.event.add(cb); }
  onStatusChange(cb: (s: TransportStatus) => void) { return this.change.add(cb); }

  async connect() {
    this.setStatus("connected");
    const hz = this.opts.hz ?? 50;
    this.t0 = Date.now();
    this.timer = setInterval(() => this.tick(Date.now() - this.t0), 1000 / hz);
  }

  async disconnect() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.setStatus("disconnected");
  }

  /** Steer the synthetic pointer (e.g. from a dev slider or pointer move). */
  setYawPitch(yawDeg: number, pitchDeg: number) {
    this.manual = true;
    this.yawDeg = ((yawDeg % 360) + 360) % 360;
    this.pitchDeg = Math.max(-89, Math.min(89, pitchDeg));
  }

  /** One frame of output. Public so tests can drive it without timers. */
  tick(tMs: number): OrientSample {
    let sample: OrientSample;
    if (this.opts.mode === "replay" && this.opts.replay?.length) {
      sample = this.opts.replay[this.idx % this.opts.replay.length];
      this.idx++;
    } else {
      // Manual once a pointer drives it; otherwise a gentle auto sweep for demos.
      const yaw = this.manual ? this.yawDeg : (this.yawDeg + tMs * 0.02) % 360;
      const pitch = this.manual ? this.pitchDeg : this.pitchDeg + 10 * Math.sin(tMs * 0.0006);
      const q = qFromYawPitch(yaw, pitch);
      const { altDeg, azDeg } = vectorToAltAz(deviceLookVector(q));
      sample = { q, altDeg, azDeg, flags: FLAG.HOST | FLAG.SYNCED, seq: this.seq++ & 0xff };
    }
    this.orient.emit(sample);
    return sample;
  }

  emitEvent(id: number, body: Uint8Array = new Uint8Array()) { this.event.emit({ id, body }); }

  async sendCommand(cmd: number, _args: Uint8Array | number[] = []) {
    if (cmd === CMD.PING) {
      const s: StatusSample = { battPct: 100, aligned: true, syncAgeS: 0, fwVersion: 1, flags: FLAG.HOST, rateHz: 50 };
      this.statusE.emit(s);
    }
  }
}
