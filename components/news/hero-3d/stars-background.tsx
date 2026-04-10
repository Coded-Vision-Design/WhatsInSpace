"use client"

import { Stars } from "@react-three/drei"

/**
 * Two-layer star field: dense faint stars + fewer brighter stars.
 */
export function StarsBackground() {
  return (
    <>
      <Stars
        radius={100}
        depth={80}
        count={6000}
        factor={3}
        saturation={0}
        fade
        speed={0.3}
      />
      <Stars
        radius={200}
        depth={100}
        count={1500}
        factor={5}
        saturation={0}
        fade
        speed={0.2}
      />
    </>
  )
}
