import { describe, it, expect } from "vitest";
import {
  altAzToVector, vectorToAltAz, qFromYawPitch, deviceLookVector, qFromTwoVectors,
  qRotate, dot, normalize, type Vec3,
} from "./coordinates";

const angleBetween = (a: Vec3, b: Vec3) =>
  (Math.acos(Math.max(-1, Math.min(1, dot(normalize(a), normalize(b))))) * 180) / Math.PI;

describe("horizontal coordinates", () => {
  it("places azimuth 0 at north (+Y) and 90 at east (+X)", () => {
    expect(altAzToVector(0, 0)).toEqual(expect.arrayContaining([]));
    const north = altAzToVector(0, 0);
    expect(north[1]).toBeCloseTo(1, 9); // +Y
    const east = altAzToVector(0, 90);
    expect(east[0]).toBeCloseTo(1, 9); // +X
    const up = altAzToVector(90, 0);
    expect(up[2]).toBeCloseTo(1, 9); // +Z
  });

  it("round-trips alt/az -> vector -> alt/az", () => {
    for (const [alt, az] of [[0, 0], [30, 128], [-20, 270], [80, 45], [10, 359]]) {
      const { altDeg, azDeg } = vectorToAltAz(altAzToVector(alt, az));
      expect(altDeg).toBeCloseTo(alt, 6);
      expect(azDeg).toBeCloseTo(az, 6);
    }
  });
});

describe("quaternion <-> pointing (matches firmware convention)", () => {
  it("maps yaw->azimuth and pitch->altitude", () => {
    for (const [yaw, pitch] of [[0, 0], [90, 0], [40, 30], [200, -15], [359, 80]]) {
      const v = deviceLookVector(qFromYawPitch(yaw, pitch));
      const { altDeg, azDeg } = vectorToAltAz(v);
      expect(altDeg).toBeCloseTo(pitch, 5);
      expect(azDeg).toBeCloseTo(yaw, 5);
    }
  });

  it("qFromTwoVectors maps a onto b", () => {
    const a: Vec3 = normalize([1, 2, 3]);
    const b: Vec3 = normalize([-2, 1, 0.5]);
    const q = qFromTwoVectors(a, b);
    expect(angleBetween(qRotate(q, a), b)).toBeLessThan(1e-6);
  });

  it("qFromTwoVectors handles near-opposite vectors", () => {
    const a: Vec3 = [0, 1, 0];
    const b: Vec3 = [0, -1, 0];
    const q = qFromTwoVectors(a, b);
    expect(angleBetween(qRotate(q, a), b)).toBeLessThan(1e-4);
  });
});
