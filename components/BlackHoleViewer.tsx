"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, OrbitControls, Environment } from "@react-three/drei"
import { Suspense, useRef } from "react"
import * as THREE from "three"

function BlackHoleModel() {
  const { scene } = useGLTF("/models/blackhole.glb")
  const ref = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.15
    }
  })

  return <primitive ref={ref} object={scene} scale={1.5} />
}

function AccretionDisk() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * 0.3
    }
  })

  return (
    <mesh ref={ref} rotation={[Math.PI * 0.45, 0, 0]}>
      <ringGeometry args={[1.8, 4, 64]} />
      <meshBasicMaterial color="#ff6600" transparent opacity={0.15} side={THREE.DoubleSide} />
    </mesh>
  )
}

function Stars() {
  const ref = useRef<THREE.Points>(null)
  const positions = new Float32Array(3000 * 3)
  for (let i = 0; i < 3000; i++) {
    const r = 20 + Math.random() * 40
    const th = Math.random() * Math.PI * 2
    const ph = Math.acos(2 * Math.random() - 1)
    positions[i*3] = r*Math.sin(ph)*Math.cos(th)
    positions[i*3+1] = r*Math.sin(ph)*Math.sin(th)
    positions[i*3+2] = r*Math.cos(ph)
  }

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={3000} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#ffffff" sizeAttenuation />
    </points>
  )
}

export default function BlackHoleViewer() {
  return (
    <div className="w-full h-full min-h-[50vh] bg-black">
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#ff6600" />
        <pointLight position={[-5, -3, 3]} intensity={0.5} color="#4466ff" />

        <Suspense fallback={null}>
          <BlackHoleModel />
          <AccretionDisk />
        </Suspense>

        <Stars />
        <OrbitControls enableZoom enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}
