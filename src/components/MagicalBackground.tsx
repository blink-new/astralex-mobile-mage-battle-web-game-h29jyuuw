import React from 'react'

interface MagicalBackgroundProps {
  children: React.ReactNode
  variant?: 'default' | 'fire' | 'nature' | 'water' | 'light' | 'dark'
}

export function MagicalBackground({ children, variant = 'default' }: MagicalBackgroundProps) {
  const particles = Array.from({ length: 20 }, (_, i) => i)
  
  const getParticleColor = () => {
    switch (variant) {
      case 'fire': return 'bg-orange-500'
      case 'nature': return 'bg-green-500'
      case 'water': return 'bg-blue-500'
      case 'light': return 'bg-yellow-500'
      case 'dark': return 'bg-purple-500'
      default: return 'bg-orange-500'
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle}
            className={`absolute w-1 h-1 ${getParticleColor()} rounded-full opacity-30 magical-particle`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}