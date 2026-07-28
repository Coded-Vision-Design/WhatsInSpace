"use client";
// ============================================================================
//  SkyScene - the immersive "portal". A celestial sphere viewed from inside;
//  the camera orientation is driven (with damping) by the board's quaternion so
//  pointing the wand glides the sky behind a fixed reticle. Layers, front to back:
//  a deep procedural starfield (parallax depth), the real bright-star catalogue,
//  constellation lines, Sun/Moon/planet markers, the horizon - all under a bloom
//  pass for that glowing, looking-into-space feel.
// ============================================================================
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import {
  type Quat, type Vec3, deviceLookVector, applyAlignment, altAzToVector,
} from "@/lib/astro/coordinates";
import { type SkyStar, spectralColor, type ConstellationLine } from "@/lib/astro/starCatalogue";
import type { SkyBody } from "@/lib/astro/ephemeris";

const R = 100;

/** world (east,north,up) -> three.js (x=east, y=up, z=-north). */
function w2t(v: Vec3, r = R): THREE.Vector3 {
  return new THREE.Vector3(v[0], v[2], -v[1]).multiplyScalar(r);
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// In-canvas text label (a sprite from a 2D canvas texture) - no DOM, so it
// avoids the drei <Html> unmount race, and it picks up the bloom pass.
function makeLabelTexture(text: string, color: string) {
  const pad = 12, fontPx = 48;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const font = `700 ${fontPx}px system-ui, -apple-system, Segoe UI, sans-serif`;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2;
  const h = fontPx + pad * 2;
  canvas.width = w; canvas.height = h;
  ctx.font = font; ctx.textBaseline = "middle"; ctx.textAlign = "left";
  ctx.shadowColor = "rgba(0,0,0,0.9)"; ctx.shadowBlur = 10;
  ctx.fillStyle = color;
  ctx.fillText(text, pad, h / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  return { tex, aspect: w / h };
}

function Label({ text, color, position, size = 3.6 }: {
  text: string; color: string; position: THREE.Vector3 | [number, number, number]; size?: number;
}) {
  const { tex, aspect } = useMemo(() => makeLabelTexture(text, color), [text, color]);
  useEffect(() => () => tex.dispose(), [tex]);
  const pos: [number, number, number] = Array.isArray(position) ? position : [position.x, position.y, position.z];
  return (
    <sprite position={pos} scale={[size * aspect, size, 1]}>
      <spriteMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  );
}

const STAR_VERT = /* glsl */ `
  attribute float aSize; attribute vec3 aColor; attribute float aPhase;
  uniform float uTime;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (0.82 + 0.18 * sin(uTime * 2.1 + aPhase));
    gl_Position = projectionMatrix * mv;
  }`;
const STAR_FRAG = /* glsl */ `
  varying vec3 vColor;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.04, d);
    gl_FragColor = vec4(vColor, a);
  }`;

interface StarArrays { pos: Float32Array; col: Float32Array; siz: Float32Array; pha: Float32Array; }

function StarPoints({ arrays }: { arrays: StarArrays }) {
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arrays.pos, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(arrays.col, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(arrays.siz, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(arrays.pha, 1));
    return g;
  }, [arrays]);
  useEffect(() => () => geom.dispose(), [geom]);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: STAR_VERT, fragmentShader: STAR_FRAG,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }), []);
  useFrame(({ clock }) => { material.uniforms.uTime.value = clock.elapsedTime; });

  return <points geometry={geom}><primitive object={material} attach="material" /></points>;
}

/** Thousands of faint, fixed background stars for parallax depth. */
function DeepStarfield() {
  const arrays = useMemo<StarArrays>(() => {
    const N = 2600, rng = mulberry32(20260620);
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), siz = new Float32Array(N), pha = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const z = rng() * 2 - 1, phi = rng() * Math.PI * 2, rxy = Math.sqrt(1 - z * z);
      pos[i * 3] = rxy * Math.cos(phi) * R; pos[i * 3 + 1] = rxy * Math.sin(phi) * R; pos[i * 3 + 2] = z * R;
      const t = rng();
      const c = new THREE.Color().setHSL(0.58 + t * 0.06, 0.35, 0.55 + rng() * 0.25);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      siz[i] = 1.0 + rng() * 1.8;
      pha[i] = rng() * Math.PI * 2;
    }
    return { pos, col, siz, pha };
  }, []);
  return <StarPoints arrays={arrays} />;
}

function Starfield({ stars }: { stars: SkyStar[] }) {
  const arrays = useMemo<StarArrays>(() => {
    const vis = stars.filter((s) => s.altDeg > -10);
    const n = vis.length;
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), siz = new Float32Array(n), pha = new Float32Array(n);
    vis.forEach((s, i) => {
      const p = w2t(altAzToVector(s.altDeg, s.azDeg), R * 0.985);
      pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
      const c = new THREE.Color(spectralColor(s.spect));
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      siz[i] = Math.max(3, 18 - s.mag * 2.6);
      pha[i] = (s.raHours + i) % (Math.PI * 2);
    });
    return { pos, col, siz, pha };
  }, [stars]);
  return <StarPoints arrays={arrays} />;
}

function CameraRig({ qRef, qAlign, onAim }: {
  qRef: MutableRefObject<Quat>; qAlign: Quat; onAim?: (look: Vec3) => void;
}) {
  const { camera } = useThree();
  const cur = useRef(new THREE.Vector3(0, 0.4, -1).normalize());
  const last = useRef(0);
  useFrame(({ clock }) => {
    const look = applyAlignment(qAlign, deviceLookVector(qRef.current));
    const target = w2t(look, 1);
    cur.current.lerp(target, 0.16);                    // damping for fluid motion
    if (cur.current.lengthSq() < 1e-5) cur.current.copy(target);
    camera.position.set(0, 0, 0);
    camera.up.set(0, 1, 0);
    camera.lookAt(cur.current.clone().normalize().multiplyScalar(R));
    if (onAim && clock.elapsedTime - last.current > 0.12) { last.current = clock.elapsedTime; onAim(look); }
  });
  return null;
}

function ConstellationLines({ stars, lines }: { stars: SkyStar[]; lines: ConstellationLine[] }) {
  const geom = useMemo(() => {
    const byName = new Map(stars.map((s) => [s.name, s]));
    const pts: number[] = [];
    for (const c of lines)
      for (const [a, b] of c.pairs) {
        const sa = byName.get(a), sb = byName.get(b);
        if (!sa || !sb) continue;
        const pa = w2t(altAzToVector(sa.altDeg, sa.azDeg), R * 0.97);
        const pb = w2t(altAzToVector(sb.altDeg, sb.azDeg), R * 0.97);
        pts.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
    return g;
  }, [stars, lines]);
  useEffect(() => () => geom.dispose(), [geom]);
  return (
    <lineSegments geometry={geom}>
      <lineBasicMaterial color="#3460a8" transparent opacity={0.45} />
    </lineSegments>
  );
}

function BodyMarker({ body, highlighted }: { body: SkyBody; highlighted: boolean }) {
  const p = w2t(altAzToVector(body.altDeg, body.azDeg), R * 0.9);
  const size = body.kind === "sun" ? 2.8 : body.kind === "moon" ? 2.3 : body.kind === "satellite" ? 0.7 : 1.2;
  return (
    <group position={p}>
      <mesh>
        <sphereGeometry args={[size, 24, 24]} />
        <meshBasicMaterial color={body.color} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[size * (highlighted ? 2.4 : 1.8), 24, 24]} />
        <meshBasicMaterial color={body.color} transparent opacity={highlighted ? 0.28 : 0.16} toneMapped={false} />
      </mesh>
      <Label
        text={body.name}
        color={highlighted ? "#bfe4ff" : "rgba(255,255,255,0.72)"}
        position={[0, size + 2.4, 0]}
        size={highlighted ? 3.4 : 2.9}
      />
    </group>
  );
}

function Horizon() {
  const ring = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let a = 0; a <= 360; a += 2) pts.push(w2t(altAzToVector(0, a), R));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);
  const cardinals: [string, number][] = [["N", 0], ["E", 90], ["S", 180], ["W", 270]];
  return (
    <group>
      <line geometry={ring}>
        <lineBasicMaterial color="#46618d" transparent opacity={0.55} />
      </line>
      {cardinals.map(([label, az]) => (
        <Label key={label} text={label} color="#9fc0ea" position={w2t(altAzToVector(0, az), R * 0.985)} size={5} />
      ))}
    </group>
  );
}

export interface SkySceneProps {
  qRef: MutableRefObject<Quat>;
  qAlign: Quat;
  stars: SkyStar[];
  bodies: SkyBody[];
  constellations: ConstellationLine[];
  highlightId?: string | null;
  onAim?: (look: Vec3) => void;
}

export default function SkyScene(props: SkySceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 0], fov: 64, near: 0.1, far: 1000 }}
      gl={{ antialias: true }}
      dpr={[1, 2]}
      style={{ position: "absolute", inset: 0 }}
    >
      <color attach="background" args={["#03050c"]} />
      <fog attach="fog" args={["#03050c", R * 1.4, R * 2.2]} />
      <CameraRig qRef={props.qRef} qAlign={props.qAlign} onAim={props.onAim} />
      <DeepStarfield />
      <Starfield stars={props.stars} />
      <ConstellationLines stars={props.stars} lines={props.constellations} />
      <Horizon />
      {props.bodies.map((b) => (
        <BodyMarker key={b.id} body={b} highlighted={props.highlightId === b.id} />
      ))}
      <EffectComposer>
        <Bloom intensity={0.9} luminanceThreshold={0.25} luminanceSmoothing={0.85} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.25} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}
