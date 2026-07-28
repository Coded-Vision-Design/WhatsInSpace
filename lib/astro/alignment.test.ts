import { describe, it, expect } from "vitest";
import {
  solveOneStar, solveTwoStar, alignmentResidualDeg, type StarFix,
} from "./alignment";
import {
  altAzToVector, qFromAxisAngle, qConjugate, qRotate, qMultiply, type Quat, type Vec3,
} from "./coordinates";

// Build a device vector from a true vector given a known alignment:
//   v_true = R(q_align) . v_dev   =>   v_dev = R(conj(q_align)) . v_true
const deviceFromTrue = (qAlign: Quat, vTrue: Vec3): Vec3 => qRotate(qConjugate(qAlign), vTrue);

describe("1-star alignment", () => {
  it("recovers heading so the synced star lands under the reticle", () => {
    const qAlign: Quat = qFromAxisAngle([0, 0, 1], (40 * Math.PI) / 180); // 40 deg yaw offset
    const vTrue = altAzToVector(35, 120);
    const fix: StarFix = { vTrue, vDev: deviceFromTrue(qAlign, vTrue), targetId: "Vega" };

    const solved = solveOneStar(fix);
    // acos loses precision near 1.0; 1e-4 deg is a physically perfect alignment.
    expect(alignmentResidualDeg(solved, [fix])).toBeLessThan(1e-4);
  });
});

describe("2-star alignment", () => {
  it("recovers a full attitude (yaw + tilt) from two fixes", () => {
    // Known alignment with yaw and a small tilt component.
    const qAlign = qMultiply(
      qFromAxisAngle([0, 0, 1], (35 * Math.PI) / 180),
      qFromAxisAngle([1, 0, 0], (6 * Math.PI) / 180),
    );
    const trueA = altAzToVector(20, 80);
    const trueB = altAzToVector(55, 250);
    const fixes: StarFix[] = [
      { vTrue: trueA, vDev: deviceFromTrue(qAlign, trueA), targetId: "Sirius" },
      { vTrue: trueB, vDev: deviceFromTrue(qAlign, trueB), targetId: "Arcturus" },
    ];

    const solved = solveTwoStar(fixes[0], fixes[1]);
    expect(alignmentResidualDeg(solved, fixes)).toBeLessThan(1e-4);
  });

  it("is robust to a small capture error (residual stays small)", () => {
    const qAlign = qFromAxisAngle([0, 0, 1], (35 * Math.PI) / 180);
    const trueA = altAzToVector(20, 80);
    const trueB = altAzToVector(55, 250);
    // Nudge one device vector by ~0.5 deg to simulate an imperfect point.
    const nudge = qFromAxisAngle([1, 0, 0], (0.5 * Math.PI) / 180);
    const fixes: StarFix[] = [
      { vTrue: trueA, vDev: deviceFromTrue(qAlign, trueA), targetId: "A" },
      { vTrue: trueB, vDev: qRotate(nudge, deviceFromTrue(qAlign, trueB)), targetId: "B" },
    ];
    const solved = solveTwoStar(fixes[0], fixes[1]);
    expect(alignmentResidualDeg(solved, fixes)).toBeLessThan(1.0); // under a degree
  });
});
