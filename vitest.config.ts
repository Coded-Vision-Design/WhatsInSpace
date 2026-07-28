import { defineConfig } from "vitest/config";

// Unit tests for the framework-agnostic core (transport protocol + astronomy
// maths). Kept separate from the Next.js app; runs in node, no DOM needed.
export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts"],
    environment: "node",
  },
});
