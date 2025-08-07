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
      <img 
        src="/lovable-uploads/5390c5b7-62ca-458e-8362-8a4956ea2274.png"
        alt="Drystore Cube Logo"
        className={cn(
          "w-full h-full object-contain",
          animated && "animate-pulse"
        )}
      />
    </div>
  )
}