/**
 * Download NASA satellite textures for realistic Earth/Moon rendering.
 *
 * Sources: Three.js example textures (NASA Blue Marble / public domain)
 * Run: node scripts/download-textures.js
 */

const https = require("https")
const http = require("http")
const fs = require("fs")
const path = require("path")

const OUT_DIR = path.join(__dirname, "..", "public", "textures")

const TEXTURES = [
  {
    name: "earth_day_4k.jpg",
    label: "Earth Day (Blue Marble 4K)",
    urls: [
      "https://unpkg.com/three-globe@2.41.12/example/img/earth-blue-marble.jpg",
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg",
    ],
  },
  {
    name: "earth_night_4k.jpg",
    label: "Earth Night (Black Marble)",
    urls: [
      "https://unpkg.com/three-globe@2.41.12/example/img/earth-night.jpg",
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_lights_2048.png",
    ],
  },
  {
    name: "earth_specular_2k.jpg",
    label: "Earth Specular (Water Mask)",
    urls: [
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg",
    ],
  },
  {
    name: "earth_clouds_2k.jpg",
    label: "Earth Clouds",
    urls: [
      "https://unpkg.com/three-globe@2.41.12/example/img/earth-clouds.png",
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png",
    ],
  },
  {
    name: "earth_normal_2k.jpg",
    label: "Earth Normal Map",
    urls: [
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg",
    ],
  },
  {
    name: "moon_2k.jpg",
    label: "Moon Surface",
    urls: [
      "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/moon_1024.jpg",
    ],
  },
]

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http
    proto.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        res.resume()
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
      }
      const file = fs.createWriteStream(dest)
      let bytes = 0
      res.on("data", (chunk) => { bytes += chunk.length })
      res.pipe(file)
      file.on("finish", () => { file.close(); resolve(bytes) })
      file.on("error", reject)
    }).on("error", reject)
  })
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

  console.log("Downloading NASA textures to public/textures/\n")

  for (const tex of TEXTURES) {
    const dest = path.join(OUT_DIR, tex.name)
    if (fs.existsSync(dest)) {
      const size = fs.statSync(dest).size
      console.log(`  ✓ ${tex.label} — already exists (${(size / 1024).toFixed(0)} KB)`)
      continue
    }

    let success = false
    for (const url of tex.urls) {
      try {
        process.stdout.write(`  ↓ ${tex.label}...`)
        const bytes = await download(url, dest)
        console.log(` done (${(bytes / 1024).toFixed(0)} KB)`)
        success = true
        break
      } catch (err) {
        console.log(` failed (${err.message}), trying next source...`)
        if (fs.existsSync(dest)) fs.unlinkSync(dest)
      }
    }

    if (!success) {
      console.log(`  ✗ ${tex.label} — ALL sources failed, will use procedural fallback`)
    }
  }

  console.log("\nDone! Start dev server with: pnpm dev")
}

main().catch(console.error)
