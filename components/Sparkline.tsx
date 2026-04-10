"use client"

import { useRef, useEffect, useState } from "react"

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  fillColor?: string
  className?: string
}

export default function Sparkline({
  data,
  width = 120,
  height = 32,
  color = "#f97316",
  fillColor = "rgba(249,115,22,0.1)",
  className = "",
}: SparklineProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    if (!svgRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true) },
      { threshold: 0.5 }
    )
    observer.observe(svgRef.current)
    return () => observer.disconnect()
  }, [])

  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pad = 2

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2)
    const y = height - pad - ((v - min) / range) * (height - pad * 2)
    return `${x},${y}`
  })

  const linePath = `M${points.join(" L")}`
  const fillPath = `${linePath} L${width - pad},${height} L${pad},${height} Z`
  const pathLength = data.length * 10

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      {/* Fill */}
      <path
        d={fillPath}
        fill={fillColor}
        opacity={animated ? 1 : 0}
        style={{ transition: "opacity 1s ease" }}
      />
      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLength}
        strokeDashoffset={animated ? 0 : pathLength}
        style={{ transition: "stroke-dashoffset 1.5s ease" }}
      />
    </svg>
  )
}
