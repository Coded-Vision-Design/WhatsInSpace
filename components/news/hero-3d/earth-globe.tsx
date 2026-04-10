"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere, useTexture, useScroll } from "@react-three/drei"
import * as THREE from "three"

/**
 * Earth globe with NASA textures (day, night, clouds, bump, specular).
 * Fades out as the camera passes through (scroll 40-60%).
 */
export function EarthGlobe() {
  const groupRef = useRef<THREE.Group>(null)
  const dayRef = useRef<THREE.Mesh>(null)
  const nightRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const scroll = useScroll()

  const { dayMap, bumpMap, specMap, nightMap, cloudMap } = useTexture({
    dayMap: "/textures/earth_day_4k.jpg",
    bumpMap: "/textures/earth_normal_2k.jpg",
    specMap: "/textures/earth_specular_2k.jpg",
    nightMap: "/textures/earth_night_4k.jpg",
    cloudMap: "/textures/earth_clouds_2k.jpg",
  })

  useFrame((_, delta) => {
    const speed = delta * 0.04
    if (dayRef.current) dayRef.current.rotation.y += speed
    if (nightRef.current) nightRef.current.rotation.y += speed
    if (cloudsRef.current) cloudsRef.current.rotation.y += speed * 1.15

    if (groupRef.current && scroll) {
      const p = scroll.offset
      let opacity = 1
      if (p > 0.4) {
        opacity = Math.max(0, 1 - (p - 0.4) / 0.2)
      }

      groupRef.current.traverse((obj: any) => {
        if (obj.material) {
          if (obj.material.transparent === false && opacity < 1) {
            obj.material.transparent = true
          }
          obj.material.opacity = opacity
        }
      })

      groupRef.current.visible = opacity > 0.01
    }
  })

  return (
    <group ref={groupRef}>
      {/* Day surface */}
      <Sphere ref={dayRef} args={[2, 64, 64]}>
        <meshPhongMaterial
          map={dayMap}
          bumpMap={bumpMap}
          bumpScale={0.03}
          specularMap={specMap}
          specular={new THREE.Color("#333333")}
          shininess={15}
          transparent
        />
      </Sphere>

      {/* Night city lights */}
      <Sphere ref={nightRef} args={[2.001, 64, 64]}>
        <meshBasicMaterial
          map={nightMap}
          blending={THREE.AdditiveBlending}
          transparent
          opacity={0.55}
        />
      </Sphere>

      {/* Cloud shell */}
      <Sphere ref={cloudsRef} args={[2.025, 48, 48]}>
        <meshPhongMaterial
          map={cloudMap}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </Sphere>
    </group>
  )
}
