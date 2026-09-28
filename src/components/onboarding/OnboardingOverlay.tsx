import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'

interface OnboardingOverlayProps {
  targetRect: DOMRect | null
}

//OnboardingOverlay dims the page while leaving the active onboarding target visible
export function OnboardingOverlay({ targetRect }: OnboardingOverlayProps) {
  if (!targetRect) {
    return <div aria-hidden="true" className="fixed inset-0 z-[100] bg-slate-950/60" />
  }

  const panelStyle = (style: CSSProperties): CSSProperties => ({
    ...style,
    backgroundColor: 'rgb(2 6 23 / 0.62)',
  })

  //spotlightPadding keeps the dimmed overlay aligned with the actual active control
  const spotlightPadding = 0
  const viewportWidth = window.visualViewport?.width ?? window.innerWidth
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight
  const spotlight = {
    top: Math.max(8, targetRect.top - spotlightPadding),
    left: Math.max(8, targetRect.left - spotlightPadding),
    right: Math.min(viewportWidth - 8, targetRect.right + spotlightPadding),
    bottom: Math.min(viewportHeight - 8, targetRect.bottom + spotlightPadding),
  }

  return createPortal((
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[100]" style={panelStyle({ height: spotlight.top })} />
      <div aria-hidden="true" className="pointer-events-none fixed left-0 z-[100]" style={panelStyle({ top: spotlight.top, width: spotlight.left, height: spotlight.bottom - spotlight.top })} />
      <div aria-hidden="true" className="pointer-events-none fixed right-0 z-[100]" style={panelStyle({ top: spotlight.top, left: spotlight.right, height: spotlight.bottom - spotlight.top })} />
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 z-[100]" style={panelStyle({ top: spotlight.bottom })} />
    </>
  ), document.body)
}//OnboardingOverlay
