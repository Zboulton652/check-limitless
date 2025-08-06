"use client"

import { useEffect, useState } from "react"

export default function FloatingElements() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Purple organic bubble shapes */}
      <div
        className="absolute w-32 h-32 opacity-0.5"
        style={{
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.2))",
          borderRadius: "50% 30% 70% 40%",
          transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
          top: "5%",
          left: "5%",
          transition: "transform 0.2s ease-out",
          filter: "blur(3px)",
        }}
      />

      <div
        className="absolute w-24 h-24 opacity-0.3"
        style={{
          background: "linear-gradient(225deg, rgba(167, 139, 250, 0.2), rgba(139, 92, 246, 0.1))",
          borderRadius: "30% 70% 40% 60%",
          transform: `translate(${mousePosition.x * -0.008}px, ${mousePosition.y * -0.008}px)`,
          top: "40%",
          right: "10%",
          transition: "transform 0.2s ease-out",
          filter: "blur(2.5px)",
        }}
      />

      {/* True Gold organic bubble shapes */}
      <div
        className="absolute w-28 h-28 opacity-0.4"
        style={{
          background: "linear-gradient(45deg, rgba(255, 215, 0, 0.3), rgba(218, 165, 32, 0.2))",
          borderRadius: "60% 40% 30% 70%",
          transform: `translate(${mousePosition.x * 0.012}px, ${mousePosition.y * 0.012}px)`,
          bottom: "15%",
          left: "15%",
          transition: "transform 0.2s ease-out",
          filter: "blur(2px)",
        }}
      />

      <div
        className="absolute w-20 h-20 opacity-0.3"
        style={{
          background: "linear-gradient(315deg, rgba(255, 193, 7, 0.25), rgba(184, 134, 11, 0.15))",
          borderRadius: "40% 60% 50% 30%",
          transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`,
          top: "70%",
          right: "30%",
          transition: "transform 0.3s ease-out",
          filter: "blur(1.5px)",
        }}
      />

      {/* Mixed purple and gold elements */}
      <div
        className="absolute w-16 h-16 opacity-0.2"
        style={{
          background: "linear-gradient(180deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.1))",
          borderRadius: "70% 30% 60% 40%",
          transform: `translate(${mousePosition.x * -0.006}px, ${mousePosition.y * -0.006}px)`,
          top: "20%",
          left: "60%",
          transition: "transform 0.3s ease-out",
          filter: "blur(3px)",
        }}
      />

      <div
        className="absolute w-18 h-18 opacity-0.25"
        style={{
          background: "linear-gradient(90deg, rgba(255, 215, 0, 0.2), rgba(139, 92, 246, 0.15))",
          borderRadius: "45% 55% 35% 65%",
          transform: `translate(${mousePosition.x * 0.008}px, ${mousePosition.y * 0.008}px)`,
          top: "60%",
          left: "80%",
          transition: "transform 0.3s ease-out",
          filter: "blur(2px)",
        }}
      />

      {/* Subtle light rays - purple and gold */}
      <div
        className="absolute w-0.5 h-48 opacity-1 bg-gradient-to-b from-violet-400/10 to-transparent"
        style={{
          transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px) rotate(15deg)`,
          top: "10%",
          left: "30%",
          transition: "transform 0.3s ease-out",
        }}
      />

      <div
        className="absolute w-0.5 h-32 opacity-0.8"
        style={{
          background: "linear-gradient(to bottom, rgba(255, 215, 0, 0.08), transparent)",
          transform: `translate(${mousePosition.x * -0.007}px, ${mousePosition.y * -0.007}px) rotate(-25deg)`,
          top: "30%",
          right: "25%",
          transition: "transform 0.3s ease-out",
        }}
      />

      {/* Minimal floating particles - mixed colors */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-0.5 h-0.5 rounded-full opacity-1"
          style={{
            background: i % 3 === 0 ? "rgba(255, 215, 0, 0.2)" : "rgba(139, 92, 246, 0.2)",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float ${4 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  )
}
