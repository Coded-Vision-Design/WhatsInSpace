// ============================================================================
//  ephemeris.ts - Sun / Moon / planet positions in horizontal coordinates
//  (altitude + azimuth) for an observer, via astronomy-engine. Azimuth is
//  degrees clockwise from north and altitude degrees above the horizon, which
//  matches lib/astro/coordinates.ts and the firmware.
// ============================================================================
import { Body, Observer, Equator, Horizon, Illumination } from "astronomy-engine";

export interface ObserverLoc { latDeg: number; lonDeg: number; heightM?: number; }

export type SkyKind = "sun" | "moon" | "planet" | "satellite";

export interface SkyBody {
  id: string;          // slug matching lib/planet-data.ts where possible
  name: string;
  kind: SkyKind;
  altDeg: number;
  azDeg: number;
  magnitude: number;   // apparent magnitude (lower = brighter)
  phase?: number;      // 0..1 illuminated fraction (Moon)
  color: string;
  // satellites only:
  heightKm?: number;
  rangeKm?: number;
  speedKmh?: number;
}

const PLANETS: { id: string; name: string; body: Body; color: string }[] = [
  { id: "mercury", name: "Mercury", body: Body.Mercury, color: "#b9a18b" },
  { id: "venus", name: "Venus", body: Body.Venus, color: "#f5e7c4" },
  { id: "mars", name: "Mars", body: Body.Mars, color: "#e1623c" },
  { id: "jupiter", name: "Jupiter", body: Body.Jupiter, color: "#d9b48a" },
  { id: "saturn", name: "Saturn", body: Body.Saturn, color: "#e6d39a" },
  { id: "uranus", name: "Uranus", body: Body.Uranus, color: "#9fe0e6" },
  { id: "neptune", name: "Neptune", body: Body.Neptune, color: "#6f8cff" },
];

function observerOf(loc: ObserverLoc): Observer {
  return new Observer(loc.latDeg, loc.lonDeg, loc.heightM ?? 0);
}

/** Horizontal coordinates of a body (geometric, no refraction). */
export function bodyHorizontal(body: Body, date: Date, loc: ObserverLoc): { altDeg: number; azDeg: number } {
  const observer = observerOf(loc);
  const eq = Equator(body, date, observer, true /*ofdate*/, true /*aberration*/);
  const h = Horizon(date, observer, eq.ra, eq.dec); // refraction omitted -> geometric
  return { altDeg: h.altitude, azDeg: h.azimuth };
}

/** Equatorial (J2000-ish) RA(hours)/Dec(deg) -> horizontal for stars. */
export function equatorialToHorizontal(
  raHours: number, decDeg: number, date: Date, loc: ObserverLoc,
): { altDeg: number; azDeg: number } {
  const observer = observerOf(loc);
  const h = Horizon(date, observer, raHours, decDeg);
  return { altDeg: h.altitude, azDeg: h.azimuth };
}

function safeMag(body: Body, date: Date): number {
  try { return Illumination(body, date).mag; } catch { return 5; }
}

/** Sun, Moon and the planets, with alt/az, magnitude and (Moon) phase. */
export function solarSystemSky(date: Date, loc: ObserverLoc): SkyBody[] {
  const out: SkyBody[] = [];

  const sun = bodyHorizontal(Body.Sun, date, loc);
  out.push({ id: "sun", name: "The Sun", kind: "sun", ...sun, magnitude: -26.7, color: "#ffd27a" });

  const moon = bodyHorizontal(Body.Moon, date, loc);
  let phase = 0.5;
  try { phase = Illumination(Body.Moon, date).phase_fraction; } catch { /* keep default */ }
  out.push({ id: "moon", name: "The Moon", kind: "moon", ...moon, magnitude: -10, phase, color: "#e8e8ea" });

  for (const p of PLANETS) {
    const h = bodyHorizontal(p.body, date, loc);
    out.push({ id: p.id, name: p.name, kind: "planet", ...h, magnitude: safeMag(p.body, date), color: p.color });
  }
  return out;
}
