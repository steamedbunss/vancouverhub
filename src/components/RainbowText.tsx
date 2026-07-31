//declaring props for the animated rainbow gradient text wrapper
interface RainbowTextProps {
  children: React.ReactNode
  className?: string
}

//RainbowText renders children twice: a blurred glow layer and a sharp face layer
//Both layers use the same rainbow-flow animation for a neon gradient effect
export function RainbowText({ children, className = '' }: RainbowTextProps) {
  return (
    <span className={`rainbow-text relative inline-block ${className}`}>
      {/*Glow layer sits behind the text with blur and reduced opacity*/}
      <span
        aria-hidden
        className="rainbow-text-glow absolute inset-0 bg-clip-text text-transparent bg-[length:200%_auto] blur-md opacity-70 animate-rainbow-flow"
      >
        {children}
      </span>
      {/*Face layer is the readable gradient text on top of the glow*/}
      <span
        className="rainbow-text-face relative bg-clip-text text-transparent bg-[length:200%_auto] animate-rainbow-flow"
      >
        {children}
      </span>
    </span>
  )
}//RainbowText
