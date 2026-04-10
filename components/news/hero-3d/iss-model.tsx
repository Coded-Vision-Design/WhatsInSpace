"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF, useScroll } from "@react-three/drei"
import * as THREE from "three"

/**
 * ISS orbiting the Earth globe on an inclined orbit.
 * Fades with the globe between scroll 40-60%.
 */
export function ISSModel() {
  const orbitRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF("/models/iss.glb")
  const scroll = useScroll()

  const cloned = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((obj: any) => {
      if (obj.material) {
        obj.material = obj.material.clone()
        obj.material.transparent = true
      }
    })
    return c
  }, [scene])

  useFrame((state) => {
    if (!orbitRef.current) return

    const t = state.clock.elapsedTime
    const speed = 0.15
    const radius = 3.2
    const tilt = 0.4

    const angle = t * speed

    const x = radius * Math.cos(angle)
    const z = radius * Math.sin(angle)
    const y = x * Math.sin(tilt)

    orbitRef.current.position.set(x, y, z)

    // Face direction of travel
    const na = angle + 0.05
    const nx = radius * Math.cos(na)
    const nz = radius * Math.sin(na)
    const ny = nx * Math.sin(tilt)
    orbitRef.current.lookAt(nx, ny, nz)

    // Fade with globe (scroll 40-60%)
    if (scroll) {
      const p = scroll.offset
      const opacity = p < 0.4 ? 1 : Math.max(0, 1 - (p - 0.4) / 0.2)
      orbitRef.current.visible = opacity > 0.01

      if (opacity < 1) {
        cloned.traverse((obj: any) => {
          if (obj.material) obj.material.opacity = opacity
        })
      }
    }
  })

  return (
    <group ref={orbitRef}>
      <primitive object={cloned} scale={0.035} />
      <pointLight intensity={5} distance={4} color="#ffffff" />
    </group>
  )
}

useGLTF.preload("/models/iss.glb")
