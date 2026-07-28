// ============================================================================
//  satellites.ts - track the ISS (and any satellite) with SGP4 via satellite.js.
//  A live TLE is fetched from Celestrak; a bundled fallback keeps it plausibly
//  moving if the network/CORS blocks the fetch (the fallback drifts over weeks,
//  so the live fetch is preferred for accuracy).
// ============================================================================
import {
  twoline2satrec, propagate, gstime, eciToEcf, ecfToLookAngles, eciToGeodetic,
} from "satellite.js";
import type { ObserverLoc } from "./ephemeris";

const DEG = Math.PI / 180, RAD = 180 / Math.PI;

export type TLE = [string, string];

// Structurally-valid ISS TLE used only if the live fetch fails.
const FALLBACK_ISS_TLE: TLE = [
  "1 25544U 98067A   24010.50000000  .00016717  00000-0  10270-3 0  9005",
  "2 25544  51.6400 247.4600 0006703 130.5360 325.0288 15.50000000    05",
];

const TLE_URLS = [
  "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE",
  "https://celestrak.com/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE",
];

/** Fetch a current ISS TLE, falling back to the bundled one on any failure. */
export async function fetchISSTLE(): Promise<{ tle: TLE; live: boolean }> {
  for (const url of TLE_URLS) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const lines = (await res.text()).trim().split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const l1 = lines.find((l) => l.startsWith("1 "));
      const l2 = lines.find((l) => l.startsWith("2 "));
      if (l1 && l2) return { tle: [l1, l2], live: true };
    } catch { /* try next / fall back */ }
  }
  return { tle: FALLBACK_ISS_TLE, live: false };
}

export interface SatLook {
  altDeg: number; azDeg: number; rangeKm: number; heightKm: number; speedKmh: number; visible: boolean;
}

/** Horizontal look angles + height/range/speed of a satellite for an observer. */
export function satelliteLook(tle: TLE, date: Date, obs: ObserverLoc): SatLook | null {
  const satrec = twoline2satrec(tle[0], tle[1]);
  const pv = propagate(satrec, date);
  if (!pv || !pv.position || typeof pv.position === "boolean") return null;

  const gmst = gstime(date);
  const ecf = eciToEcf(pv.position, gmst);
  const gd = eciToGeodetic(pv.position, gmst);
  const observerGd = { longitude: obs.lonDeg * DEG, latitude: obs.latDeg * DEG, height: (obs.heightM ?? 0) / 1000 };
  const look = ecfToLookAngles(observerGd, ecf);

  const v = pv.velocity;
  const speedKmh = v && typeof v !== "boolean"
    ? Math.hypot(v.x, v.y, v.z) * 3600 : 0;

  return {
    altDeg: look.elevation * RAD,
    azDeg: (((look.azimuth * RAD) % 360) + 360) % 360,
    rangeKm: look.rangeSat,
    heightKm: gd.height,
    speedKmh,
    visible: look.elevation > 0,
  };
}
