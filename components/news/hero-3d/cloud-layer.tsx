"use client"

import { useRef } from "react"
import { Cloud, Clouds, useScroll } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

/**
 * Procedural cloud layer that fades in as the camera drops through.
 * Visible from scroll 45-100%.
 */
export function CloudLayer() {
  const groupRef = useRef<THREE.Group>(null)
  const scroll = useScroll()

  useFrame(() => {
    if (!groupRef.current || !scroll) return

    const p = scroll.offset

    if (p < 0.45) {
      groupRef.current.visible = false
    } else {
      groupRef.current.visible = true
      const fadeT = Math.min(1, (p - 0.45) / 0.2)
      groupRef.current.children.forEach((child) => {
        child.traverse((obj: any) => {
          if (obj.material && obj.material.opacity !== undefined) {
            obj.material.opacity = fadeT
          }
        })
      })
    }
  })

  return (
    <group ref={groupRef} visible={false}>
      <Clouds
        material={THREE.MeshBasicMaterial}
        position={[-0.8, 0, -10]}
        frustumCulled={false}
      >
        <Cloud seed={1} segments={1} concentrate="inside" bounds={[10, 10, 10]} growth={3} position={[-1, 0, 0]} smallestVolume={2} scale={1.9} volume={2} speed={0.2} fade={5} />
        <Cloud seed={3} segments={1} concentrate="outside" bounds={[10, 10, 10]} growth={2} position={[2, 0, 2]} smallestVolume={2} scale={1} volume={2} fade={3} speed={0.1} />
        <Cloud seed={4} segments={1} concentrate="outside" bounds={[10, 20, 15]} growth={4} position={[-10, -10, 4]} smallestVolume={2} scale={2} speed={0.2} volume={3} />
        <Cloud seed={5} segments={1} concentrate="outside" bounds={[5, 5, 5]} growth={2} position={[6, -3, 8]} smallestVolume={2} scale={2} volume={2} fade={0.1} speed={0.1} />
        <Cloud seed={6} segments={1} concentrate="outside" bounds={[5, 5, 5]} growth={2} position={[0, -20, 20]} smallestVolume={2} scale={4} volume={3} fade={0.1} speed={0.1} />
        <Cloud seed={7} segments={1} concentrate="outside" bounds={[5, 5, 5]} growth={2} position={[10, -15, -5]} smallestVolume={2} scale={3} volume={3} fade={0.1} speed={0.1} />
      </Clouds>
    </group>
  )
}
