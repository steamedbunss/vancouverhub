import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  GreetingAnimationClickMode,
  GreetingAnimationDirection,
  GreetingAnimationTrigger,
} from '../types'

//The component accepts the saved greeting animation options plus its text and gradient classes.
interface DecryptedTextProps {
  text: string
  animateOn: GreetingAnimationTrigger
  clickMode: GreetingAnimationClickMode
  speed: number
  maxIterations: number
  repeatIntervalSeconds: number
  revealDirection: GreetingAnimationDirection
  sequential: boolean
  useOriginalCharsOnly: boolean
  className?: string
}

//Build the character sequence used when revealing from the start, end, or center.
function getRevealOrder(text: string, direction: GreetingAnimationDirection) {
  const indices = Array.from(text, (_, index) => index).filter((index) => !/\s/.test(text[index]))
  if (direction === 'end') return indices.reverse()
  if (direction === 'center') {
    const center = (text.length - 1) / 2
    return indices.sort((first, second) => Math.abs(first - center) - Math.abs(second - center))
  }
  return indices
}

//Replace only unrevealed non-space characters so the text keeps its original shape.
function scrambleText(text: string, revealed: Set<number>, characters: string[]) {
  return Array.from(text, (character, index) => {
    if (/\s/.test(character) || revealed.has(index)) return character
    return characters[Math.floor(Math.random() * characters.length)] ?? character
  }).join('')
}

//DecryptedText reveals a string using a configurable scramble-and-reveal animation.
export function DecryptedText({
  text,
  animateOn,
  clickMode,
  speed,
  maxIterations,
  repeatIntervalSeconds,
  revealDirection,
  sequential,
  useOriginalCharsOnly,
  className = '',
}: DecryptedTextProps) {
  const textRef = useRef<HTMLSpanElement>(null)
  const timerRef = useRef<number | null>(null)
  const repeatTimeoutRef = useRef<number | null>(null)
  const startAnimationRef = useRef<() => void>(() => {})
  const isInViewRef = useRef(false)
  const hasStartedRef = useRef(false)
  const isCompleteRef = useRef(false)
  const [displayText, setDisplayText] = useState(text)
  //Choose either the original text's characters or the component's default scramble alphabet.
  const characters = useMemo(() => {
    const source = useOriginalCharsOnly
      ? Array.from(new Set(Array.from(text).filter((character) => !/\s/.test(character)))).join('')
      : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+'
    return Array.from(source || text || 'A')
  }, [text, useOriginalCharsOnly])

  //Stop the timer and expose the exact text once the reveal completes or motion is reduced.
  const finishAnimation = useCallback((shouldRepeat = true) => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current)
    timerRef.current = null
    hasStartedRef.current = true
    isCompleteRef.current = true
    setDisplayText(text)
    if (repeatTimeoutRef.current !== null) window.clearTimeout(repeatTimeoutRef.current)
    repeatTimeoutRef.current = null
    if (shouldRepeat && animateOn === 'view' && isInViewRef.current && repeatIntervalSeconds > 0) {
      repeatTimeoutRef.current = window.setTimeout(() => {
        repeatTimeoutRef.current = null
        if (!isInViewRef.current) return
        hasStartedRef.current = false
        isCompleteRef.current = false
        startAnimationRef.current()
      }, repeatIntervalSeconds * 1000)
    }
  }, [animateOn, repeatIntervalSeconds, text])

  //Run the animation once, honoring sequential reveal, iteration count, speed, and reduced motion.
  const startAnimation = useCallback(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true
    isCompleteRef.current = false

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finishAnimation(false)
      return
    }

    const revealOrder = getRevealOrder(text, revealDirection)
    if (revealOrder.length === 0) {
      finishAnimation()
      return
    }

    const revealed = new Set<number>()
    let iteration = 0
    let revealIndex = 0
    setDisplayText(scrambleText(text, revealed, characters))

    timerRef.current = window.setInterval(() => {
      iteration += 1
      if (sequential) {
        revealed.add(revealOrder[revealIndex])
        revealIndex += 1
        setDisplayText(scrambleText(text, revealed, characters))
        if (revealIndex >= revealOrder.length) finishAnimation()
      } else if (iteration >= Math.max(1, maxIterations)) {
        finishAnimation()
      } else {
        setDisplayText(scrambleText(text, revealed, characters))
      }
    }, Math.max(10, speed))
  }, [characters, finishAnimation, maxIterations, revealDirection, sequential, speed, text])

  startAnimationRef.current = startAnimation

  //Start view-triggered animations on entry and repeat only while the greeting remains visible.
  useEffect(() => {
    if (animateOn !== 'view') return
    const element = textRef.current
    if (!element) return
    if (!('IntersectionObserver' in window)) {
      isInViewRef.current = true
      startAnimation()
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        isInViewRef.current = true
        if (isCompleteRef.current && repeatTimeoutRef.current === null) {
          hasStartedRef.current = false
          isCompleteRef.current = false
        }
        startAnimation()
      } else {
        isInViewRef.current = false
        if (repeatTimeoutRef.current !== null) window.clearTimeout(repeatTimeoutRef.current)
        repeatTimeoutRef.current = null
      }
    }, { threshold: 0.2 })
    observer.observe(element)
    return () => {
      isInViewRef.current = false
      observer.disconnect()
    }
  }, [animateOn, startAnimation])

  //Clear active timers when this text unmounts so no animation work continues in the background.
  useEffect(() => () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current)
    if (repeatTimeoutRef.current !== null) window.clearTimeout(repeatTimeoutRef.current)
  }, [])

  //Hover mode can replay after the previous hover animation has finished.
  function handleMouseEnter() {
    if (animateOn !== 'hover') return
    if (isCompleteRef.current) {
      hasStartedRef.current = false
      isCompleteRef.current = false
    }
    startAnimation()
  }

  //Click mode either reveals once or toggles between the revealed and scrambled states.
  function handleClick() {
    if (animateOn !== 'click') return
    if (clickMode === 'toggle' && isCompleteRef.current) {
      hasStartedRef.current = false
      isCompleteRef.current = false
      setDisplayText(scrambleText(text, new Set(), characters))
      return
    }
    startAnimation()
  }

  //Hide the animated glyphs from assistive technology and provide the original text instead.
  return (
    <>
      <span
        ref={textRef}
        aria-hidden="true"
        className={className}
        onMouseEnter={animateOn === 'hover' ? handleMouseEnter : undefined}
        onClick={animateOn === 'click' ? handleClick : undefined}
        style={animateOn === 'click' ? { cursor: 'pointer' } : undefined}
      >
        {displayText}
      </span>
      <span className="sr-only">{text}</span>
    </>
  )
}
