"use client";
// ============================================================================
//  PlanetZoom - the cinematic "fly through the portal" view. Selecting a body
//  and choosing "Travel there" opens this full-screen overlay that warps in and
//  settles into orbit around the high-resolution PlanetViewer scene (reusing the
//  site's NASA-textured shaders, rings and atmospheres). Back returns to the sky.
// ============================================================================
import dynamic from "next/dynamic";
import Link from "next/link";
import { solarSystemData } from "@/lib/planet-data";

// PlanetViewer builds its own WebGL context on mount - keep it client-only.
const PlanetViewer = dynamic(() => import("@/components/PlanetViewer"), { ssr: false });

export default function PlanetZoom({ slug, onClose }: { slug: string; onClose: () => void }) {
  const data = solarSystemData.find((d) => d.slug === slug);
  if (!data) return null;
  const isStar = data.type === "star";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 80, background: "#02030a",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      animation: "portal-warp 1.1s cubic-bezier(0.16,1,0.3,1)", overflow: "hidden",
    }}>
      <style>{`
        @keyframes portal-warp {
          0%   { opacity: 0; clip-path: circle(4% at 50% 50%); filter: blur(8px) brightness(2); }
          60%  { opacity: 1; }
          100% { opacity: 1; clip-path: circle(150% at 50% 50%); filter: blur(0) brightness(1); }
        }
        @keyframes portal-fade { from { opacity: 0 } to { opacity: 1 } }
      `}</style>

      {/* faint star backdrop */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.5,
        backgroundImage: "radial-gradient(1px 1px at 20% 30%, #fff, transparent), radial-gradient(1px 1px at 70% 60%, #cfe3ff, transparent), radial-gradient(1px 1px at 40% 80%, #fff, transparent), radial-gradient(1px 1px at 85% 25%, #9fd, transparent), radial-gradient(1px 1px at 55% 45%, #fff, transparent)",
        backgroundSize: "100% 100%",
      }} />

      <header style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", animation: "portal-fade 1.4s ease 0.4s both" }}>
        <div>
          <h1 style={{ fontSize: "clamp(22px,4vw,40px)", fontWeight: 800, color: "#eaf2ff", margin: 0, letterSpacing: ".01em" }}>{data.name}</h1>
          <p style={{ color: "#8aa0c0", margin: "2px 0 0", fontSize: 14 }}>{data.tagline}</p>
        </div>
        <button onClick={onClose} style={{
          border: "1px solid #29406b", background: "rgba(20,35,63,0.8)", color: "#cfe3ff",
          borderRadius: 10, padding: "9px 16px", cursor: "pointer", font: "inherit", fontWeight: 600, backdropFilter: "blur(6px)",
        }}>← Back to sky</button>
      </header>

      <div style={{ width: "min(82vw, 82vh)", maxWidth: 760, animation: "portal-fade 1.6s ease 0.2s both" }}>
        <PlanetViewer
          slug={data.slug}
          color={data.color}
          accentColor={data.accentColor}
          hasRings={data.hasRings}
          ringColor={data.ringColor}
          isStar={isStar}
          rotationSpeed={0.0016}
        />
      </div>

      <footer style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 22px", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", animation: "portal-fade 1.4s ease 0.6s both" }}>
        <p style={{ color: "#6f86a8", fontSize: 12, textAlign: "center", maxWidth: 520, margin: 0 }}>
          Drag to orbit. {data.moons > 0 ? `${data.moons} moon${data.moons > 1 ? "s" : ""}. ` : ""}
          Surface gravity {data.surfaceGravity} m/s². Average temperature {data.surfaceTempC.avg}°C.
        </p>
        <Link href={`/solar-system/${data.slug}/`} style={{
          border: "1px solid #29406b", background: "rgba(20,35,63,0.8)", color: "#cfe3ff",
          borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, textDecoration: "none",
        }}>Full {data.name} page →</Link>
      </footer>
    </div>
  );
}
