"use client"

import { useState } from "react"

interface WeightCalculatorProps {
  planetName: string
  weightMultiplier: number
  surfaceGravity: number
  color: string
}

export default function WeightCalculator({ planetName, weightMultiplier, surfaceGravity, color }: WeightCalculatorProps) {
  const [weight, setWeight] = useState("")
  const [unit, setUnit] = useState<"kg" | "lbs">("kg")
  const [age, setAge] = useState("")
  const [ageFactor, setAgeFactor] = useState(1)

  const numWeight = parseFloat(weight) || 0
  const numAge = parseFloat(age) || 0

  const weightInKg = unit === "lbs" ? numWeight * 0.453592 : numWeight
  const planetWeight = weightInKg * weightMultiplier
  const displayWeight = unit === "lbs" ? planetWeight * 2.20462 : planetWeight

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">Your Stats on {planetName}</h3>

      {/* Unit toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setUnit("kg")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            unit === "kg" ? "bg-white/20 text-white" : "bg-white/5 text-white/40 hover:text-white/60"
          }`}
        >
          Metric (kg/cm)
        </button>
        <button
          onClick={() => setUnit("lbs")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            unit === "lbs" ? "bg-white/20 text-white" : "bg-white/5 text-white/40 hover:text-white/60"
          }`}
        >
          Imperial (lbs)
        </button>
      </div>

      {/* Weight input */}
      <div className="mb-4">
        <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Your weight on Earth</label>
        <div className="relative">
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={unit === "kg" ? "70" : "154"}
            className="w-full bg-black/40 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50 font-mono text-lg"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">{unit}</span>
        </div>
      </div>

      {/* Weight result */}
      {numWeight > 0 && (
        <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: `${color}15`, borderColor: `${color}30`, borderWidth: 1, borderStyle: "solid" }}>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Your weight on {planetName}</p>
          <p className="text-3xl font-bold text-white font-mono">
            {displayWeight.toFixed(1)} <span className="text-lg" style={{ color }}>{unit}</span>
          </p>
          <p className="text-white/30 text-xs mt-1">
            Surface gravity: {surfaceGravity} m/s2 ({weightMultiplier.toFixed(2)}x Earth)
          </p>
        </div>
      )}

      {/* Age input */}
      <div className="mb-4">
        <label className="block text-white/40 text-xs uppercase tracking-wider mb-2">Your age on Earth (years)</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="25"
          className="w-full bg-black/40 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/50 font-mono text-lg"
        />
      </div>

      {/* Age result */}
      {numAge > 0 && weightMultiplier > 0 && (
        <div className="p-4 rounded-xl" style={{ backgroundColor: `${color}15`, borderColor: `${color}30`, borderWidth: 1, borderStyle: "solid" }}>
          <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Your age on {planetName}</p>
          <p className="text-3xl font-bold text-white font-mono">
            {(numAge * (weightMultiplier !== 0 ? 1 / weightMultiplier : 0) * 9.81 / surfaceGravity * weightMultiplier).toFixed(1) !== "NaN"
              ? planetName === "The Sun" ? "N/A" : `${(numAge * (365.25 / (getYearDays(planetName)))).toFixed(2)}`
              : "N/A"
            }
            <span className="text-lg ml-1" style={{ color }}>{planetName} years</span>
          </p>
        </div>
      )}
    </div>
  )
}

function getYearDays(name: string): number {
  const map: Record<string, number> = {
    "Mercury": 87.97, "Venus": 224.7, "Earth": 365.25, "Mars": 687, "Jupiter": 4333,
    "Saturn": 10759, "Uranus": 30687, "Neptune": 60190, "Pluto": 90560, "The Sun": 1,
  }
  return map[name] || 365.25
}
