import { cn } from "@/lib/utils"

interface DrystoreCubeProps {
  size?: "sm" | "md" | "lg" | "xl"
  animated?: boolean
  className?: string
}

export function DrystoreCube({ size = "md", animated = false, className }: DrystoreCubeProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10", 
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  }

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Cubo principal com gradiente Drystore */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-drystore rounded-lg shadow-elegant transform rotate-45",
          animated && "animate-pulse"
        )}
      />
      
      {/* Highlight overlay para efeito 3D */}
      <div 
        className={cn(
          "absolute inset-0 bg-white opacity-20 rounded-lg transform rotate-45",
          animated && "animate-glow"
        )}
      />
      
      {/* Sombra interna para profundidade */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10 rounded-lg transform rotate-45"
        )}
      />
    </div>
  )
}