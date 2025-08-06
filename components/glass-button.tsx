"use client"

import type React from "react"
import { useRef, useState } from "react"

interface GlassButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  size?: "sm" | "md" | "lg"
}

export default function GlassButton({
  children,
  onClick,
  disabled = false,
  className = "",
  size = "md",
}: GlassButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setMousePos({ x, y })
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setMousePos({ x: 0, y: 0 })
  }

  return (
    <>
      {/* SVG Filter for Glass Distortion */}
      <svg style={{ display: "none" }}>
        <defs>
          <filter id="glass-distortion">
            <feTurbulence type="turbulence" baseFrequency="0.008" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="77" />
          </filter>
        </defs>
      </svg>

      <button
        ref={buttonRef}
        onClick={onClick}
        disabled={disabled}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`
          glass-button relative border border-white/20 rounded-xl cursor-pointer overflow-hidden
          transition-all duration-300 ease-out outline-none
          hover:scale-105 hover:border-white/40 hover:shadow-lg hover:shadow-amber-500/25
          active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          ${sizeClasses[size]} ${className}
        `}
        style={
          {
            "--bg-color": "rgba(245, 158, 11, 0.15)",
            "--bg-hover": "rgba(245, 158, 11, 0.25)",
            "--highlight": "rgba(255, 255, 255, 0.4)",
            "--text": "#ffffff",
            "--shadow": "rgba(245, 158, 11, 0.3)",
          } as React.CSSProperties
        }
      >
        {/* Glass Filter Layer */}
        <div
          className="glass-filter absolute inset-0 rounded-xl"
          style={{
            zIndex: 1,
            backdropFilter: "blur(8px) saturate(120%)",
            WebkitBackdropFilter: "blur(8px) saturate(120%)",
            filter: "url(#glass-distortion) saturate(130%) brightness(1.1)",
          }}
        />

        {/* Base Color Layer */}
        <div
          className="glass-base absolute inset-0 rounded-xl transition-all duration-300"
          style={{
            zIndex: 2,
            background: isHovered ? "var(--bg-hover)" : "var(--bg-color)",
            boxShadow: "inset 0 1px 0 var(--highlight), 0 4px 12px var(--shadow)",
          }}
        />

        {/* Glass Specular Layer */}
        <div
          className="glass-specular absolute inset-0 rounded-xl transition-all duration-200"
          style={{
            zIndex: 3,
            boxShadow: "inset 1px 1px 2px rgba(255,255,255,0.3)",
            background: isHovered
              ? `radial-gradient(
                  circle at ${mousePos.x}px ${mousePos.y}px,
                  rgba(255,255,255,0.25) 0%,
                  rgba(255,255,255,0.1) 30%,
                  rgba(255,255,255,0.05) 60%,
                  transparent 80%
                )`
              : "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)",
          }}
        />

        {/* Glass Content */}
        <div
          className="glass-content relative font-semibold tracking-wide transition-all duration-200"
          style={{
            zIndex: 4,
            color: "var(--text)",
            textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            transform: isHovered ? "translateY(-1px)" : "translateY(0)",
          }}
        >
          {children}
        </div>
      </button>

      <style jsx>{`
        .glass-button:hover {
          --bg-color: rgba(245, 158, 11, 0.25);
          --shadow: rgba(245, 158, 11, 0.4);
        }
        
        @media (prefers-color-scheme: dark) {
          .glass-button {
            --bg-color: rgba(245, 158, 11, 0.2);
            --bg-hover: rgba(245, 158, 11, 0.3);
            --highlight: rgba(255, 255, 255, 0.3);
          }
        }
      `}</style>
    </>
  )
}
