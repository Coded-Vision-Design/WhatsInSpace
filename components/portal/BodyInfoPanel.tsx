"use client";
// ============================================================================
//  BodyInfoPanel - the info card shown when you select an object in the Portal.
//  Solar-system bodies reuse the site's lib/planet-data.ts and WeightCalculator;
//  stars get a compact card. Right-side panel on desktop, bottom sheet on mobile.
// ============================================================================
import Link from "next/link";
import { solarSystemData } from "@/lib/planet-data";
import WeightCalculator from "@/components/WeightCalculator";
import type { SkyBody } from "@/lib/astro/ephemeris";

export interface StarInfo { name: string; mag: number; spect: string; altDeg: number; azDeg: number; }

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 rounded-lg px-3 py-2">
      <p className="text-white/40 text-[10px] uppercase tracking-wider">{label}</p>
      <p className="text-white text-sm font-mono mt-0.5">{value}</p>
    </div>
  );
}

const SPECTRAL_DESC: Record<string, string> = {
  O: "blue, extremely hot", B: "blue-white, very hot", A: "white", F: "yellow-white",
  G: "yellow, Sun-like", K: "orange", M: "red, cool",
};

export default function BodyInfoPanel({ body, star, onClose, onTravel }: {
  body?: SkyBody | null; star?: StarInfo | null; onClose: () => void; onTravel?: () => void;
}) {
  const data = body ? solarSystemData.find((d) => d.slug === body.id) : undefined;

  return (
    <aside
      role="dialog" aria-modal="false" aria-label={data?.name ?? body?.name ?? star?.name ?? "Object info"}
      className="fixed z-[60] bg-[#070b16]/95 backdrop-blur-md border border-white/10 text-white overflow-y-auto
                 inset-x-0 bottom-0 max-h-[70vh] rounded-t-2xl
                 md:inset-y-0 md:right-0 md:left-auto md:bottom-auto md:w-[400px] md:max-h-none md:rounded-none md:border-l"
    >
      <div className="sticky top-0 bg-[#070b16]/95 backdrop-blur px-5 py-4 flex items-center justify-between border-b border-white/10">
        <div>
          <h2 className="text-lg font-bold">{data?.name ?? body?.name ?? star?.name}</h2>
          {data?.tagline && <p className="text-white/40 text-xs">{data.tagline}</p>}
          {star && <p className="text-white/40 text-xs">Star · magnitude {star.mag.toFixed(2)}</p>}
        </div>
        <button onClick={onClose} aria-label="Close" className="text-white/50 hover:text-white text-2xl leading-none px-2">×</button>
      </div>

      <div className="px-5 py-4 space-y-5">
        {/* live position */}
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Altitude" value={`${(body?.altDeg ?? star?.altDeg ?? 0).toFixed(1)}°`} />
          <Stat label="Azimuth" value={`${(body?.azDeg ?? star?.azDeg ?? 0).toFixed(1)}°`} />
        </div>

        {/* solar-system body */}
        {data && (
          <>
            {onTravel && (
              <button
                onClick={onTravel}
                className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${data.color}, ${data.accentColor})` }}
              >
                ✦ Travel there
              </button>
            )}

            <p className="text-white/70 text-sm leading-relaxed">{data.description}</p>

            <div className="grid grid-cols-2 gap-2">
              <Stat label="Radius" value={`${data.radiusKm.toLocaleString()} km`} />
              <Stat label="Mass" value={`${data.massKg} kg`} />
              <Stat label="Surface gravity" value={`${data.surfaceGravity} m/s²`} />
              <Stat label="Moons" value={`${data.moons}`} />
              <Stat label="Day length" value={`${data.dayLengthHours} h`} />
              <Stat label="Year length" value={data.yearLengthDays ? `${data.yearLengthDays} days` : "-"} />
              <Stat label="Avg temp" value={`${data.surfaceTempC.avg}°C`} />
              <Stat label="Distance from Sun" value={`${data.distanceFromSunKm} km`} />
            </div>

            <WeightCalculator
              planetName={data.name}
              weightMultiplier={data.weightMultiplier}
              surfaceGravity={data.surfaceGravity}
              color={data.color}
            />

            {data.funFacts?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/80 mb-2">Did you know?</h3>
                <ul className="space-y-1.5">
                  {data.funFacts.map((f, i) => (
                    <li key={i} className="text-white/60 text-sm flex gap-2"><span style={{ color: data.accentColor }}>•</span>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            <Link href={`/solar-system/${data.slug}/`}
                  className="block text-center bg-white/10 hover:bg-white/20 transition-colors rounded-lg py-2.5 text-sm font-medium">
              Explore {data.name} in 3D →
            </Link>
          </>
        )}

        {/* Moon (no planet-data entry) */}
        {body && !data && body.kind === "moon" && (
          <div className="space-y-2">
            <p className="text-white/70 text-sm">Earth&apos;s only natural satellite.</p>
            {typeof body.phase === "number" && (
              <Stat label="Illuminated" value={`${Math.round(body.phase * 100)}%`} />
            )}
          </div>
        )}

        {/* ISS / satellite */}
        {body && body.kind === "satellite" && (
          <div className="space-y-3">
            <p className="text-white/70 text-sm">The International Space Station - a crewed laboratory orbiting Earth, visible as a fast, bright point crossing the sky.</p>
            <div className="grid grid-cols-2 gap-2">
              {typeof body.heightKm === "number" && <Stat label="Orbit altitude" value={`${Math.round(body.heightKm)} km`} />}
              {typeof body.rangeKm === "number" && <Stat label="Distance to you" value={`${Math.round(body.rangeKm).toLocaleString()} km`} />}
              {typeof body.speedKmh === "number" && body.speedKmh > 0 && <Stat label="Speed" value={`${Math.round(body.speedKmh).toLocaleString()} km/h`} />}
              <Stat label="Orbit period" value="~92 min" />
            </div>
          </div>
        )}

        {/* star */}
        {star && (
          <div className="space-y-2">
            <Stat label="Spectral class" value={`${star.spect} (${SPECTRAL_DESC[star.spect?.[0]?.toUpperCase()] ?? "star"})`} />
            <p className="text-white/50 text-xs">
              A naked-eye star at apparent magnitude {star.mag.toFixed(2)}. Lower magnitude means brighter.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
