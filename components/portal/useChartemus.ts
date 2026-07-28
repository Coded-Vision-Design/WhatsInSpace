"use client";
// ============================================================================
//  useChartemus - owns the board link for the Portal. Keeps the 50 Hz quaternion
//  in a ref (no re-render), exposes connection control, the alignment correction,
//  and the observer location. The R3F scene reads qRef every frame.
// ============================================================================
import { useCallback, useEffect, useRef, useState } from "react";
import type { Transport, TransportStatus, OrientSample } from "@/lib/transport/types";
import { WebSerialTransport, isWebSerialSupported } from "@/lib/transport/WebSerialTransport";
import { MockTransport } from "@/lib/transport/MockTransport";
import { CMD, EVT } from "@/lib/transport/packet";
import {
  type Quat, type Vec3, deviceLookVector, altAzToVector,
} from "@/lib/astro/coordinates";
import { solveOneStar, solveTwoStar, type StarFix } from "@/lib/astro/alignment";
import type { ObserverLoc } from "@/lib/astro/ephemeris";

const IDENTITY: Quat = { w: 1, x: 0, y: 0, z: 0 };
// A sensible default observer (London) until geolocation resolves.
const DEFAULT_OBSERVER: ObserverLoc = { latDeg: 51.5072, lonDeg: -0.1276 };

export interface AimTarget { id: string; name: string; altDeg: number; azDeg: number; }

export function useChartemus() {
  const qRef = useRef<Quat>(IDENTITY);            // latest raw fused quaternion
  const transportRef = useRef<Transport | null>(null);
  const mockRef = useRef<MockTransport | null>(null);
  const fixesRef = useRef<StarFix[]>([]);
  const selectHandlerRef = useRef<(() => void) | null>(null);

  const [status, setStatus] = useState<TransportStatus>("disconnected");
  const [kind, setKind] = useState<Transport["kind"] | null>(null);
  const [qAlign, setQAlign] = useState<Quat>(IDENTITY);
  const [synced, setSynced] = useState(false);
  const [observer, setObserver] = useState<ObserverLoc>(DEFAULT_OBSERVER);
  // Detect after mount so server + first client render agree (avoids hydration mismatch).
  const [webSerialSupported, setWebSerialSupported] = useState(false);
  useEffect(() => { setWebSerialSupported(isWebSerialSupported()); }, []);

  const wireUp = useCallback((t: Transport) => {
    t.onOrient((s: OrientSample) => { qRef.current = s.q; });
    t.onStatusChange(setStatus);
    t.onEvent((e) => {
      if (e.id === EVT.SELECT) {
        selectHandlerRef.current?.();
      } else if (e.id === EVT.ALIGN_REPORT && e.body.length >= 8) {
        const dv = new DataView(e.body.buffer, e.body.byteOffset, e.body.byteLength);
        const qw = dv.getInt16(0, true) / 32767;
        const qx = dv.getInt16(2, true) / 32767;
        const qy = dv.getInt16(4, true) / 32767;
        const qz = dv.getInt16(6, true) / 32767;
        setQAlign({ w: qw, x: qx, y: qy, z: qz });
        setSynced(true);
      } else if (e.id === EVT.SYNC_DONE && e.body.length >= 3) {
        const mode = e.body[0];
        const res = new DataView(e.body.buffer, e.body.byteOffset, e.body.byteLength).getInt16(1, true) / 10;
        console.log(`[chartemus] sync done, mode: ${mode}, residual: ${res}°`);
      }
    });
  }, []);

  const sendCommand = useCallback((cmd: number, args?: number[] | Uint8Array) => {
    return transportRef.current?.sendCommand(cmd, args);
  }, []);

  /** Register what happens when the board's SELECT event fires. */
  const setOnBoardSelect = useCallback((cb: (() => void) | null) => { selectHandlerRef.current = cb; }, []);

  const connect = useCallback(async (useMock: boolean) => {
    await transportRef.current?.disconnect().catch(() => {});
    const t: Transport = useMock ? new MockTransport({ mode: "synthetic", hz: 50 }) : new WebSerialTransport();
    transportRef.current = t;
    mockRef.current = useMock ? (t as MockTransport) : null;
    setKind(t.kind);
    wireUp(t);
    await t.connect();
  }, [wireUp]);

  const disconnect = useCallback(async () => {
    await transportRef.current?.disconnect().catch(() => {});
    transportRef.current = null; mockRef.current = null;
    setKind(null);
  }, []);

  // --- alignment (host-side; the firmware gets its own in firmware Phase 2) ---
  const rawLookVector = useCallback((): Vec3 => deviceLookVector(qRef.current), []);

  const captureOneStar = useCallback((target: AimTarget) => {
    const fix: StarFix = {
      vDev: rawLookVector(),
      vTrue: altAzToVector(target.altDeg, target.azDeg),
      targetId: target.id,
    };
    fixesRef.current = [fix];
    setQAlign(solveOneStar(fix));
    setSynced(true);

    const args = new Uint8Array(5);
    args[0] = 1; // star 1
    const altVal = Math.round(target.altDeg * 100);
    const azVal = Math.round(target.azDeg * 100);
    args[1] = altVal & 0xff;
    args[2] = (altVal >> 8) & 0xff;
    args[3] = azVal & 0xff;
    args[4] = (azVal >> 8) & 0xff;
    void sendCommand(CMD.BEGIN_SYNC, args);
  }, [rawLookVector, sendCommand]);

  const captureSecondStar = useCallback((target: AimTarget) => {
    const fix: StarFix = {
      vDev: rawLookVector(),
      vTrue: altAzToVector(target.altDeg, target.azDeg),
      targetId: target.id,
    };
    const fixes = [...fixesRef.current, fix].slice(-2);
    fixesRef.current = fixes;
    if (fixes.length === 2) {
      setQAlign(solveTwoStar(fixes[0], fixes[1]));
      setSynced(true);

      const args = new Uint8Array(5);
      args[0] = 2; // star 2
      const altVal = Math.round(target.altDeg * 100);
      const azVal = Math.round(target.azDeg * 100);
      args[1] = altVal & 0xff;
      args[2] = (altVal >> 8) & 0xff;
      args[3] = azVal & 0xff;
      args[4] = (azVal >> 8) & 0xff;
      void sendCommand(CMD.BEGIN_SYNC, args);
    }
  }, [rawLookVector, sendCommand]);

  const resetAlignment = useCallback(() => {
    fixesRef.current = [];
    setQAlign(IDENTITY);
    setSynced(false);
    void sendCommand(CMD.ABORT_SYNC);
  }, [sendCommand]);

  const requestGeolocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setObserver({ latDeg: p.coords.latitude, lonDeg: p.coords.longitude, heightM: p.coords.altitude ?? 0 }),
      () => {/* keep default; user can set manually */},
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, []);

  useEffect(() => () => { transportRef.current?.disconnect().catch(() => {}); }, []);

  /** Drive the synthetic mock aim from a pointer/slider (no-op with a real board). */
  const driveMock = useCallback((yawDeg: number, pitchDeg: number) => {
    mockRef.current?.setYawPitch(yawDeg, pitchDeg);
  }, []);

  return {
    qRef, qAlign, synced,
    status, kind, webSerialSupported,
    observer, setObserver, requestGeolocation,
    connect, disconnect, sendCommand, driveMock, setOnBoardSelect,
    captureOneStar, captureSecondStar, resetAlignment,
    CMD,
  };
}

export type Chartemus = ReturnType<typeof useChartemus>;
