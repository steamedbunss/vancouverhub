import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type { OnboardingStep } from './onboardingSteps'

interface OnboardingTooltipProps {
  step: OnboardingStep
  stepIndex: number
  totalSteps: number
  targetRect: DOMRect | null
  onPrevious: () => void
  onContinue: () => void
  onExit: () => void
}

//OnboardingTooltip explains the active feature and provides tour controls
export function OnboardingTooltip({ step, stepIndex, totalSteps, targetRect, onPrevious, onContinue, onExit }: OnboardingTooltipProps) {
  const tooltipRef = useRef<HTMLElement>(null)
  const [tooltipSize, setTooltipSize] = useState({ width: 320, height: 240 })
  useEffect(() => {
    const tooltip = tooltipRef.current
    if (!tooltip) return
    //Measure the rendered content so placement accounts for wrapped text and button rows.
    const measure = () => {
      const rect = tooltip.getBoundingClientRect()
      setTooltipSize({ width: rect.width, height: rect.height })
    }
    const observer = new ResizeObserver(measure)
    observer.observe(tooltip)
    window.addEventListener('resize', measure)
    measure()
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  //Keep the tooltip inside the viewport while leaving room around the highlighted target.
  const tooltipWidth = tooltipSize.width
  const tooltipHeight = tooltipSize.height
  const edge = 16
  const gap = 24
  const maxLeft = Math.max(edge, window.innerWidth - tooltipWidth - edge)
  const maxTop = Math.max(edge, window.innerHeight - tooltipHeight - edge)
  const clampTop = (top: number) => Math.min(Math.max(top, edge), maxTop)
  const isDesktop = window.innerWidth >= 900
  //Some steps request a specific side; all others prefer a clear side on desktop.
  const placesBelowCenter = step.placement === 'below-center'
  const placesUnderTarget = step.placement === 'below'
  const placesBelow = step.placement === 'below-left'
  const fitsRight = Boolean(targetRect && targetRect.right + gap + tooltipWidth <= window.innerWidth - edge)
  const fitsLeft = Boolean(targetRect && targetRect.left - gap - tooltipWidth >= edge)
  const placesRight = isDesktop && fitsRight
  const placesLeft = isDesktop && !fitsRight && fitsLeft
  //Center the tooltip on the target as a fallback when neither side has enough room.
  const centeredLeft = targetRect
    ? Math.min(Math.max(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, edge), maxLeft)
    : window.innerWidth / 2
  const tooltipLeft = !targetRect
    ? window.innerWidth / 2
    : placesBelowCenter
      ? centeredLeft
    : placesBelow || placesUnderTarget
      ? Math.min(Math.max(targetRect.left, edge), maxLeft)
    : placesRight
      ? targetRect.right + gap
      : placesLeft
        ? targetRect.left - tooltipWidth - gap
        : centeredLeft
  //Vertical placement follows the requested position when possible, then clamps to the viewport.
  const tooltipTop = targetRect
    ? placesBelowCenter || placesUnderTarget
      ? targetRect.bottom + gap + tooltipHeight <= window.innerHeight - edge
        ? targetRect.bottom + gap
        : clampTop(targetRect.top - tooltipHeight - gap)
      : placesBelow
      ? targetRect.bottom + 140 + tooltipHeight <= window.innerHeight - edge
        ? targetRect.bottom + 140
        : targetRect.top - tooltipHeight - gap >= edge
          ? targetRect.top - tooltipHeight - gap
          : clampTop(targetRect.top + targetRect.height / 2 - tooltipHeight / 2)
      : isDesktop
      ? clampTop(targetRect.top + targetRect.height / 2 - tooltipHeight / 2)
      : targetRect.bottom + gap + tooltipHeight <= window.innerHeight - edge
        ? targetRect.bottom + gap
        : targetRect.top - gap - tooltipHeight >= edge
          ? targetRect.top - gap - tooltipHeight
          : clampTop(targetRect.top + targetRect.height / 2 - tooltipHeight / 2)
    : window.innerHeight / 2
  //Place the arrow toward the target, clamping it away from the tooltip's rounded corners.
  const arrowOffset = targetRect
    ? isDesktop && !placesBelow && !placesUnderTarget && !placesBelowCenter
        ? Math.min(Math.max(targetRect.top + targetRect.height / 2 - tooltipTop, 24), tooltipHeight - 24)
      : Math.min(Math.max(targetRect.left + targetRect.width / 2 - tooltipLeft, 24), tooltipWidth - 24)
    : tooltipWidth / 2
  const tooltipStyle: CSSProperties = targetRect
    ? {
        left: tooltipLeft,
        top: tooltipTop,
      }
    : { left: tooltipLeft, top: tooltipTop, transform: 'translate(-50%, -50%)' }

  //Portal above the page overlay so the controls remain visible and interactive.
  return createPortal((
    <aside
      ref={tooltipRef}
      aria-label="Onboarding tutorial"
      className="fixed z-[1000] w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-slate-600 bg-slate-800 p-5 text-white shadow-2xl"
      style={tooltipStyle}
    >
      {stepIndex !== 0 && (
        <span
          aria-hidden="true"
          className={placesBelow || placesUnderTarget || placesBelowCenter
            ? 'absolute -top-4 h-4 w-7 bg-slate-800 [clip-path:polygon(0_100%,50%_0,100%_100%)]'
            : placesRight
            ? 'absolute -left-4 h-7 w-4 -translate-y-1/2 bg-slate-800 [clip-path:polygon(100%_0,100%_100%,0_50%)]'
            : isDesktop
              ? 'absolute -right-4 h-7 w-4 -translate-y-1/2 bg-slate-800 [clip-path:polygon(0_0,100%_50%,0_100%)]'
              : 'absolute -top-4 h-4 w-7 bg-slate-800 [clip-path:polygon(0_100%,50%_0,100%_100%)]'}
          style={placesBelow || placesUnderTarget || placesBelowCenter ? { left: arrowOffset - 14 } : isDesktop ? { top: arrowOffset } : { left: arrowOffset - 14 }}
        />
      )}
      <p className="text-xs font-bold tracking-[0.16em] text-slate-300 uppercase">
        {stepIndex === 0 ? 0 : stepIndex} of {totalSteps}
      </p>
      <h2 className="mt-2 text-lg font-bold tracking-tight">{step.title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-200">{step.description}</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onExit}
          className="text-sm font-semibold text-slate-300 underline decoration-slate-500 underline-offset-4 transition hover:text-white"
        >
          Exit tutorial
        </button>
        <div className="flex items-center gap-2">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={onPrevious}
              className="rounded-lg border border-slate-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Previous
            </button>
          )}
          <button
            type="button"
            onClick={onContinue}
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            {step.actionLabel}
          </button>
        </div>
      </div>
    </aside>
  ), document.body)
}//OnboardingTooltip
