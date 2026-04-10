"use client"

import { useEffect, useRef, Suspense } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { useGLTF, OrbitControls } from "@react-three/drei"
import { getMoonsForPlanet, type MoonData } from "@/lib/moon-data"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faMoon } from "@fortawesome/free-solid-svg-icons"

// Per-moon color palettes for scientifically accurate procedural textures
const MOON_PALETTES: Record<string, { base: string; dark: string; light: string; accent?: string; type: "cratered" | "icy" | "volcanic" | "smooth" | "hazy" }> = {
  "The Moon (Luna)": { base: "#8a8a8a", dark: "#5a5a5a", light: "#b0b0b0", type: "cratered" },
  "Phobos": { base: "#6b5b4a", dark: "#3d3028", light: "#8a7a6a", type: "cratered" },
  "Deimos": { base: "#7a6a5a", dark: "#504030", light: "#9a8a7a", type: "smooth" },
  "Io": { base: "#d4b840", dark: "#8a6020", light: "#f0e060", accent: "#cc3300", type: "volcanic" },
  "Europa": { base: "#c8b898", dark: "#8a7050", light: "#e8dcc0", accent: "#6a4a30", type: "icy" },
  "Ganymede": { base: "#909088", dark: "#585850", light: "#b8b8b0", accent: "#706858", type: "cratered" },
  "Callisto": { base: "#605848", dark: "#383028", light: "#807060", type: "cratered" },
  "Titan": { base: "#c4a050", dark: "#8a6830", light: "#e0c070", type: "hazy" },
  "Enceladus": { base: "#e8e8e8", dark: "#b0b0b0", light: "#ffffff", accent: "#88ccdd", type: "icy" },
  "Mimas": { base: "#c0c0c0", dark: "#808080", light: "#e0e0e0", type: "cratered" },
  "Miranda": { base: "#a0a0b0", dark: "#606070", light: "#c8c8d0", type: "icy" },
  "Titania": { base: "#909090", dark: "#606060", light: "#b8b8b8", type: "cratered" },
  "Triton": { base: "#b0a0a0", dark: "#706060", light: "#d0c0c0", accent: "#c8a0a0", type: "icy" },
  "Charon": { base: "#808080", dark: "#505050", light: "#a8a8a8", accent: "#8b4040", type: "cratered" },
}

function createDetailedMoonTexture(moon: MoonData): THREE.CanvasTexture {
  const W = 2048, H = 1024
  const c = document.createElement("canvas"); c.width = W; c.height = H
  const ctx = c.getContext("2d")!
  const p = MOON_PALETTES[moon.name] || { base: moon.color, dark: "#333", light: "#aaa", type: "cratered" as const }

  // Base gradient
  const bg = ctx.createRadialGradient(W * 0.4, H * 0.4, 0, W / 2, H / 2, W * 0.6)
  bg.addColorStop(0, p.light); bg.addColorStop(0.5, p.base); bg.addColorStop(1, p.dark)
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

  if (p.type === "volcanic") {
    // Io: sulfur deposits, lava flows, volcanic calderas
    for (let i = 0; i < 80; i++) {
      const colors = ["#e8d040", "#cc8020", "#f0e860", "#aa4010", "#d0a030"]
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
      ctx.globalAlpha = 0.2 + Math.random() * 0.4
      ctx.beginPath()
      ctx.ellipse(Math.random() * W, Math.random() * H, 20 + Math.random() * 80, 15 + Math.random() * 60, Math.random() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }
    // Volcanic calderas (dark spots)
    for (let i = 0; i < 25; i++) {
      ctx.globalAlpha = 0.5 + Math.random() * 0.3
      ctx.fillStyle = "#1a0800"
      const cx = Math.random() * W, cy = Math.random() * H, r = 5 + Math.random() * 25
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
      // Lava ring
      ctx.strokeStyle = p.accent || "#cc3300"; ctx.lineWidth = 2 + Math.random() * 3
      ctx.globalAlpha = 0.4
      ctx.beginPath(); ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2); ctx.stroke()
    }
    // Lava flows
    for (let i = 0; i < 15; i++) {
      ctx.strokeStyle = p.accent || "#cc3300"; ctx.lineWidth = 1 + Math.random() * 3; ctx.globalAlpha = 0.3
      ctx.beginPath()
      let x = Math.random() * W, y = Math.random() * H
      ctx.moveTo(x, y)
      for (let s = 0; s < 10; s++) { x += (Math.random() - 0.5) * 50; y += (Math.random() - 0.5) * 30; ctx.lineTo(x, y) }
      ctx.stroke()
    }
  } else if (p.type === "icy") {
    // Europa/Enceladus/Miranda: ice fractures, smooth terrain, subtle cracks
    // Smooth ice patches
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = p.light; ctx.globalAlpha = 0.08 + Math.random() * 0.15
      ctx.beginPath()
      ctx.ellipse(Math.random() * W, Math.random() * H, 30 + Math.random() * 120, 20 + Math.random() * 80, Math.random() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }
    // Ice fractures/lineae
    for (let i = 0; i < 40; i++) {
      ctx.strokeStyle = p.accent || p.dark; ctx.lineWidth = 0.5 + Math.random() * 2; ctx.globalAlpha = 0.15 + Math.random() * 0.25
      ctx.beginPath()
      let x = Math.random() * W, y = Math.random() * H
      ctx.moveTo(x, y)
      const len = 5 + Math.floor(Math.random() * 15)
      for (let s = 0; s < len; s++) { x += (Math.random() - 0.5) * 60; y += (Math.random() - 0.5) * 40; ctx.lineTo(x, y) }
      ctx.stroke()
    }
    // Tiger stripes for Enceladus
    if (moon.name === "Enceladus") {
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = "#88ccdd"; ctx.lineWidth = 2 + Math.random() * 2; ctx.globalAlpha = 0.3
        ctx.beginPath()
        const startX = W * 0.2 + Math.random() * W * 0.6
        ctx.moveTo(startX, H * 0.7); ctx.lineTo(startX + (Math.random() - 0.5) * 100, H * 0.95)
        ctx.stroke()
      }
    }
  } else if (p.type === "hazy") {
    // Titan: thick atmosphere bands, no visible surface detail
    for (let y = 0; y < H; y += 3 + Math.random() * 8) {
      ctx.fillStyle = Math.random() > 0.5 ? p.light : p.dark
      ctx.globalAlpha = 0.04 + Math.random() * 0.08
      ctx.fillRect(0, y, W, 2 + Math.random() * 6)
    }
    // Haze layers
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = p.base; ctx.globalAlpha = 0.06
      ctx.beginPath()
      ctx.ellipse(Math.random() * W, Math.random() * H, 60 + Math.random() * 200, 10 + Math.random() * 30, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  } else {
    // Cratered / smooth: standard terrain with craters
    // Large terrain variation
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? p.light : p.dark
      ctx.globalAlpha = 0.08 + Math.random() * 0.15
      ctx.beginPath()
      ctx.ellipse(Math.random() * W, Math.random() * H, 30 + Math.random() * 120, 20 + Math.random() * 80, Math.random() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }
    // Craters with shadows and highlights
    const craterCount = p.type === "smooth" ? 40 : 200
    for (let i = 0; i < craterCount; i++) {
      const cx = Math.random() * W, cy = Math.random() * H
      const cr = 1 + Math.random() * (p.type === "smooth" ? 5 : 15)
      // Crater shadow (bottom-right)
      ctx.fillStyle = p.dark; ctx.globalAlpha = 0.15 + Math.random() * 0.2
      ctx.beginPath(); ctx.arc(cx + cr * 0.3, cy + cr * 0.3, cr, 0, Math.PI * 2); ctx.fill()
      // Crater floor
      ctx.fillStyle = p.dark; ctx.globalAlpha = 0.1 + Math.random() * 0.15
      ctx.beginPath(); ctx.arc(cx, cy, cr * 0.8, 0, Math.PI * 2); ctx.fill()
      // Crater rim highlight (top-left)
      ctx.fillStyle = p.light; ctx.globalAlpha = 0.1 + Math.random() * 0.15
      ctx.beginPath(); ctx.arc(cx - cr * 0.2, cy - cr * 0.2, cr * 0.7, 0, Math.PI * 2); ctx.fill()
    }
    // Charon's red polar cap
    if (moon.name === "Charon" && p.accent) {
      ctx.fillStyle = p.accent; ctx.globalAlpha = 0.25
      ctx.beginPath(); ctx.ellipse(W / 2, 30, W * 0.4, 80, 0, 0, Math.PI * 2); ctx.fill()
    }
  }

  ctx.globalAlpha = 1
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

// GLB Moon model for Earth's Moon
function MoonGLBModel() {
  const { scene } = useGLTF("/models/moon.glb")
  const ref = useRef<THREE.Group>(null)

  useEffect(() => {
    // Auto-scale to fit: compute bounding box and normalize
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    const targetSize = 2.0 // fill most of the viewport
    const s = targetSize / maxDim
    scene.scale.setScalar(s)
    // Center the model
    const center = new THREE.Vector3()
    box.getCenter(center)
    scene.position.set(-center.x * s, -center.y * s, -center.z * s)
  }, [scene])

  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.1 })
  return <primitive ref={ref} object={scene} />
}

// Three.js procedural moon for all other moons
function ProceduralMoonViewer({ moon }: { moon: MoonData }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const w = container.clientWidth, h = container.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 50)
    camera.position.set(0, 0, 3)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0x333344, 0.6))
    const sun = new THREE.DirectionalLight(0xffffff, 2.2)
    sun.position.set(-3, 2, 4); scene.add(sun)
    scene.add(new THREE.DirectionalLight(0x334466, 0.3).translateX(3))

    const geo = new THREE.SphereGeometry(1, 96, 48)
    const tex = createDetailedMoonTexture(moon)
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0.01 })
    const mesh = new THREE.Mesh(geo, mat)
    scene.add(mesh)

    // Load real texture if available (overrides procedural)
    if (moon.texture) {
      const loader = new THREE.TextureLoader()
      loader.load(moon.texture, (t) => {
        t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
        mat.map = t; mat.needsUpdate = true
      })
    }

    // Subtle atmosphere for moons with known atmosphere
    if (["Titan", "Triton", "Io"].includes(moon.name)) {
      const atmosColors: Record<string, number> = { "Titan": 0xc4a050, "Triton": 0x88aacc, "Io": 0xccaa44 }
      scene.add(new THREE.Mesh(
        new THREE.SphereGeometry(1.04, 32, 16),
        new THREE.MeshBasicMaterial({ color: atmosColors[moon.name] || 0x888888, transparent: true, opacity: moon.name === "Titan" ? 0.2 : 0.06, side: THREE.BackSide })
      ))
    }

    // Stars
    const sGeo = new THREE.BufferGeometry()
    const sp = new Float32Array(800 * 3)
    for (let i = 0; i < 800; i++) {
      const r = 8 + Math.random() * 20, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1)
      sp[i * 3] = r * Math.sin(ph) * Math.cos(th); sp[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th); sp[i * 3 + 2] = r * Math.cos(ph)
    }
    sGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3))
    scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.03, sizeAttenuation: true })))

    // Orbit controls
    let isDrag = false, prevX = 0, camAngle = 0
    const onDown = (e: PointerEvent) => { isDrag = true; prevX = e.clientX }
    const onMove = (e: PointerEvent) => { if (!isDrag) return; camAngle -= (e.clientX - prevX) * 0.008; prevX = e.clientX }
    const onUp = () => { isDrag = false }
    renderer.domElement.addEventListener("pointerdown", onDown)
    renderer.domElement.addEventListener("pointermove", onMove)
    renderer.domElement.addEventListener("pointerup", onUp)
    renderer.domElement.style.touchAction = "none"

    let raf: number
    const animate = () => {
      raf = requestAnimationFrame(animate)
      mesh.rotation.y += 0.002
      camera.position.x = 3 * Math.sin(camAngle)
      camera.position.z = 3 * Math.cos(camAngle)
      camera.lookAt(0, 0, 0)
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const nw = container.clientWidth, nh = container.clientHeight
      camera.aspect = nw / nh; camera.updateProjectionMatrix(); renderer.setSize(nw, nh)
    }
    window.addEventListener("resize", onResize)

    return () => {
      cancelAnimationFrame(raf); window.removeEventListener("resize", onResize)
      renderer.domElement.removeEventListener("pointerdown", onDown)
      renderer.domElement.removeEventListener("pointermove", onMove)
      renderer.domElement.removeEventListener("pointerup", onUp)
      renderer.dispose()
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
    }
  }, [moon])

  return <div ref={containerRef} className="w-full aspect-square rounded-xl overflow-hidden bg-black/30 cursor-grab active:cursor-grabbing" />
}

// R3F viewer for the GLB Moon model
function GLBMoonViewer() {
  return (
    <div className="w-full aspect-square rounded-xl overflow-hidden bg-black/30">
      <Canvas camera={{ position: [0, 0, 3], fov: 40 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[-3, 2, 4]} intensity={2} />
        <Suspense fallback={null}>
          <MoonGLBModel />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}

export default function MoonSection({ planetSlug, planetColor }: { planetSlug: string; planetColor: string }) {
  const moons = getMoonsForPlanet(planetSlug)
  if (moons.length === 0) return null

  return (
    <section className="relative z-30 bg-black border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-8">
          <FontAwesomeIcon icon={faMoon} className="w-5 h-5" style={{ color: planetColor }} />
          <h2 className="text-2xl font-bold text-white">
            {moons.length === 1 ? "Moon" : `Notable Moons (${moons.length})`}
          </h2>
        </div>

        <div className="space-y-8">
          {moons.map((moon) => (
            <div key={moon.name} className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 shimmer-card border-glow-hover bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 md:p-6">
              {/* 3D Moon Viewer */}
              <div className="w-full max-w-[220px] mx-auto md:mx-0">
                {moon.name === "The Moon (Luna)" ? <GLBMoonViewer /> : <ProceduralMoonViewer moon={moon} />}
                <p className="text-white/15 text-[10px] text-center mt-1">Drag to rotate</p>
              </div>

              {/* Info */}
              <div>
                <div className="flex items-baseline flex-wrap gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{moon.name}</h3>
                  <span className="text-white/20 text-xs">
                    {moon.discoveryYear > 0 ? `Discovered ${moon.discoveryYear} by ${moon.discoveredBy}` : moon.discoveredBy}
                  </span>
                </div>

                <p className="text-white/50 text-sm leading-relaxed mb-4">{moon.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-black/30 rounded-lg p-2.5">
                    <p className="text-white/25 text-[9px] uppercase tracking-wider">Radius</p>
                    <p className="text-white font-mono text-sm">{moon.radiusKm.toLocaleString()} km</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2.5">
                    <p className="text-white/25 text-[9px] uppercase tracking-wider">Distance</p>
                    <p className="text-white font-mono text-sm">{moon.distanceFromParentKm.toLocaleString()} km</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2.5">
                    <p className="text-white/25 text-[9px] uppercase tracking-wider">Orbital Period</p>
                    <p className="text-white font-mono text-sm">{moon.orbitalPeriodDays} days</p>
                  </div>
                  <div className="bg-black/30 rounded-lg p-2.5">
                    <p className="text-white/25 text-[9px] uppercase tracking-wider">Surface</p>
                    <p className="text-white text-xs leading-tight">{moon.surfaceType.split(",")[0]}</p>
                  </div>
                </div>

                {/* Notable Features */}
                <div className="flex flex-wrap gap-1.5">
                  {moon.notableFeatures.map((f, j) => (
                    <span key={j} className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded text-white/40">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
