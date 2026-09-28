//declaring props for the animated rainbow gradient text wrapper
interface RainbowTextProps {
  children: React.ReactNode
  className?: string
}

//RainbowText renders gradient-clipped letterforms with a wrapper drop-shadow glow
export function RainbowText({ children, className = '' }: RainbowTextProps) {
  return (
    <span className={`rainbow-text ${className}`}>
      <span className="rainbow-text-face animate-rainbow-flow">
        {children}
      </span>
    </span>
  )
}//RainbowText
