// ============================================================================
//  coordinates.ts - pure quaternion / vector / horizontal-coordinate maths.
//  World frame matches the firmware (src/orient.cpp): Z up, Y north, X east;
//  azimuth measured clockwise from north (+Y). Altitude is asin(z).
//  Every function here is pure and unit-tested (coordinates.test.ts).
// ============================================================================

export type Vec3 = [number, number, number];
export interface Quat { w: number; x: number; y: number; z: number; }

// Must match firmware config.h POINT_BODY_* (the wand's pointing axis).
export const POINT_BODY: Vec3 = [0, 1, 0];

export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

// ---- vectors ---------------------------------------------------------------
export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const length = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
export function normalize(a: Vec3): Vec3 {
  const n = length(a);
  return n > 0 ? [a[0] / n, a[1] / n, a[2] / n] : [0, 0, 0];
}

// ---- quaternions -----------------------------------------------------------
export function qNormalize(q: Quat): Quat {
  const n = Math.hypot(q.w, q.x, q.y, q.z) || 1;
  return { w: q.w / n, x: q.x / n, y: q.y / n, z: q.z / n };
}
export const qConjugate = (q: Quat): Quat => ({ w: q.w, x: -q.x, y: -q.y, z: -q.z });

export function qMultiply(a: Quat, b: Quat): Quat {
  return {
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
  };
}

export function qFromAxisAngle(axis: Vec3, angleRad: number): Quat {
  const a = normalize(axis);
  const h = angleRad / 2, s = Math.sin(h);
  return { w: Math.cos(h), x: a[0] * s, y: a[1] * s, z: a[2] * s };
}

/** Rotate a vector by a quaternion: v' = v + 2w(u x v) + 2(u x (u x v)). */
export function qRotate(q: Quat, v: Vec3): Vec3 {
  const { w, x, y, z } = q;
  const tx = 2 * (y * v[2] - z * v[1]);
  const ty = 2 * (z * v[0] - x * v[2]);
  const tz = 2 * (x * v[1] - y * v[0]);
  return [
    v[0] + w * tx + (y * tz - z * ty),
    v[1] + w * ty + (z * tx - x * tz),
    v[2] + w * tz + (x * ty - y * tx),
  ];
}

/** Minimal rotation taking unit vector a onto unit vector b. */
export function qFromTwoVectors(a: Vec3, b: Vec3): Quat {
  const u = normalize(a), v = normalize(b);
  const d = dot(u, v);
  if (d >= 1 - 1e-9) return { w: 1, x: 0, y: 0, z: 0 };
  if (d <= -1 + 1e-9) {
    // 180 degrees: pick any axis orthogonal to u.
    let axis = cross([1, 0, 0], u);
    if (length(axis) < 1e-6) axis = cross([0, 1, 0], u);
    return qFromAxisAngle(axis, Math.PI);
  }
  const axis = cross(u, v);
  const s = Math.sqrt((1 + d) * 2);
  return qNormalize({ w: s / 2, x: axis[0] / s, y: axis[1] / s, z: axis[2] / s });
}

/** Row-major 3x3 rotation matrix -> quaternion. */
export function matrixToQuat(m: number[][]): Quat {
  const tr = m[0][0] + m[1][1] + m[2][2];
  let w: number, x: number, y: number, z: number;
  if (tr > 0) {
    const s = Math.sqrt(tr + 1) * 2;
    w = s / 4; x = (m[2][1] - m[1][2]) / s; y = (m[0][2] - m[2][0]) / s; z = (m[1][0] - m[0][1]) / s;
  } else if (m[0][0] > m[1][1] && m[0][0] > m[2][2]) {
    const s = Math.sqrt(1 + m[0][0] - m[1][1] - m[2][2]) * 2;
    w = (m[2][1] - m[1][2]) / s; x = s / 4; y = (m[0][1] + m[1][0]) / s; z = (m[0][2] + m[2][0]) / s;
  } else if (m[1][1] > m[2][2]) {
    const s = Math.sqrt(1 + m[1][1] - m[0][0] - m[2][2]) * 2;
    w = (m[0][2] - m[2][0]) / s; x = (m[0][1] + m[1][0]) / s; y = s / 4; z = (m[1][2] + m[2][1]) / s;
  } else {
    const s = Math.sqrt(1 + m[2][2] - m[0][0] - m[1][1]) * 2;
    w = (m[1][0] - m[0][1]) / s; x = (m[0][2] + m[2][0]) / s; y = (m[1][2] + m[2][1]) / s; z = s / 4;
  }
  return qNormalize({ w, x, y, z });
}

/** Yaw (about Z, clockwise-from-north) + pitch (up) -> quaternion. Useful for mocks. */
export function qFromYawPitch(yawDeg: number, pitchDeg: number): Quat {
  const qz = qFromAxisAngle([0, 0, 1], -yawDeg * DEG2RAD); // clockwise looking down
  const qx = qFromAxisAngle([1, 0, 0], pitchDeg * DEG2RAD);
  return qMultiply(qz, qx);
}

// ---- horizontal coordinates -----------------------------------------------
/** (altitude, azimuth) in degrees -> unit vector in the world frame. */
export function altAzToVector(altDeg: number, azDeg: number): Vec3 {
  const alt = altDeg * DEG2RAD, az = azDeg * DEG2RAD;
  const r = Math.cos(alt);
  return [r * Math.sin(az), r * Math.cos(az), Math.sin(alt)]; // east, north, up
}

/** World-frame vector -> (altitude, azimuth) in degrees, az wrapped to [0,360). */
export function vectorToAltAz(v: Vec3): { altDeg: number; azDeg: number } {
  const u = normalize(v);
  const altDeg = Math.asin(Math.max(-1, Math.min(1, u[2]))) * RAD2DEG;
  let azDeg = Math.atan2(u[0], u[1]) * RAD2DEG;
  if (azDeg < 0) azDeg += 360;
  return { altDeg, azDeg };
}

/** The wand's raw world-frame pointing vector from the fused quaternion. */
export const deviceLookVector = (q: Quat): Vec3 => qRotate(q, POINT_BODY);

/** Apply an alignment correction to a raw device vector. */
export const applyAlignment = (qAlign: Quat, vDev: Vec3): Vec3 => qRotate(qAlign, vDev);
