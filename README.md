<!-- BEGIN: cvd-org-header (auto-managed by scripts/inject-readme-header.ps1 in cdv-vps-ops; this block may be regenerated) -->

Part of the [Coded Vision Design](https://github.com/Coded-Vision-Design) organisation. Org-wide standards: [community profile](https://github.com/Coded-Vision-Design/.github) | [security disclosure](https://github.com/Coded-Vision-Design/.github/blob/main/SECURITY.md)

<!-- END: cvd-org-header -->
# What's That In Space?

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.183-black?logo=three.js)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Live Site](https://img.shields.io/badge/Live-whatsthatin.space-orange)](https://whatsthatin.space)

> An interactive space education experience featuring 3D planet exploration, real-time ISS tracking, and immersive visualisations of our solar system.

**[Visit the live site](https://whatsthatin.space)**

---

## Features

### 3D Solar System Explorer
Navigate through our solar system with interactive, high-fidelity 3D planet models rendered with React Three Fibre. Each planet includes detailed scientific data, orbital statistics, and realistic NASA-sourced textures.

### International Space Station
Explore the ISS with a detailed 3D model viewer, live positional data, and an interactive timeline showing what a typical day looks like for astronauts aboard the station.

### Artemis II Mission
Follow NASA's Artemis II mission with an animated lunar trajectory visualisation, crew profiles for each astronaut, and real mission milestone data. The trajectory viewer features a multi-layered Earth with day/night textures, cloud shadows, and normal mapping.

### Black Hole Visualisation
An interactive 3D black hole renderer with educational content explaining the physics of event horizons, accretion discs, and gravitational lensing.

### Planetary Weight Calculator
Calculate what you'd weigh on every planet in the solar system. A fun, educational tool that demonstrates how surface gravity varies across celestial bodies.

### Voyager Scroll Experience
A frame-by-frame scroll-driven animation telling the story of the Voyager II mission as you scroll through the page.

### Moon Gallery
Explore the major moons of our solar system with detailed imagery and scientific data for each satellite.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) | React framework with static site export |
| [React 19](https://react.dev/) | UI component library |
| [Three.js](https://threejs.org/) + [React Three Fibre](https://r3f.docs.pmnd.rs/) | 3D graphics and visualisation |
| [Drei](https://drei.docs.pmnd.rs/) | Helpers and abstractions for R3F |
| [TypeScript 5](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling |
| [Globe.gl](https://globe.gl/) | Globe visualisation |
| [pnpm](https://pnpm.io/) | Fast, disk-efficient package manager |

---

## Project Structure

```
app/
  page.tsx                      Home page - hero, mission overview, Voyager scroll
  iss/page.tsx                  ISS tracker and daily life timeline
  solar-system/page.tsx         Solar system overview with planet grid
  solar-system/[slug]/page.tsx  Individual planet pages (dynamic routes)
  solar-system/black-hole/      Black hole visualisation and education
  crew/[slug]/page.tsx          Artemis II crew member profiles
  technology/page.tsx           Space technology showcase

components/
  PlanetViewer.tsx              3D planet renderer with GLSL shaders
  TrajectoryViewer.tsx          Artemis II lunar trajectory animation
  ISSViewer.tsx                 3D ISS model viewer
  BlackHoleViewer.tsx           Interactive black hole renderer
  EarthGLBViewer.tsx            High-detail Earth GLB model
  VoyagerScroll.tsx             Frame-by-frame scroll animation
  WeightCalculator.tsx          Planetary weight calculator
  MoonSection.tsx               Moon gallery and data display
  ImageGallery.tsx              Responsive image gallery
  StarField.tsx                 Animated star background
  Header.tsx / Footer.tsx       Site navigation and footer

lib/
  planet-data.ts                Scientific data for all planets
  crew-data.ts                  Artemis II crew member information
  moon-data.ts                  Moon data for major satellites

public/
  models/                       3D GLB/GLTF models (Git LFS tracked)
  textures/                     Planet and surface textures
  nasa-iss-frames/              ISS animation frame sequence (WebP)
  voyager-frames/               Voyager II animation frames (WebP)
  images/                       Static images and photographs
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or later
- [pnpm](https://pnpm.io/) 9 or later
- [Git LFS](https://git-lfs.com/) (for 3D model files)

### Installation

```bash
# Clone the repository
git clone https://github.com/CodedVisionDesign/WhatsInSpace.git
cd WhatsInSpace

# Install Git LFS (if not already installed)
git lfs install
git lfs pull

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The site will be available at [http://localhost:3000](http://localhost:3000).

### Frame Sequence Conversion

The ISS and Voyager animation frames are stored as WebP files for efficient delivery. If you have original TIF source frames, convert them:

```bash
# Requires libwebp (cwebp command)
bash scripts/convert-frames.sh
```

### Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Build static export to `out/` |
| `pnpm lint` | Run ESLint |
| `pnpm spell` | Check spelling (British English, flags US spellings) |
| `pnpm spell:fix` | Spell check with suggestions |
| `pnpm start` | Start production server |

---

## Deployment

This site is deployed as a static export to [Hostinger](https://www.hostinger.co.uk/) via a GitHub Actions CI/CD pipeline.

### How it works

1. **Push to `main`** triggers the deployment workflow
2. **Quality checks** run first - ESLint, cspell (British English), and em dash detection
3. **Build** generates the static export in `out/`
4. **Deploy** uploads the build to Hostinger via FTPS
5. **Lighthouse** audits performance, accessibility, and SEO post-deploy

### PR Validation

Pull requests and non-main branches automatically run:
- Lint and spell checks
- Build verification
- Broken link detection
- Dependency security review
- Bundle size reporting

### Configuring Deployment

Set these secrets in your GitHub repository settings:

| Secret | Description |
|---|---|
| `FTP_SERVER` | Hostinger FTP server IP |
| `FTP_USERNAME` | FTP username |
| `FTP_PASSWORD` | FTP password |

---

## Architecture Decisions

- **Static export** - The entire site is pre-rendered at build time with `next export`. No server-side runtime needed, which means fast loading, simple hosting, and excellent cacheability.
- **Git LFS** - 3D model files (GLB format, up to 20MB each) are tracked with Git Large File Storage to keep the repository fast.
- **WebP frame sequences** - Animation frames are converted from TIF to WebP for ~90% size reduction while maintaining quality.
- **Client-side 3D** - All Three.js rendering happens in the browser. React Three Fibre provides a declarative API, and custom GLSL shaders handle planet surface rendering with normal mapping, specular highlights, and day/night transitions.
- **British English** - All content uses British English spelling, enforced by cspell in CI.

---

## Quality Standards

This project enforces:
- **British English** spelling via cspell (US spellings are flagged)
- **No em dashes** in source files (hyphens only)
- **ESLint** for code quality
- **Lighthouse CI** with minimum scores: accessibility 90%, performance 70%, SEO 80%, best practices 80%
- **Dependency security scanning** on pull requests
- **Broken link detection** in the static export

---

## Acknowledgements

- [NASA](https://www.nasa.gov/) for imagery, textures, mission data, and ISS information
- [NASA Visible Earth](https://visibleearth.nasa.gov/) for planet surface textures
- [Three.js](https://threejs.org/) community for 3D rendering tools
- [Pmndrs](https://github.com/pmndrs) for React Three Fibre and Drei

---

## Licence

This project is licensed under the [MIT Licence](LICENCE).

---

Built by [Coded Vision Design](https://codedvisiondesign.co.uk)
