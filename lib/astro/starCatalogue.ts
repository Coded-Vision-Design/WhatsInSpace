// ============================================================================
//  starCatalogue.ts - load the bright-star subset + constellation lines and
//  project them to horizontal coordinates for an observer/time.
// ============================================================================
import { equatorialToHorizontal, type ObserverLoc } from "./ephemeris";

export interface CatalogStar { name: string; raHours: number; decDeg: number; mag: number; spect: string; }
export interface ConstellationLine { name: string; pairs: [string, string][]; }

export interface SkyStar extends CatalogStar { altDeg: number; azDeg: number; }

let starCache: CatalogStar[] | null = null;
let lineCache: ConstellationLine[] | null = null;

export async function loadStars(): Promise<CatalogStar[]> {
  if (starCache) return starCache;
  const res = await fetch("/data/bright-stars.json");
  const json = await res.json();
  starCache = (json.stars as { n: string; ra: number; dec: number; m: number; s: string }[]).map((s) => ({
    name: s.n, raHours: s.ra, decDeg: s.dec, mag: s.m, spect: s.s,
  }));
  return starCache;
}

export async function loadConstellations(): Promise<ConstellationLine[]> {
  if (lineCache) return lineCache;
  const res = await fetch("/data/constellations.json");
  const json = await res.json();
  lineCache = (json.constellations as { name: string; lines: [string, string][] }[]).map((c) => ({
    name: c.name, pairs: c.lines,
  }));
  return lineCache;
}

/** Project the catalogue to alt/az for the given moment. */
export function starsToSky(stars: CatalogStar[], date: Date, loc: ObserverLoc): SkyStar[] {
  return stars.map((s) => ({ ...s, ...equatorialToHorizontal(s.raHours, s.decDeg, date, loc) }));
}

/** Approximate star colour from spectral class (O/B blue ... M red). */
export function spectralColor(spect: string): string {
  switch (spect?.[0]?.toUpperCase()) {
    case "O": return "#9bb0ff";
    case "B": return "#aabfff";
    case "A": return "#cad7ff";
    case "F": return "#f8f7ff";
    case "G": return "#fff4e8";
    case "K": return "#ffd2a1";
    case "M": return "#ffb56b";
    default: return "#ffffff";
  }
}
