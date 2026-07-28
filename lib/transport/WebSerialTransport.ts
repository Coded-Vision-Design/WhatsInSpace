// ============================================================================
//  WebSerialTransport - reads the firmware's USB-CDC stream via the Web Serial
//  API (Chromium, secure context). Parses frames with the shared packet.ts, so
//  a WebSocketTransport can later reuse the exact same parsing.
// ============================================================================
import {
  type Transport, type TransportStatus, type DeviceEvent, Emitter,
} from "./types";
import {
  FrameReader, PKT, parseOrient, parseStatus, buildCommand,
  type OrientSample, type StatusSample,
} from "./packet";

// Minimal Web Serial typings (not yet in lib.dom).
interface SerialPortLike {
  open(opts: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
}
interface SerialLike { requestPort(): Promise<SerialPortLike>; }

export function isWebSerialSupported(): boolean {
  return typeof navigator !== "undefined" && "serial" in navigator;
}

export class WebSerialTransport implements Transport {
  readonly kind = "webserial" as const;
  private _status: TransportStatus = "disconnected";
  private orient = new Emitter<OrientSample>();
  private statusE = new Emitter<StatusSample>();
  private event = new Emitter<DeviceEvent>();
  private change = new Emitter<TransportStatus>();

  private port: SerialPortLike | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private frames = new FrameReader();
  private reading = false;

  constructor(private baudRate = 115200) {}

  get status() { return this._status; }
  private setStatus(s: TransportStatus) { this._status = s; this.change.emit(s); }

  onOrient(cb: (s: OrientSample) => void) { return this.orient.add(cb); }
  onStatus(cb: (s: StatusSample) => void) { return this.statusE.add(cb); }
  onEvent(cb: (e: DeviceEvent) => void) { return this.event.add(cb); }
  onStatusChange(cb: (s: TransportStatus) => void) { return this.change.add(cb); }

  async connect() {
    if (!isWebSerialSupported()) throw new Error("Web Serial not supported (use Chrome or Edge on desktop)");
    this.setStatus("connecting");
    try {
      const serial = (navigator as unknown as { serial: SerialLike }).serial;
      this.port = await serial.requestPort();           // requires a user gesture
      await this.port.open({ baudRate: this.baudRate });
      this.writer = this.port.writable!.getWriter();
      this.setStatus("connected");
      this.reading = true;
      void this.readLoop();
      // Handshake so we know we are really talking to Chartemus.
      await this.sendCommand(0x09 /* CMD.PING */);
    } catch (e) {
      this.setStatus("error");
      throw e;
    }
  }

  private async readLoop() {
    this.reader = this.port!.readable!.getReader();
    try {
      while (this.reading) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (!value) continue;
        for (const f of this.frames.push(value)) this.dispatch(f.type, f.body);
      }
    } catch {
      if (this.reading) this.setStatus("error");
    } finally {
      try { this.reader?.releaseLock(); } catch { /* already released */ }
    }
  }

  private dispatch(type: number, body: Uint8Array) {
    if (type === PKT.ORIENT) { const s = parseOrient(body); if (s) this.orient.emit(s); }
    else if (type === PKT.STATUS) { const s = parseStatus(body); if (s) this.statusE.emit(s); }
    else if (type === PKT.EVENT && body.length) this.event.emit({ id: body[0], body: body.subarray(1) });
    else if (type === PKT.LOG) console.debug("[chartemus]", new TextDecoder().decode(body));
  }

  async sendCommand(cmd: number, args: Uint8Array | number[] = []) {
    if (!this.writer) return;
    await this.writer.write(buildCommand(cmd, args));
  }

  async disconnect() {
    this.reading = false;
    try { await this.reader?.cancel(); } catch { /* noop */ }
    try { this.writer?.releaseLock(); } catch { /* noop */ }
    try { await this.port?.close(); } catch { /* noop */ }
    this.port = null; this.reader = null; this.writer = null;
    this.frames.reset();
    this.setStatus("disconnected");
  }
}
