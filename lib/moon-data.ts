export interface MoonData {
  name: string
  parentSlug: string
  radiusKm: number
  distanceFromParentKm: number
  orbitalPeriodDays: number
  discoveryYear: number
  discoveredBy: string
  description: string
  notableFeatures: string[]
  surfaceType: string
  texture?: string // texture path if available
  color: string
}

export const moonData: MoonData[] = [
  // Earth
  {
    name: "The Moon (Luna)",
    parentSlug: "earth",
    radiusKm: 1737.4,
    distanceFromParentKm: 384400,
    orbitalPeriodDays: 27.3,
    discoveryYear: -1,
    discoveredBy: "Known since antiquity",
    description: "Earth's only natural satellite and the fifth-largest moon in the solar system. It is tidally locked to Earth, always showing the same face. The Moon's gravitational pull drives Earth's tides and stabilizes its axial tilt. Twelve humans have walked on its surface during the Apollo program (1969-1972), and it is the target of NASA's Artemis program.",
    notableFeatures: ["Tidally locked to Earth", "Drives ocean tides", "Only celestial body visited by humans", "Has water ice at its poles", "Formed from a giant impact ~4.5 billion years ago"],
    surfaceType: "Rocky, cratered with maria (dark basaltic plains)",
    texture: "/textures/moon_2k.jpg",
    color: "#888888",
  },

  // Mars
  {
    name: "Phobos",
    parentSlug: "mars",
    radiusKm: 11.3,
    distanceFromParentKm: 9376,
    orbitalPeriodDays: 0.32,
    discoveryYear: 1877,
    discoveredBy: "Asaph Hall",
    description: "The larger and closer of Mars' two moons. Phobos orbits so close to Mars that it completes an orbit in just 7 hours 39 minutes, faster than Mars rotates. It is gradually spiraling inward and will either crash into Mars or break apart into a ring in about 50 million years. Its surface is covered in a thick layer of regolith and features the massive Stickney crater.",
    notableFeatures: ["Orbits faster than Mars rotates", "Spiraling inward toward Mars", "Stickney crater (9 km wide)", "Likely a captured asteroid", "Would appear 1/3 the size of Earth's Moon from Mars"],
    surfaceType: "Dark, heavily cratered, covered in regolith",
    color: "#8B7355",
  },
  {
    name: "Deimos",
    parentSlug: "mars",
    radiusKm: 6.2,
    distanceFromParentKm: 23460,
    orbitalPeriodDays: 1.26,
    discoveryYear: 1877,
    discoveredBy: "Asaph Hall",
    description: "The smaller and more distant of Mars' two moons. Deimos has a smoother surface than Phobos, with its craters filled in by regolith. It is slowly spiraling outward from Mars, the opposite of Phobos. From Mars' surface, Deimos would appear as a bright star-like point of light.",
    notableFeatures: ["Smoother surface than Phobos", "Slowly moving away from Mars", "One of the smallest moons in the solar system", "Named after the Greek god of dread"],
    surfaceType: "Smooth, regolith-covered",
    color: "#A09070",
  },

  // Jupiter (Galilean moons)
  {
    name: "Io",
    parentSlug: "jupiter",
    radiusKm: 1821.6,
    distanceFromParentKm: 421700,
    orbitalPeriodDays: 1.77,
    discoveryYear: 1610,
    discoveredBy: "Galileo Galilei",
    description: "The most volcanically active body in the solar system. Io's intense volcanism is driven by tidal heating from Jupiter's enormous gravity and orbital resonance with Europa and Ganymede. Over 400 active volcanoes erupt sulfur and sulfur dioxide, painting its surface in vivid yellows, reds, and oranges. Lava flows can reach 1,700\u00B0C.",
    notableFeatures: ["400+ active volcanoes", "Most volcanically active body in solar system", "Sulfur-covered surface", "Tidal heating from Jupiter", "No impact craters (constantly resurfaced)"],
    surfaceType: "Volcanic, sulfur and silicate lava flows",
    color: "#E8C840",
  },
  {
    name: "Europa",
    parentSlug: "jupiter",
    radiusKm: 1560.8,
    distanceFromParentKm: 671034,
    orbitalPeriodDays: 3.55,
    discoveryYear: 1610,
    discoveredBy: "Galileo Galilei",
    description: "One of the most promising places to search for extraterrestrial life. Beneath its smooth icy surface lies a global saltwater ocean containing perhaps twice as much water as all of Earth's oceans combined. Tidal heating keeps this ocean liquid. Water plumes have been detected erupting from cracks in the ice. NASA's Europa Clipper mission launched in 2024 to study its habitability.",
    notableFeatures: ["Global subsurface ocean", "More water than Earth", "Potential for life", "Smoothest surface in solar system", "Water plumes detected", "Europa Clipper mission (2024)"],
    surfaceType: "Smooth ice shell (10-30 km thick) over liquid ocean",
    color: "#C8B898",
  },
  {
    name: "Ganymede",
    parentSlug: "jupiter",
    radiusKm: 2634.1,
    distanceFromParentKm: 1070412,
    orbitalPeriodDays: 7.15,
    discoveryYear: 1610,
    discoveredBy: "Galileo Galilei",
    description: "The largest moon in the solar system, bigger than the planet Mercury. Ganymede is the only moon known to have its own magnetic field, which produces faint auroras. It has a subsurface saltwater ocean sandwiched between layers of ice. Its surface shows both ancient, heavily cratered dark regions and younger, lighter grooved terrain.",
    notableFeatures: ["Largest moon in solar system", "Larger than Mercury", "Has its own magnetic field", "Subsurface ocean", "Produces auroras"],
    surfaceType: "Mix of ancient dark terrain and younger grooved ice",
    color: "#A0A0A0",
  },
  {
    name: "Callisto",
    parentSlug: "jupiter",
    radiusKm: 2410.3,
    distanceFromParentKm: 1882709,
    orbitalPeriodDays: 16.69,
    discoveryYear: 1610,
    discoveredBy: "Galileo Galilei",
    description: "The most heavily cratered object in the solar system and Jupiter's second-largest moon. Callisto's surface has remained largely unchanged for 4 billion years, making it a record of the solar system's early bombardment history. It may also harbor a subsurface ocean. Its distance from Jupiter means it receives less radiation, making it a potential site for a future human base.",
    notableFeatures: ["Most cratered body in solar system", "4 billion year old surface", "Potential human base site", "Low radiation (far from Jupiter)", "May have subsurface ocean"],
    surfaceType: "Extremely heavily cratered ice and rock",
    color: "#706050",
  },

  // Saturn
  {
    name: "Titan",
    parentSlug: "saturn",
    radiusKm: 2574.7,
    distanceFromParentKm: 1221870,
    orbitalPeriodDays: 15.95,
    discoveryYear: 1655,
    discoveredBy: "Christiaan Huygens",
    description: "The second-largest moon in the solar system and the only moon with a substantial atmosphere (thicker than Earth's). Titan's surface features rivers, lakes, and seas of liquid methane and ethane. Its thick nitrogen atmosphere with methane creates an orange haze. ESA's Huygens probe landed on Titan in 2005, and NASA's Dragonfly rotorcraft will explore it starting in the 2030s.",
    notableFeatures: ["Only moon with thick atmosphere", "Liquid methane/ethane lakes and seas", "Nitrogen atmosphere (thicker than Earth's)", "Huygens probe landed 2005", "Dragonfly mission (2030s)", "Possible subsurface water ocean"],
    surfaceType: "Ice and rock with liquid hydrocarbon lakes",
    color: "#C4A050",
  },
  {
    name: "Enceladus",
    parentSlug: "saturn",
    radiusKm: 252.1,
    distanceFromParentKm: 237948,
    orbitalPeriodDays: 1.37,
    discoveryYear: 1789,
    discoveredBy: "William Herschel",
    description: "A small but extraordinary moon that shoots geysers of water ice and organic molecules from cracks (called 'tiger stripes') near its south pole. These plumes feed Saturn's E ring. Beneath its icy shell lies a global saltwater ocean with hydrothermal vents on the seafloor, conditions similar to where life began on Earth. One of the top candidates for extraterrestrial life.",
    notableFeatures: ["Water geysers from south pole", "Global subsurface ocean", "Hydrothermal vents on seafloor", "Feeds Saturn's E ring", "Top candidate for extraterrestrial life", "Tiger stripe fractures"],
    surfaceType: "Bright ice, smoothest and most reflective in solar system",
    color: "#F0F0F0",
  },
  {
    name: "Mimas",
    parentSlug: "saturn",
    radiusKm: 198.2,
    distanceFromParentKm: 185520,
    orbitalPeriodDays: 0.94,
    discoveryYear: 1789,
    discoveredBy: "William Herschel",
    description: "Famous for its enormous Herschel crater (130 km wide), which gives it a striking resemblance to the Death Star from Star Wars. The impact that created Herschel nearly destroyed Mimas. Despite its small size, recent evidence suggests it may harbor a young internal ocean.",
    notableFeatures: ["Death Star lookalike", "Herschel crater (1/3 of diameter)", "Nearly destroyed by crater impact", "May have internal ocean"],
    surfaceType: "Heavily cratered ice",
    color: "#C0C0C0",
  },

  // Uranus
  {
    name: "Miranda",
    parentSlug: "uranus",
    radiusKm: 235.8,
    distanceFromParentKm: 129390,
    orbitalPeriodDays: 1.41,
    discoveryYear: 1948,
    discoveredBy: "Gerard Kuiper",
    description: "The most geologically diverse moon in the solar system relative to its size. Miranda's surface is a bizarre patchwork of ancient cratered terrain and young, grooved regions called coronae. Verona Rupes, a cliff face 20 km high, is the tallest known cliff in the solar system. It may have been shattered by impacts and reassembled multiple times.",
    notableFeatures: ["Verona Rupes (20 km high cliff)", "Tallest cliff in solar system", "May have been shattered and reassembled", "Bizarre patchwork surface"],
    surfaceType: "Ice and rock, extreme terrain variation",
    color: "#A0A0B0",
  },
  {
    name: "Titania",
    parentSlug: "uranus",
    radiusKm: 788.4,
    distanceFromParentKm: 435910,
    orbitalPeriodDays: 8.71,
    discoveryYear: 1787,
    discoveredBy: "William Herschel",
    description: "The largest moon of Uranus and the eighth-largest in the solar system. Named after the queen of fairies in Shakespeare's A Midsummer Night's Dream. Its surface shows a mix of impact craters and a system of enormous canyons and fault scarps, suggesting past tectonic activity.",
    notableFeatures: ["Largest Uranian moon", "Named after Shakespeare character", "Enormous canyon systems", "Past tectonic activity"],
    surfaceType: "Ice and rock with canyons and craters",
    color: "#909090",
  },

  // Neptune
  {
    name: "Triton",
    parentSlug: "neptune",
    radiusKm: 1353.4,
    distanceFromParentKm: 354759,
    orbitalPeriodDays: 5.88,
    discoveryYear: 1846,
    discoveredBy: "William Lassell",
    description: "Neptune's largest moon and one of the coldest objects in the solar system (-235\u00B0C). Triton orbits retrograde (opposite to Neptune's rotation), strongly suggesting it was captured from the Kuiper Belt. Its surface features nitrogen ice geysers that shoot material 8 km into the sky. Triton is slowly spiraling inward and will eventually be torn apart by Neptune's gravity.",
    notableFeatures: ["Retrograde orbit (captured from Kuiper Belt)", "Nitrogen geysers (8 km high)", "One of coldest objects in solar system", "Will be destroyed by Neptune's gravity", "Cantaloupe-textured terrain"],
    surfaceType: "Nitrogen and methane ice, unique cantaloupe terrain",
    color: "#B0A0A0",
  },

  // Pluto
  {
    name: "Charon",
    parentSlug: "pluto",
    radiusKm: 606,
    distanceFromParentKm: 19571,
    orbitalPeriodDays: 6.39,
    discoveryYear: 1978,
    discoveredBy: "James Christy",
    description: "Pluto's largest moon, so large relative to Pluto (half its diameter) that the two are often considered a binary system. Both are tidally locked, always showing the same face to each other. Charon has a dark reddish polar cap made of organic molecules (tholins) transferred from Pluto's atmosphere. New Horizons revealed canyons, mountains, and a surprisingly complex geology.",
    notableFeatures: ["Half the size of Pluto (binary system)", "Mutually tidally locked", "Dark reddish polar cap (tholins)", "Complex geology", "Canyon system rivals Grand Canyon"],
    surfaceType: "Water ice with ammonia hydrates, reddish polar cap",
    color: "#808080",
  },
]

export function getMoonsForPlanet(slug: string): MoonData[] {
  return moonData.filter(m => m.parentSlug === slug)
}
