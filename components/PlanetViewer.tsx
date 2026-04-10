"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface PlanetViewerProps {
  slug: string
  color: string
  accentColor: string
  hasRings?: boolean
  ringColor?: string
  size?: number
  rotationSpeed?: number
  hasAtmosphere?: boolean
  atmosphereColor?: string
  isStar?: boolean
}

// Earth GLSL shaders (photorealistic day/night/specular)
const EARTH_VERT = `
varying vec2 vUv; varying vec3 vWorldNormal; varying vec3 vWorldPosition;
void main() {
  vUv = uv;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const EARTH_FRAG = `
uniform sampler2D dayTexture; uniform sampler2D nightTexture; uniform sampler2D specularMap;
uniform vec3 sunDirection;
varying vec2 vUv; varying vec3 vWorldNormal; varying vec3 vWorldPosition;
void main() {
  vec3 n = normalize(vWorldNormal);
  float NdotL = dot(n, sunDirection);
  float diffuse = max(0.0, NdotL);
  float dayMix = smoothstep(-0.15, 0.2, NdotL);
  vec3 day = texture2D(dayTexture, vUv).rgb * (0.06 + 0.94 * diffuse);
  vec3 night = texture2D(nightTexture, vUv).rgb * 1.8;
  float spec = texture2D(specularMap, vUv).r;
  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
  vec3 reflDir = reflect(-sunDirection, n);
  float specH = pow(max(0.0, dot(viewDir, reflDir)), 96.0);
  day += vec3(0.9, 0.93, 1.0) * specH * spec * 0.6;
  gl_FragColor = vec4(mix(night, day, dayMix), 1.0);
}`

const ATMOS_VERT = `
varying vec3 vNormal; varying vec3 vPosition; varying vec3 vWorldNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const ATMOS_FRAG = `
uniform vec3 sunDirection;
varying vec3 vNormal; varying vec3 vPosition; varying vec3 vWorldNormal;
void main() {
  vec3 viewDir = normalize(-vPosition);
  float rim = 1.0 - max(0.0, dot(normalize(vNormal), viewDir));
  float fresnel = pow(rim, 3.0);
  float sunFacing = max(0.0, dot(normalize(vWorldNormal), sunDirection));
  vec3 color = mix(vec3(0.15, 0.35, 0.9), vec3(0.4, 0.7, 1.0), rim);
  color = mix(color, vec3(0.6, 0.85, 1.0), sunFacing * 0.3);
  gl_FragColor = vec4(color, fresnel * (0.8 + 0.5 * sunFacing));
}`

export default function PlanetViewer({
  slug,
  color,
  accentColor,
  hasRings = false,
  ringColor = "#C9B87C",
  size = 1.0,
  rotationSpeed = 0.003,
  hasAtmosphere = true,
  atmosphereColor,
  isStar = false,
}: PlanetViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const w = container.clientWidth
    const h = container.clientHeight
    const isEarth = slug === "earth"

    const scene = new THREE.Scene()
    const camZ = hasRings ? 7.0 : isStar ? 6.0 : 4.5
    const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100)
    camera.position.set(0, 0.3, camZ)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(w, h)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    if (isEarth) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.1
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    // Lighting
    const sunDir = new THREE.Vector3(-1, 0.3, 0.5).normalize()
    scene.add(new THREE.AmbientLight(0x222233, isStar ? 0.3 : 0.4))
    const sunLight = new THREE.DirectionalLight(0xfff5e0, isStar ? 0.5 : 2.5)
    sunLight.position.copy(sunDir.clone().multiplyScalar(20))
    scene.add(sunLight)

    const loader = new THREE.TextureLoader()
    const planetGeo = new THREE.SphereGeometry(size, 128, 64)
    let planet: THREE.Mesh
    let cloudMesh: THREE.Mesh | null = null

    if (isEarth) {
      // Photorealistic Earth with NASA textures + GLSL shaders
      const procTex = createProceduralEarth(2048)
      const uniforms = {
        dayTexture: { value: procTex as THREE.Texture },
        nightTexture: { value: new THREE.DataTexture(new Uint8Array([0,0,0,255]), 1, 1, THREE.RGBAFormat) as THREE.Texture },
        specularMap: { value: new THREE.DataTexture(new Uint8Array([0,0,0,255]), 1, 1, THREE.RGBAFormat) as THREE.Texture },
        sunDirection: { value: sunDir.clone() },
      }
      // Load real textures
      loader.load("/textures/earth_day_4k.jpg", (t) => { t.colorSpace = THREE.SRGBColorSpace; uniforms.dayTexture.value = t })
      loader.load("/textures/earth_night_4k.jpg", (t) => { t.colorSpace = THREE.SRGBColorSpace; uniforms.nightTexture.value = t })
      loader.load("/textures/earth_specular_2k.jpg", (t) => { t.colorSpace = THREE.LinearSRGBColorSpace; uniforms.specularMap.value = t })

      planet = new THREE.Mesh(planetGeo, new THREE.ShaderMaterial({
        vertexShader: EARTH_VERT,
        fragmentShader: EARTH_FRAG,
        uniforms,
      }))
      scene.add(planet)

      // Subtle atmosphere haze (no heavy blue glow)
      scene.add(new THREE.Mesh(
        new THREE.SphereGeometry(size * 1.02, 64, 32),
        new THREE.MeshBasicMaterial({ color: 0x88bbff, transparent: true, opacity: 0.04, side: THREE.BackSide })
      ))

      // Cloud layer
      const cloudGeo = new THREE.SphereGeometry(size * 1.012, 64, 32)
      const cloudMat = new THREE.MeshPhongMaterial({ transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide, color: 0xffffff })
      cloudMesh = new THREE.Mesh(cloudGeo, cloudMat)
      scene.add(cloudMesh)
      loader.load("/textures/earth_clouds_2k.jpg", (t) => {
        t.colorSpace = THREE.SRGBColorSpace
        cloudMat.map = t
        cloudMat.needsUpdate = true
      })

    } else {
      // ── Real NASA textures + per-planet shaders ──────────────────
      const textureMap: Record<string, string> = {
        sun: "/textures/2k_sun.jpg",
        mercury: "/textures/2k_mercury.jpg",
        venus: "/textures/2k_venus_surface.jpg",
        mars: "/textures/2k_mars.jpg",
        jupiter: "/textures/8k_jupiter.jpg",
        saturn: "/textures/8k_saturn.jpg",
        uranus: "/textures/2k_uranus.jpg",
        neptune: "/textures/2k_neptune.jpg",
        pluto: "/textures/2k_pluto.jpg",
      }

      // Procedural fallback while texture loads
      const fb = document.createElement("canvas"); fb.width = 512; fb.height = 256
      const fbCtx = fb.getContext("2d")!; fbCtx.fillStyle = color; fbCtx.fillRect(0,0,512,256)
      const fallbackTex = new THREE.CanvasTexture(fb); fallbackTex.colorSpace = THREE.SRGBColorSpace

      if (isStar) {
        // ── Sun: emissive shader with animated corona ──────────────
        const sunUniforms = { uTexture: { value: fallbackTex as THREE.Texture }, uTime: { value: 0 } }
        if (textureMap[slug]) loader.load(textureMap[slug], (t) => { t.colorSpace = THREE.SRGBColorSpace; sunUniforms.uTexture.value = t })

        const SUN_VERT = `varying vec2 vUv; varying vec3 vNormal; varying vec3 vPosition;
          void main() { vUv = uv; vNormal = normalize(normalMatrix * normal); vPosition = (modelViewMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`
        const SUN_FRAG = `uniform sampler2D uTexture; uniform float uTime; varying vec2 vUv; varying vec3 vNormal; varying vec3 vPosition;
          void main() {
            vec2 uv = vUv;
            uv.x += sin(uv.y * 12.0 + uTime * 0.3) * 0.005;
            uv.y += cos(uv.x * 10.0 + uTime * 0.2) * 0.004;
            vec3 tex = texture2D(uTexture, uv).rgb;
            vec3 viewDir = normalize(-vPosition);
            float rim = max(0.0, dot(normalize(vNormal), viewDir));
            float limb = 0.6 + 0.4 * rim;
            float pulse = 1.0 + 0.03 * sin(uTime * 1.5);
            vec3 col = tex * limb * pulse * 1.3;
            col += vec3(0.3, 0.1, 0.0) * (1.0 - rim) * 0.3;
            gl_FragColor = vec4(col, 1.0);
          }`

        planet = new THREE.Mesh(planetGeo, new THREE.ShaderMaterial({ vertexShader: SUN_VERT, fragmentShader: SUN_FRAG, uniforms: sunUniforms }))
        scene.add(planet)
        ;(planet as any).__sunUniforms = sunUniforms

        // Multi-layer corona
        ;[{ s: 1.15, o: 0.08, c: 0xffaa33 }, { s: 1.3, o: 0.04, c: 0xff8800 }, { s: 1.6, o: 0.02, c: 0xff6600 }].forEach(({ s: sc, o, c }) => {
          scene.add(new THREE.Mesh(new THREE.SphereGeometry(size * sc, 32, 16), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, side: THREE.BackSide, blending: THREE.AdditiveBlending })))
        })

      } else {
        // ── Planets: GLSL shader with NASA texture for photorealistic lighting ──
        const isGasGiant = ["jupiter", "saturn", "uranus", "neptune"].includes(slug)
        const PLANET_VERT = `
          varying vec2 vUv; varying vec3 vWorldNormal; varying vec3 vWorldPosition;
          void main() {
            vUv = uv;
            vWorldNormal = normalize(mat3(modelMatrix) * normal);
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`
        const PLANET_FRAG = `
          uniform sampler2D uTexture; uniform vec3 sunDirection;
          varying vec2 vUv; varying vec3 vWorldNormal; varying vec3 vWorldPosition;
          void main() {
            vec3 n = normalize(vWorldNormal);
            float NdotL = dot(n, sunDirection);
            float diffuse = max(0.0, NdotL);
            vec3 tex = texture2D(uTexture, vUv).rgb;
            // Ambient + diffuse lighting
            vec3 lit = tex * (${isGasGiant ? '0.08' : '0.06'} + ${isGasGiant ? '0.92' : '0.94'} * diffuse);
            // Limb darkening
            vec3 viewDir = normalize(cameraPosition - vWorldPosition);
            float rim = max(0.0, dot(n, viewDir));
            lit *= 0.7 + 0.3 * rim;
            ${isGasGiant ? `
            // Gas giant band enhancement -boost contrast along latitude
            float lat = abs(vUv.y - 0.5) * 2.0;
            lit *= 0.95 + 0.05 * sin(lat * 40.0);
            // Specular sheen on atmosphere (subtle)
            vec3 halfDir = normalize(sunDirection + viewDir);
            float spec = pow(max(0.0, dot(n, halfDir)), 32.0);
            lit += vec3(1.0, 0.95, 0.85) * spec * 0.08;
            ` : `
            // Rocky planet specular
            vec3 halfDir = normalize(sunDirection + viewDir);
            float spec = pow(max(0.0, dot(n, halfDir)), 64.0);
            lit += vec3(0.9, 0.9, 1.0) * spec * ${slug === "venus" ? '0.02' : '0.12'};
            `}
            gl_FragColor = vec4(lit, 1.0);
          }`
        const planetUniforms = {
          uTexture: { value: fallbackTex as THREE.Texture },
          sunDirection: { value: sunDir.clone() },
        }
        if (textureMap[slug]) loader.load(textureMap[slug], (t) => {
          t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy()
          planetUniforms.uTexture.value = t
        })
        planet = new THREE.Mesh(planetGeo, new THREE.ShaderMaterial({
          vertexShader: PLANET_VERT, fragmentShader: PLANET_FRAG, uniforms: planetUniforms,
        }))
        scene.add(planet)

        // ── Per-planet Fresnel atmosphere shaders ──────────────────
        const atmosConfigs: Record<string, { color: string; innerColor: string; opacity: number; scale: number; power: number; thick?: boolean }> = {
          venus:   { color: "#e8c56a", innerColor: "#d4a830", opacity: 0.2, scale: 1.12, power: 2.0, thick: true },
          mars:    { color: "#c4704a", innerColor: "#a85530", opacity: 0.08, scale: 1.04, power: 3.5 },
          jupiter: { color: "#c4955a", innerColor: "#a87840", opacity: 0.1, scale: 1.06, power: 3.0 },
          saturn:  { color: "#c9b87c", innerColor: "#b5a060", opacity: 0.08, scale: 1.05, power: 3.0 },
          uranus:  { color: "#7ec8d4", innerColor: "#5aafbc", opacity: 0.12, scale: 1.08, power: 2.5 },
          neptune: { color: "#4466cc", innerColor: "#3355aa", opacity: 0.12, scale: 1.08, power: 2.5 },
        }
        const cfg = atmosConfigs[slug]
        if (cfg) {
          const PATMOS_FRAG = `uniform vec3 uAtmosColor; uniform vec3 uInnerColor; uniform float uOpacity; uniform vec3 sunDirection;
            varying vec3 vNormal; varying vec3 vPosition; varying vec3 vWorldNormal;
            void main() {
              vec3 viewDir = normalize(-vPosition);
              float rim = 1.0 - max(0.0, dot(normalize(vNormal), viewDir));
              float fresnel = pow(rim, ${cfg.power.toFixed(1)});
              float sunFacing = max(0.0, dot(normalize(vWorldNormal), sunDirection));
              vec3 col = mix(uInnerColor, uAtmosColor, rim);
              col = mix(col, uAtmosColor * 1.3, sunFacing * 0.3);
              float intensity = uOpacity * (${cfg.thick ? '1.5' : '0.8'} + 0.5 * sunFacing);
              gl_FragColor = vec4(col, fresnel * intensity);
            }`
          const atmosU = {
            uAtmosColor: { value: new THREE.Color(cfg.color) },
            uInnerColor: { value: new THREE.Color(cfg.innerColor) },
            uOpacity: { value: cfg.opacity },
            sunDirection: { value: sunDir.clone() },
          }
          scene.add(new THREE.Mesh(new THREE.SphereGeometry(size * cfg.scale, 64, 32), new THREE.ShaderMaterial({
            vertexShader: ATMOS_VERT, fragmentShader: PATMOS_FRAG, uniforms: atmosU,
            transparent: true, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending,
          })))
          // Venus: extra inner haze
          if (cfg.thick) {
            scene.add(new THREE.Mesh(new THREE.SphereGeometry(size * 1.02, 64, 32),
              new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.12, side: THREE.FrontSide, depthWrite: false })))
          }
        } else if (hasAtmosphere) {
          // Minimal glow fallback (Mercury, Pluto)
          scene.add(new THREE.Mesh(new THREE.SphereGeometry(size * 1.03, 32, 16),
            new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.04, side: THREE.BackSide })))
        }
      }
    }

    // Per-planet ring systems
    if (hasRings) {
      const ringW = 2048
      const rc = document.createElement("canvas"); rc.width = ringW; rc.height = 1
      const rCtx = rc.getContext("2d")!

      // Per-planet ring profiles
      if (slug === "saturn") {
        // Saturn: load real ring alpha texture, fallback to procedural
        const rGrad = rCtx.createLinearGradient(0, 0, ringW, 0)
        rGrad.addColorStop(0, "rgba(0,0,0,0)")
        rGrad.addColorStop(0.04, "rgba(160,140,100,0.08)")
        rGrad.addColorStop(0.08, "rgba(180,160,120,0.3)")
        rGrad.addColorStop(0.12, "rgba(200,180,140,0.55)")
        rGrad.addColorStop(0.18, "rgba(210,190,155,0.75)")
        rGrad.addColorStop(0.28, "rgba(225,205,170,0.9)")
        rGrad.addColorStop(0.36, "rgba(215,195,160,0.8)")
        rGrad.addColorStop(0.40, "rgba(200,180,145,0.6)")
        rGrad.addColorStop(0.42, "rgba(30,25,15,0.03)")     // Cassini Division
        rGrad.addColorStop(0.47, "rgba(30,25,15,0.03)")     // Cassini Division
        rGrad.addColorStop(0.49, "rgba(195,175,140,0.65)")
        rGrad.addColorStop(0.55, "rgba(190,170,135,0.6)")
        rGrad.addColorStop(0.60, "rgba(185,165,130,0.5)")
        rGrad.addColorStop(0.63, "rgba(150,135,105,0.2)")   // Encke gap
        rGrad.addColorStop(0.65, "rgba(175,155,120,0.45)")
        rGrad.addColorStop(0.72, "rgba(160,140,110,0.25)")
        rGrad.addColorStop(0.78, "rgba(140,120,95,0.08)")    // F ring
        rGrad.addColorStop(0.82, "rgba(0,0,0,0)")
        rGrad.addColorStop(1, "rgba(0,0,0,0)")
        rCtx.fillStyle = rGrad; rCtx.fillRect(0, 0, ringW, 1)
        // Add fine noise for particle texture
        for (let x = 0; x < ringW; x++) {
          if (Math.random() < 0.3) {
            const a = Math.random() * 0.06
            rCtx.fillStyle = `rgba(255,255,255,${a})`
            rCtx.fillRect(x, 0, 1, 1)
          }
        }
      } else if (slug === "jupiter") {
        // Jupiter: extremely faint, thin gossamer rings
        const rGrad = rCtx.createLinearGradient(0, 0, ringW, 0)
        rGrad.addColorStop(0, "rgba(0,0,0,0)")
        rGrad.addColorStop(0.15, "rgba(0,0,0,0)")
        rGrad.addColorStop(0.2, "rgba(150,120,80,0.06)")     // Main ring inner
        rGrad.addColorStop(0.3, "rgba(160,130,90,0.1)")      // Main ring
        rGrad.addColorStop(0.4, "rgba(140,110,70,0.05)")     // Gossamer ring
        rGrad.addColorStop(0.6, "rgba(130,100,60,0.03)")     // Outer gossamer
        rGrad.addColorStop(0.8, "rgba(0,0,0,0)")
        rGrad.addColorStop(1, "rgba(0,0,0,0)")
        rCtx.fillStyle = rGrad; rCtx.fillRect(0, 0, ringW, 1)
      } else if (slug === "uranus") {
        // Uranus: narrow dark rings with gaps
        const rGrad = rCtx.createLinearGradient(0, 0, ringW, 0)
        rGrad.addColorStop(0, "rgba(0,0,0,0)")
        rGrad.addColorStop(0.15, "rgba(0,0,0,0)")
        rGrad.addColorStop(0.20, "rgba(100,120,140,0.15)")
        rGrad.addColorStop(0.22, "rgba(0,0,0,0)")            // gap
        rGrad.addColorStop(0.28, "rgba(90,110,130,0.12)")
        rGrad.addColorStop(0.30, "rgba(0,0,0,0)")            // gap
        rGrad.addColorStop(0.35, "rgba(80,100,120,0.1)")
        rGrad.addColorStop(0.37, "rgba(0,0,0,0)")            // gap
        rGrad.addColorStop(0.42, "rgba(100,130,160,0.2)")    // Epsilon ring (brightest)
        rGrad.addColorStop(0.45, "rgba(90,120,150,0.15)")
        rGrad.addColorStop(0.47, "rgba(0,0,0,0)")
        rGrad.addColorStop(0.55, "rgba(80,110,140,0.06)")    // outer dust
        rGrad.addColorStop(0.7, "rgba(0,0,0,0)")
        rGrad.addColorStop(1, "rgba(0,0,0,0)")
        rCtx.fillStyle = rGrad; rCtx.fillRect(0, 0, ringW, 1)
      } else if (slug === "neptune") {
        // Neptune: very faint, clumpy arc rings
        const rGrad = rCtx.createLinearGradient(0, 0, ringW, 0)
        rGrad.addColorStop(0, "rgba(0,0,0,0)")
        rGrad.addColorStop(0.2, "rgba(0,0,0,0)")
        rGrad.addColorStop(0.25, "rgba(60,80,120,0.04)")     // Galle ring
        rGrad.addColorStop(0.28, "rgba(0,0,0,0)")
        rGrad.addColorStop(0.35, "rgba(70,90,130,0.06)")     // Le Verrier ring
        rGrad.addColorStop(0.37, "rgba(0,0,0,0)")
        rGrad.addColorStop(0.50, "rgba(80,100,150,0.08)")    // Adams ring
        rGrad.addColorStop(0.53, "rgba(0,0,0,0)")
        rGrad.addColorStop(0.7, "rgba(0,0,0,0)")
        rGrad.addColorStop(1, "rgba(0,0,0,0)")
        rCtx.fillStyle = rGrad; rCtx.fillRect(0, 0, ringW, 1)
      } else {
        // Fallback
        const rGrad = rCtx.createLinearGradient(0, 0, ringW, 0)
        rGrad.addColorStop(0, "rgba(0,0,0,0)")
        rGrad.addColorStop(0.15, `${ringColor}60`)
        rGrad.addColorStop(0.5, `${ringColor}30`)
        rGrad.addColorStop(0.85, `${ringColor}10`)
        rGrad.addColorStop(1, "rgba(0,0,0,0)")
        rCtx.fillStyle = rGrad; rCtx.fillRect(0, 0, ringW, 1)
      }

      const ringTex = new THREE.CanvasTexture(rc)
      ringTex.magFilter = THREE.LinearFilter
      ringTex.minFilter = THREE.LinearMipmapLinearFilter
      const innerR = slug === "jupiter" ? size * 1.6 : size * 1.3
      const outerR = slug === "jupiter" ? size * 2.0 : size * 2.4
      const ringGeo = new THREE.RingGeometry(innerR, outerR, 128)
      // Fix UVs so the gradient maps radially
      const uvs = ringGeo.attributes.uv
      const pos = ringGeo.attributes.position
      for (let i = 0; i < uvs.count; i++) {
        const x = pos.getX(i), y = pos.getY(i)
        const dist = Math.sqrt(x * x + y * y)
        uvs.setXY(i, (dist - innerR) / (outerR - innerR), 0.5)
      }
      const ringMat = new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, side: THREE.DoubleSide, opacity: slug === "saturn" ? 0.9 : 0.85, depthWrite: false })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = slug === "uranus" ? -Math.PI * 0.45 : -Math.PI * 0.4
      scene.add(ring)
    }

    // Stars handled by StarField component in the page section -not in the canvas

    // Mouse orbit
    let isDrag = false, prevX = 0, camAngle = 0
    const onDown = (e: PointerEvent) => { isDrag = true; prevX = e.clientX }
    const onMove = (e: PointerEvent) => { if (!isDrag) return; camAngle -= (e.clientX - prevX) * 0.005; prevX = e.clientX }
    const onUp = () => { isDrag = false }
    renderer.domElement.addEventListener("pointerdown", onDown)
    renderer.domElement.addEventListener("pointermove", onMove)
    renderer.domElement.addEventListener("pointerup", onUp)
    renderer.domElement.style.touchAction = "none"

    let raf: number
    const animate = () => {
      raf = requestAnimationFrame(animate)
      planet.rotation.y += rotationSpeed
      if (cloudMesh) cloudMesh.rotation.y += rotationSpeed * 1.3
      // Animate sun shader
      if ((planet as any).__sunUniforms) {
        (planet as any).__sunUniforms.uTime.value = performance.now() * 0.001
      }
      camera.position.x = camZ * Math.sin(camAngle)
      camera.position.z = camZ * Math.cos(camAngle)
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
  }, [slug, color, accentColor, hasRings, ringColor, size, rotationSpeed, hasAtmosphere, atmosphereColor, isStar])

  return (
    <div ref={containerRef} className="relative z-10 w-full aspect-square cursor-grab active:cursor-grabbing" />
  )
}

function createProceduralEarth(res: number): THREE.CanvasTexture {
  const c = document.createElement("canvas"); c.width = res; c.height = res / 2
  const ctx = c.getContext("2d")!
  const g = ctx.createLinearGradient(0, 0, 0, res/2)
  g.addColorStop(0, "#1a3a5c"); g.addColorStop(0.3, "#1e4d7a"); g.addColorStop(0.5, "#1a5276"); g.addColorStop(0.7, "#1e4d7a"); g.addColorStop(1, "#1a3a5c")
  ctx.fillStyle = g; ctx.fillRect(0, 0, res, res/2)
  ctx.fillStyle = "#2d5a1e"
  const s = res / 1024
  const land = [[180,80,120,100],[170,100,80,70],[200,60,60,40],[230,200,60,120],[220,220,50,80],[440,80,60,50],[460,70,40,40],[460,150,70,120],[470,170,60,100],[520,60,180,100],[560,80,120,80],[600,100,80,60],[680,250,70,50],[690,260,50,40],[0,460,1024,52]]
  land.forEach(([x,y,w,h]) => { ctx.beginPath(); ctx.ellipse((x+w/2)*s,(y+h/2)*s,w/2*s,h/2*s,0,0,Math.PI*2); ctx.fill() })
  ctx.fillStyle = "#e8eef4"; ctx.fillRect(0,0,res,15*s); ctx.fillRect(0,res/2-15*s,res,15*s)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t
}
