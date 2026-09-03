"use client";
// ============================================================================
//  PortalClient - composes the Portal: loads the live sky, drives SkyScene with
//  the board's orientation, and overlays the reticle, HUD, connection controls
//  and the alignment wizard. Works fully with the synthetic mock (drag to look)
//  so it is usable before a board is flashed.
// ============================================================================
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import { useChartemus, type AimTarget } from "@/components/portal/useChartemus";
import {
  loadStars, loadConstellations, starsToSky,
  type CatalogStar, type ConstellationLine, type SkyStar,
} from "@/lib/astro/starCatalogue";
import { solarSystemSky, type SkyBody } from "@/lib/astro/ephemeris";
import { fetchISSTLE, satelliteLook, type TLE } from "@/lib/astro/satellites";
import {
  vectorToAltAz, altAzToVector, dot, normalize, type Vec3,
} from "@/lib/astro/coordinates";
import BodyInfoPanel, { type StarInfo } from "@/components/portal/BodyInfoPanel";

const SkyScene = dynamic(() => import("@/components/portal/SkyScene"), { ssr: false });
const PlanetZoom = dynamic(() => import("@/components/portal/PlanetZoom"), { ssr: false });

const AIM_THRESHOLD = Math.cos((4 * Math.PI) / 180); // ~4 degrees

export default function PortalClient() {
  const c = useChartemus();
  const [stars, setStars] = useState<SkyStar[]>([]);
  const [bodies, setBodies] = useState<SkyBody[]>([]);
  const [constellations, setConstellations] = useState<ConstellationLine[]>([]);
  const [aim, setAim] = useState<{ alt: number; az: number; id: string | null; name: string }>({ alt: 0, az: 0, id: null, name: "" });
  const [wizardOpen, setWizardOpen] = useState(false);
  const [objectsOpen, setObjectsOpen] = useState(false);
  const [selected, setSelected] = useState<{ body?: SkyBody; star?: StarInfo } | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [iss, setIss] = useState<SkyBody | null>(null);
  const [flyTo, setFlyTo] = useState<string | null>(null);

  const starsRef = useRef<SkyStar[]>([]);
  const allBodiesRef = useRef<SkyBody[]>([]);
  const tleRef = useRef<TLE | null>(null);
  const aimVec = useRef({ yaw: 0, pitch: 30 });
  const aimDataRef = useRef<{ id: string | null; name: string }>({ id: null, name: "" });
  const drag = useRef<{ x: number; y: number } | null>(null);

  const connected = c.status === "connected";
  const highlightBodyId = aim.id && !aim.id.startsWith("star:") ? aim.id : null;
  const locked = connected && !!aim.name;

  const handleConnect = async (useMock: boolean) => {
    setConnectError(null);
    try {
      await c.connect(useMock);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setConnectError(/open|denied|busy|fail/i.test(msg)
        ? "Could not open the board's port - it is in use. Close any other tab or app connected to it (or unplug and replug the board), then try again."
        : msg);
    }
  };

  // Load catalogue once, then recompute the projected sky on a slow cadence.
  useEffect(() => {
    let cancelled = false;
    let cat: CatalogStar[] = [];
    let id: ReturnType<typeof setInterval> | null = null;
    (async () => {
      cat = await loadStars();
      const lines = await loadConstellations();
      if (cancelled) return;
      setConstellations(lines);
      const recompute = () => {
        const now = new Date();
        const s = starsToSky(cat, now, c.observer);
        starsRef.current = s;
        setStars(s); setBodies(solarSystemSky(now, c.observer));
      };
      recompute();
      id = setInterval(recompute, 3000);
    })();
    return () => { cancelled = true; if (id) clearInterval(id); };
  }, [c.observer]);

  // ISS: fetch a current TLE once, then propagate its position every second.
  useEffect(() => {
    let cancelled = false;
    let id: ReturnType<typeof setInterval> | null = null;
    (async () => {
      if (!tleRef.current) tleRef.current = (await fetchISSTLE()).tle;
      if (cancelled) return;
      const tick = () => {
        if (!tleRef.current) return;
        const look = satelliteLook(tleRef.current, new Date(), c.observer);
        setIss(look && look.altDeg > 0
          ? { id: "iss", name: "ISS", kind: "satellite", altDeg: look.altDeg, azDeg: look.azDeg, magnitude: -3, color: "#a8ecff", heightKm: look.heightKm, rangeKm: look.rangeKm, speedKmh: look.speedKmh }
          : null);
      };
      tick();
      id = setInterval(tick, 1000);
    })();
    return () => { cancelled = true; if (id) clearInterval(id); };
  }, [c.observer]);

  const allBodies = useMemo(() => (iss ? [...bodies, iss] : bodies), [bodies, iss]);
  useEffect(() => { allBodiesRef.current = allBodies; }, [allBodies]);

  // What the reticle is pointing at (throttled by the scene's onAim).
  const onAim = useCallback((look: Vec3) => {
    const { altDeg, azDeg } = vectorToAltAz(look);
    let bestId: string | null = null, bestName = "", best = -2;
    const ln = normalize(look);
    for (const b of allBodiesRef.current) {
      if (b.altDeg < -2) continue;
      const d = dot(normalize(altAzToVector(b.altDeg, b.azDeg)), ln);
      if (d > best) { best = d; bestId = b.id; bestName = b.name; }
    }
    for (const s of starsRef.current) {
      if (s.altDeg < 0) continue;
      const d = dot(normalize(altAzToVector(s.altDeg, s.azDeg)), ln);
      if (d > best) { best = d; bestId = `star:${s.name}`; bestName = s.name; }
    }
    const hit = best > AIM_THRESHOLD;
    aimDataRef.current = { id: bestId, name: bestName };      // nearest, for Identify/select
    setAim({ alt: altDeg, az: azDeg, id: hit ? bestId : null, name: hit ? bestName : "" });
  }, []);

  // --- selection (tap / Enter / board SELECT event) ---
  const selectByAimId = useCallback((id: string | null) => {
    if (!id) return;
    if (id.startsWith("star:")) {
      const s = starsRef.current.find((x) => x.name === id.slice(5));
      if (s) setSelected({ star: { name: s.name, mag: s.mag, spect: s.spect, altDeg: s.altDeg, azDeg: s.azDeg } });
    } else {
      const b = allBodiesRef.current.find((x) => x.id === id);
      if (b) setSelected({ body: b });
    }
    setObjectsOpen(false);
  }, []);
  const selectCurrentAim = useCallback(() => selectByAimId(aimDataRef.current.id), [selectByAimId]);

  // Point the mock at a listed object, then select it (accessible list / no board).
  const pointAndSelect = useCallback((t: AimTarget) => {
    if (c.kind === "mock") { aimVec.current = { yaw: t.azDeg, pitch: t.altDeg }; c.driveMock(t.azDeg, t.altDeg); }
    selectByAimId(t.id);
  }, [c, selectByAimId]);

  // Tell the board what the reticle is on, so its HUD shows the name + locks on.
  const lastSentTarget = useRef<string>("");
  useEffect(() => {
    if (!connected) return;
    const name = (aim.name || "").slice(0, 20);
    if (name === lastSentTarget.current) return;
    lastSentTarget.current = name;
    c.sendCommand(c.CMD.SET_TARGET, Array.from(name, (ch) => ch.charCodeAt(0) & 0x7f));
  }, [aim.name, connected]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    c.setOnBoardSelect(selectCurrentAim);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") { e.preventDefault(); selectCurrentAim(); }
      else if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => { c.setOnBoardSelect(null); window.removeEventListener("keydown", onKey); };
  }, [c.setOnBoardSelect, selectCurrentAim]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pointer-to-look for the mock (drag the sky). No-op with a real board.
  const onPointerDown = (e: React.PointerEvent) => { if (c.kind === "mock") drag.current = { x: e.clientX, y: e.clientY }; };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y;
    drag.current = { x: e.clientX, y: e.clientY };
    aimVec.current.yaw += dx * 0.25;
    aimVec.current.pitch = Math.max(-85, Math.min(85, aimVec.current.pitch - dy * 0.25));
    c.driveMock(aimVec.current.yaw, aimVec.current.pitch);
  };
  const onPointerUp = () => { drag.current = null; };

  // Currently-visible alignment targets (bright + above the horizon).
  const targets = useMemo<AimTarget[]>(() => {
    const fromBodies = bodies.filter((b) => b.altDeg > 8)
      .map((b) => ({ id: b.id, name: b.name, altDeg: b.altDeg, azDeg: b.azDeg }));
    const fromStars = stars.filter((s) => s.altDeg > 12 && s.mag <= 2)
      .map((s) => ({ id: `star:${s.name}`, name: s.name, altDeg: s.altDeg, azDeg: s.azDeg }));
    return [...fromBodies, ...fromStars].sort((a, b) => b.altDeg - a.altDeg);
  }, [bodies, stars]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#04060d", overflow: "hidden" }}
         onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
      <Header alwaysVisible />

      {connected && (
        <SkyScene
          qRef={c.qRef} qAlign={c.qAlign}
          stars={stars} bodies={allBodies} constellations={constellations}
          highlightId={highlightBodyId} onAim={onAim}
        />
      )}

      {/* atmospheric glow + scanline immersion overlays */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(120% 90% at 50% 8%, transparent 55%, rgba(8,16,40,0.55) 100%)",
      }} />
      <div aria-hidden style={{
        position: "absolute", left: 0, right: 0, bottom: 0, height: "28%", pointerEvents: "none",
        background: "linear-gradient(to top, rgba(40,80,150,0.18), transparent)",
      }} />

      {/* centre reticle (lock-on glow when aimed at an object) */}
      <style>{`@keyframes chartemus-pulse { 0%,100% { opacity:.55; transform:translate(-50%,-50%) scale(1) } 50% { opacity:1; transform:translate(-50%,-50%) scale(1.08) } }`}</style>
      <div aria-hidden style={{
        position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
        width: locked ? 62 : 50, height: locked ? 62 : 50, pointerEvents: "none",
        transition: "width .25s, height .25s",
      }}>
        {(() => {
          const col = locked ? "rgba(125,255,190,0.95)" : "rgba(125,205,255,0.8)";
          const glow = locked ? "0 0 16px rgba(110,255,180,0.7)" : "0 0 10px rgba(110,200,255,0.45)";
          return (
            <>
              <div style={{
                position: "absolute", inset: 0, border: `1.5px solid ${col}`, borderRadius: "50%",
                boxShadow: glow, animation: locked ? "chartemus-pulse 1.6s ease-in-out infinite" : "none",
              }} />
              <div style={{ position: "absolute", left: "50%", top: -12, width: 1.5, height: 12, background: col, boxShadow: glow }} />
              <div style={{ position: "absolute", left: "50%", bottom: -12, width: 1.5, height: 12, background: col, boxShadow: glow }} />
              <div style={{ position: "absolute", top: "50%", left: -12, height: 1.5, width: 12, background: col, boxShadow: glow }} />
              <div style={{ position: "absolute", top: "50%", right: -12, height: 1.5, width: 12, background: col, boxShadow: glow }} />
              <div style={{ position: "absolute", left: "50%", top: "50%", width: 3, height: 3, borderRadius: "50%", transform: "translate(-50%,-50%)", background: col, boxShadow: glow }} />
            </>
          );
        })()}
        {locked && (
          <span style={{
            position: "absolute", left: "50%", top: -30, transform: "translateX(-50%)", whiteSpace: "nowrap",
            color: "#bdf5d6", fontSize: 13, fontWeight: 700, textShadow: "0 0 8px #000", letterSpacing: ".03em",
          }}>{aim.name}</span>
        )}
      </div>

      {/* connect / start panel */}
      {!connected && (
        <div style={panelCentre}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#cfe3ff", margin: "0 0 6px" }}>Chartemus Portal</h1>
          <p style={{ color: "#8aa0c0", margin: "0 0 18px", maxWidth: 380 }}>
            Point the board at the sky and the stars, planets and the Moon line up in real time. No board to hand? Use the demo and drag to look around.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button style={btnPrimary} disabled={!c.webSerialSupported} onClick={() => handleConnect(false)}>
              Connect board (USB)
            </button>
            <button style={btnGhost} onClick={() => handleConnect(true)}>Use demo (no board)</button>
          </div>
          {connectError && (
            <p style={{ color: "#ff9aa6", fontSize: 12, marginTop: 12, maxWidth: 380 }}>{connectError}</p>
          )}
          {!c.webSerialSupported && (
            <p style={{ color: "#6b7a93", fontSize: 12, marginTop: 10 }}>Web Serial needs Chrome or Edge on desktop. The demo works anywhere.</p>
          )}
        </div>
      )}

      {/* HUD */}
      {connected && (
        <>
          <div style={hudTopLeft}>
            <span style={{ ...pill, background: "#0f3b22", color: "#5ef0a0" }}>
              {c.kind === "mock" ? "demo" : "USB"} · {c.synced ? "aligned" : "not aligned"}
            </span>
            <button style={btnSmall} onClick={() => setWizardOpen((v) => !v)}>{c.synced ? "Re-align" : "Align"}</button>
            <button style={btnSmall} onClick={() => setObjectsOpen((v) => !v)}>Objects</button>
            <button style={btnSmall} onClick={() => c.requestGeolocation()}>Use my location</button>
            <button style={btnSmall} onClick={() => c.disconnect()}>Disconnect</button>
          </div>

          <div style={hudBottom}>
            <div style={{ fontSize: 13, color: "#8aa0c0" }}>
              Alt <b style={{ color: "#cfe3ff" }}>{aim.alt.toFixed(1)}°</b> · Az <b style={{ color: "#cfe3ff" }}>{aim.az.toFixed(1)}°</b>
            </div>
            <div style={{ fontSize: 18, color: aim.name ? "#9fd2ff" : "#46566f", fontWeight: 600, minHeight: 24 }}>
              {aim.name || "-"}
            </div>
            <button style={{ ...btnSmall, justifySelf: "start", marginTop: 4 }} onClick={selectCurrentAim}>Identify ⏎</button>
            {c.kind === "mock" && <div style={{ fontSize: 11, color: "#5a6b86" }}>drag to look around</div>}
          </div>
        </>
      )}

      {/* alignment wizard */}
      {connected && wizardOpen && (
        <div style={wizardPanel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ fontSize: 14, color: "#cfe3ff", margin: 0, textTransform: "uppercase", letterSpacing: ".06em" }}>Align the sky</h2>
            <button style={btnSmall} onClick={() => setWizardOpen(false)}>close</button>
          </div>
          <p style={{ fontSize: 12, color: "#8aa0c0", margin: "0 0 12px" }}>
            Point the reticle at the chosen object in the real sky, then capture. Two captures give the most accurate result.
          </p>
          <div style={{ maxHeight: 240, overflowY: "auto", display: "grid", gap: 6 }}>
            {targets.length === 0 && <span style={{ color: "#6b7a93", fontSize: 12 }}>Computing visible objects...</span>}
            {targets.map((t) => (
              <div key={t.id} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ flex: 1, fontSize: 13, color: "#cfe3ff" }}>{t.name}</span>
                <span style={{ fontSize: 11, color: "#6b7a93" }}>{t.altDeg.toFixed(0)}°</span>
                <button style={btnTiny} onClick={() => c.captureOneStar(t)}>Capture</button>
                <button style={btnTiny} onClick={() => c.captureSecondStar(t)}>+2nd</button>
              </div>
            ))}
          </div>
          {c.synced && <button style={{ ...btnSmall, marginTop: 12 }} onClick={() => c.resetAlignment()}>Reset alignment</button>}
        </div>
      )}

      {/* accessible object list (keyboard-navigable parallel to the reticle) */}
      {connected && objectsOpen && (
        <div style={objectsPanel}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h2 style={{ fontSize: 13, color: "#cfe3ff", margin: 0, textTransform: "uppercase", letterSpacing: ".06em" }}>Visible objects</h2>
            <button style={btnSmall} onClick={() => setObjectsOpen(false)}>close</button>
          </div>
          <div role="list" style={{ maxHeight: "58vh", overflowY: "auto", display: "grid", gap: 4 }}>
            {targets.map((t) => (
              <button key={t.id} style={listItem} onClick={() => pointAndSelect(t)}>
                <span style={{ flex: 1, textAlign: "left" }}>{t.name}</span>
                <span style={{ color: "#6b7a93", fontSize: 11 }}>{t.altDeg.toFixed(0)}°</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <BodyInfoPanel
          body={selected.body}
          star={selected.star}
          onClose={() => setSelected(null)}
          onTravel={selected.body ? () => setFlyTo(selected.body!.id) : undefined}
        />
      )}

      {flyTo && <PlanetZoom slug={flyTo} onClose={() => setFlyTo(null)} />}
    </div>
  );
}

// ---- inline styles (overlay; the canvas sits behind) ----------------------
const panelCentre: React.CSSProperties = {
  position: "absolute", left: "50%", top: "54%", transform: "translate(-50%,-50%)",
  textAlign: "center", padding: 28, background: "rgba(8,14,28,0.82)", border: "1px solid #1c2b48",
  borderRadius: 16, backdropFilter: "blur(8px)", maxWidth: "90vw",
};
const hudTopLeft: React.CSSProperties = { position: "absolute", left: 16, top: 84, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" };
const hudBottom: React.CSSProperties = { position: "absolute", left: 16, bottom: 20, display: "grid", gap: 2 };
const wizardPanel: React.CSSProperties = {
  position: "absolute", right: 16, top: 84, width: 300, padding: 16,
  background: "rgba(8,14,28,0.9)", border: "1px solid #1c2b48", borderRadius: 14, backdropFilter: "blur(8px)",
};
const objectsPanel: React.CSSProperties = {
  position: "absolute", left: 16, top: 128, width: 260, padding: 14,
  background: "rgba(8,14,28,0.9)", border: "1px solid #1c2b48", borderRadius: 14, backdropFilter: "blur(8px)",
};
const listItem: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", fontSize: 13,
  border: "1px solid #1c2b48", background: "#0d1830", color: "#cfe3ff", borderRadius: 8, cursor: "pointer", font: "inherit",
};
const pill: React.CSSProperties = { padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 };
const btnBase: React.CSSProperties = { border: "1px solid #29406b", background: "#14233f", color: "#cfe3ff", borderRadius: 8, cursor: "pointer", font: "inherit" };
const btnPrimary: React.CSSProperties = { ...btnBase, padding: "10px 16px", background: "#1d4ed8", borderColor: "#2b5fe0", fontWeight: 600 };
const btnGhost: React.CSSProperties = { ...btnBase, padding: "10px 16px" };
const btnSmall: React.CSSProperties = { ...btnBase, padding: "5px 10px", fontSize: 12 };
const btnTiny: React.CSSProperties = { ...btnBase, padding: "3px 8px", fontSize: 11 };
