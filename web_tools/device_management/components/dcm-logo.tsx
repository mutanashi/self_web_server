import { ServerCog } from "lucide-react"

interface DCMLogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function DCMLogo({ size = "md", showText = true }: DCMLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  return (
    <div className="flex items-center gap-2">
      <div className="bg-primary/20 rounded-md p-1 flex items-center justify-center">
        <ServerCog className={`text-primary ${sizeClasses[size]}`} />
      </div>
      {showText && <span className="font-semibold text-white whitespace-nowrap">DCM System</span>}
    </div>
  )
}
