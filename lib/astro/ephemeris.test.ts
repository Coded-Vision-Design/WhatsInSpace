import { describe, it, expect } from "vitest";
import * as Astronomy from "astronomy-engine";

describe("astronomy-engine API discovery", () => {
  it("calculates Alt/Az for arbitrary RA and Dec", () => {
    const date = new Date("2026-06-21T22:00:00Z"); // night time
    const time = Astronomy.MakeTime(date);
    const observer = new Astronomy.Observer(51.5074, -0.1278, 0); // London

    // Sirius J2000 coordinates: RA = 6.7525 hours, Dec = -16.716 degrees
    const siriusRA = 6.7525;
    const siriusDec = -16.716;

    const hor = Astronomy.Horizon(time, observer, siriusRA, siriusDec, "normal");
    expect(hor).toBeDefined();
    console.log("Sirius Alt:", hor.altitude, "Az:", hor.azimuth);
    expect(hor.altitude).toBeLessThan(90);
    expect(hor.altitude).toBeGreaterThan(-90);
    expect(hor.azimuth).toBeLessThan(360);
    expect(hor.azimuth).toBeGreaterThanOrEqual(0);
  });
});
