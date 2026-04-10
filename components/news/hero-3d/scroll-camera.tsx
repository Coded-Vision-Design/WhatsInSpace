"use client"

import { useScroll } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

/**
 * Scroll-driven camera with 3 phases (no city/disaster phase):
 *
 *  0-45%  : Zoom toward globe (z: 4.8 to 2.2)
 *  45-70% : Through globe surface (z: 2.2 to -2), globe fades, clouds fade in
 *  70-100%: Into clouds (z: -2 to -8), camera settles in clouds
 */
export function ScrollCamera() {
  const { camera } = useThree()
  const scroll = useScroll()

  useFrame((state, delta) => {
    if (!scroll) return

    const p = scroll.offset
    const globeX = -1.6

    let targetX: number
    let targetZ: number

    if (p < 0.45) {
      // Space: zoom toward globe
      const t = p / 0.45
      targetZ = 4.8 - t * 2.6 // 4.8 to 2.2
      targetX = globeX * t * 0.35
    } else if (p < 0.7) {
      // Through globe: clouds appear
      const t = (p - 0.45) / 0.25
      targetZ = 2.2 - t * 4.2 // 2.2 to -2
      targetX = globeX * 0.35
    } else {
      // Into clouds
      const t = (p - 0.7) / 0.3
      targetZ = -2 - t * 6 // -2 to -8
      targetX = globeX * 0.35 * (1 - t * 0.5)
    }

    const targetY = -0.4

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 5, delta)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 5, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 5, delta)
    camera.rotation.x = THREE.MathUtils.damp(camera.rotation.x, 0, 5, delta)

    // Mouse parallax in space phase
    if (p < 0.3) {
      const influence = 1 - p * 3.3
      camera.rotation.y = THREE.MathUtils.lerp(
        camera.rotation.y,
        -(state.pointer.x * Math.PI) / 90 * influence,
        0.05
      )
    } else {
      camera.rotation.y = THREE.MathUtils.damp(camera.rotation.y, 0, 5, delta)
    }
  })

  return null
}
