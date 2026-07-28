// ============================================================================
//  types.ts - the transport seam. Everything above the transport (astronomy,
//  scene, UI) depends only on these types, so WebSerial / WebSocket / Mock are
//  interchangeable.
// ============================================================================
import type { OrientSample, StatusSample } from "./packet";

export type { OrientSample, StatusSample };

export type TransportStatus = "disconnected" | "connecting" | "connected" | "error";

export interface DeviceEvent {
  id: number;            // EVT.* from packet.ts
  body: Uint8Array;      // event-specific payload
}

export type Unsubscribe = () => void;

export interface Transport {
  readonly kind: "webserial" | "websocket" | "mock";
  readonly status: TransportStatus;

  connect(): Promise<void>;
  disconnect(): Promise<void>;

  /** Latest-wins orientation stream (50-100 Hz). */
  onOrient(cb: (s: OrientSample) => void): Unsubscribe;
  onStatus(cb: (s: StatusSample) => void): Unsubscribe;
  onEvent(cb: (e: DeviceEvent) => void): Unsubscribe;
  onStatusChange(cb: (s: TransportStatus) => void): Unsubscribe;

  /** Send an inbound CMD (see CMD.* in packet.ts). */
  sendCommand(cmd: number, args?: Uint8Array | number[]): Promise<void>;
}

// Tiny listener-set helper shared by the transport implementations.
export class Emitter<T> {
  private listeners = new Set<(v: T) => void>();
  add(cb: (v: T) => void): Unsubscribe { this.listeners.add(cb); return () => this.listeners.delete(cb); }
  emit(v: T) { for (const cb of this.listeners) cb(v); }
  clear() { this.listeners.clear(); }
}
