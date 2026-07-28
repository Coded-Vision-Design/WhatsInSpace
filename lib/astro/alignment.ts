// ============================================================================
//  alignment.ts - solve the device->sky heading correction.
//  The 6-axis IMU has no magnetometer, so the fused quaternion's yaw is
//  arbitrary and drifts. The user points the wand at a known sky object and
//  confirms; we solve for the rotation q_align that maps the device's raw
//  pointing vector onto the object's true world-frame direction:
//        v_true ~= qRotate(q_align, v_dev)
//
//  1-star: minimal rotation between the two vectors (fixes heading; leaves a
//          little roll/tilt error).
//  2-star: TRIAD method on two vector pairs (fully constrains the attitude).
// ============================================================================
import {
  type Quat, type Vec3, cross, normalize, qFromTwoVectors, matrixToQuat, qRotate, dot, RAD2DEG,
} from "./coordinates";

export interface StarFix {
  /** Raw device pointing vector at capture (deviceLookVector of the fused quaternion). */
  vDev: Vec3;
  /** True world-frame direction of the target (altAzToVector of its alt/az). */
  vTrue: Vec3;
  targetId: string;
}

/** 1-star: minimal rotation taking the device vector onto the true vector. */
export function solveOneStar(fix: StarFix): Quat {
  return qFromTwoVectors(fix.vDev, fix.vTrue);
}

/**
 * 2-star: TRIAD attitude solve. Builds an orthonormal triad from each vector
 * pair and forms R = T_true * T_dev^T, the rotation mapping device->true.
 * Favours the first fix for the primary direction (standard TRIAD behaviour).
 */
export function solveTwoStar(a: StarFix, b: StarFix): Quat {
  const triad = (p: Vec3, q: Vec3): [Vec3, Vec3, Vec3] => {
    const t1 = normalize(p);
    const t2 = normalize(cross(p, q));
    const t3 = cross(t1, t2);
    return [t1, t2, t3];
  };
  const [r1, r2, r3] = triad(a.vTrue, b.vTrue);
  const [d1, d2, d3] = triad(a.vDev, b.vDev);

  // R = [r1 r2 r3] (cols) * [d1 d2 d3]^T (rows) -> maps device frame to true frame.
  const R: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const rc = [r1, r2, r3], dc = [d1, d2, d3];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      R[i][j] = rc[0][i] * dc[0][j] + rc[1][i] * dc[1][j] + rc[2][i] * dc[2][j];

  return matrixToQuat(R);
}

/**
 * Residual error of an alignment, in degrees: the angle between each true
 * vector and where the corrected device vector actually points. Reported back
 * to the user so they can judge / redo a sloppy sync.
 */
export function alignmentResidualDeg(qAlign: Quat, fixes: StarFix[]): number {
  if (fixes.length === 0) return 0;
  let worst = 0;
  for (const f of fixes) {
    const corrected = qRotate(qAlign, f.vDev);
    const d = Math.max(-1, Math.min(1, dot(normalize(corrected), normalize(f.vTrue))));
    worst = Math.max(worst, Math.acos(d) * RAD2DEG);
  }
  return worst;
}
