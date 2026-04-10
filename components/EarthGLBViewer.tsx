"use client"

import { Suspense, useRef, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, OrbitControls } from "@react-three/drei"
import * as THREE from "three"

function EarthModel() {
  const { scene } = useGLTF("/models/earth.glb")
  const ref = useRef<THREE.Group>(null)

  useEffect(() => {
    // Auto-scale to fit
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    const s = 2.2 / maxDim
    scene.scale.setScalar(s)
    const center = new THREE.Vector3()
    box.getCenter(center)
    scene.position.set(-center.x * s, -center.y * s, -center.z * s)
  }, [scene])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.08
  })

  return <primitive ref={ref} object={scene} />
}

function Stars() {
  const positions = new Float32Array(2000 * 3)
  for (let i = 0; i < 2000; i++) {
    const r = 10 + Math.random() * 30
    const th = Math.random() * Math.PI * 2
    const ph = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = r * Math.sin(ph) * Math.cos(th)
    positions[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th)
    positions[i * 3 + 2] = r * Math.cos(ph)
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={2000} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#ffffff" sizeAttenuation transparent opacity={0.8} />
    </points>
  )
}

export default function EarthGLBViewer() {
  return (
    <div className="w-full aspect-square rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0.3, 4], fov: 35 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
        <ambientLight intensity={0.3} color="#334466" />
        <directionalLight position={[-5, 3, 4]} intensity={2.5} color="#fff5e0" />
        <directionalLight position={[3, -1, -2]} intensity={0.2} color="#4466aa" />

        <Suspense fallback={null}>
          <EarthModel />
        </Suspense>

        <Stars />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          minPolarAngle={Math.PI * 0.3}
          maxPolarAngle={Math.PI * 0.7}
        />
      </Canvas>
    </div>
  )
}
