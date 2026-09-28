import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { getOnboardingStatus, ONBOARDING_PROGRESS_KEY, ONBOARDING_STEPS, saveOnboardingStatus } from './onboardingSteps'
import { OnboardingTooltip } from './OnboardingTooltip'

//Choose the visible match so responsive desktop/mobile copies do not select a hidden element.
function findVisibleTarget(target: string) {
  return [...document.querySelectorAll<HTMLElement>(`[data-onboarding-target="${target}"]`)]
    .find((element) => element.getClientRects().length > 0) ?? null
}

//Resume the last step for this tab; a missing or stale id starts at the welcome step.
function getSavedStepIndex() {
  try {
    const savedId = sessionStorage.getItem(ONBOARDING_PROGRESS_KEY)
    const index = ONBOARDING_STEPS.findIndex((step) => step.id === savedId)
    return index >= 0 ? index : 0
  } catch {
    return 0
  }
}

//Coordinate tour progress, page navigation, target tracking, and the spotlight mask.
export function OnboardingTour() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(() => getOnboardingStatus() === null)
  const [stepIndex, setStepIndex] = useState(getSavedStepIndex)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [animateSpotlight, setAnimateSpotlight] = useState(false)
  const step = ONBOARDING_STEPS[stepIndex]
  //Progress storage is optional; a restricted browser should still be able to run the tour.
  let hasSavedProgress = false
  try { hasSavedProgress = sessionStorage.getItem(ONBOARDING_PROGRESS_KEY) !== null } catch {}

  //Mark the document while the tour is open so dashboard snapping stays out of the way.
  useEffect(() => {
    document.documentElement.classList.toggle('onboarding-tour-active', isOpen)
    return () => document.documentElement.classList.remove('onboarding-tour-active')
  }, [isOpen])

  //Persist the active step, follow its route, and reveal the target in the viewport.
  //Dashboard targets use direct positioning because they live in an internal scroller.
  useEffect(() => {
    if (!isOpen) return
    if (location.pathname !== step.path) {
      navigate(step.path, { replace: true })
      return
    }

    try { sessionStorage.setItem(ONBOARDING_PROGRESS_KEY, step.id) } catch {}
    const targetElement = step.target ? findVisibleTarget(step.target) : null
    if (targetElement && !['guest-access', 'account-personalization'].includes(step.id)) {
      const dashboardContainer = targetElement.closest<HTMLElement>('[data-dashboard-scroll-container]')
      if (dashboardContainer) {
        const containerRect = dashboardContainer.getBoundingClientRect()
        const targetRect = targetElement.getBoundingClientRect()
        const targetTop = dashboardContainer.scrollTop + targetRect.top - containerRect.top
        dashboardContainer.scrollTop = Math.max(0, targetTop - (dashboardContainer.clientHeight - targetRect.height) / 2)
      } else {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
      }
    }
  }, [isOpen, location.pathname, navigate, step])

  //Track target geometry as content loads, resizes, or scrolls so the spotlight remains aligned.
  useEffect(() => {
    if (!isOpen || location.pathname !== step.path) return
    let activeTarget: HTMLElement | null = null
    let animationFrame = 0
    const resizeObserver = new ResizeObserver(updateTarget)
    function updateTarget() {
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(() => {
        const nextTarget = step.target ? findVisibleTarget(step.target) : null
        if (nextTarget !== activeTarget) {
          activeTarget?.classList.remove('onboarding-target-active')
          if (activeTarget) resizeObserver.unobserve(activeTarget)
          activeTarget = nextTarget
          activeTarget?.classList.add('onboarding-target-active')
          if (activeTarget) resizeObserver.observe(activeTarget)
        }
        setTargetRect(activeTarget?.getBoundingClientRect() ?? null)
      })
    }

    const mutationObserver = new MutationObserver(updateTarget)
    mutationObserver.observe(document.body, { childList: true, subtree: true })
    resizeObserver.observe(document.documentElement)
    updateTarget()
    window.addEventListener('resize', updateTarget)
    window.addEventListener('scroll', updateTarget, true)
    window.visualViewport?.addEventListener('resize', updateTarget)
    window.visualViewport?.addEventListener('scroll', updateTarget)
    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      activeTarget?.classList.remove('onboarding-target-active')
      window.removeEventListener('resize', updateTarget)
      window.removeEventListener('scroll', updateTarget, true)
      window.visualViewport?.removeEventListener('resize', updateTarget)
      window.visualViewport?.removeEventListener('scroll', updateTarget)
    }
  }, [isOpen, location.pathname, step.path, step.target, stepIndex])

  //Allow users to exit immediately with Escape if the tutorial blocks their workflow.
  useEffect(() => {
    if (!isOpen) return
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') finishTour('skipped')
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  //Save the outcome and clear resumable progress; storage failures must not block closing the tour.
  function finishTour(status: 'completed' | 'skipped') {
    saveOnboardingStatus(status)
    try { sessionStorage.removeItem(ONBOARDING_PROGRESS_KEY) } catch {}
    setIsOpen(false)
  }

  //Advance to the next step, set guest mode when leaving registration, and animate only on the same page.
  function continueTour() {
    if (step.id === 'account-personalization') {
      try { localStorage.setItem('vancouver-hub-guest-access', 'true') } catch {}
    }
    if (stepIndex === ONBOARDING_STEPS.length - 1) {
      finishTour('completed')
      return
    }
    const nextIndex = stepIndex + 1
    const nextStep = ONBOARDING_STEPS[nextIndex]
    const samePage = step.path === nextStep.path
    setAnimateSpotlight(samePage)
    if (!samePage) setTargetRect(null)
    setStepIndex(nextIndex)
    navigate(nextStep.path)
  }

  //Move backward using the same same-page animation rule as forward navigation.
  function previousTourStep() {
    if (stepIndex === 0) return
    const previousIndex = stepIndex - 1
    const previousStep = ONBOARDING_STEPS[previousIndex]
    const samePage = step.path === previousStep.path
    setAnimateSpotlight(samePage)
    if (!samePage) setTargetRect(null)
    setStepIndex(previousIndex)
    navigate(previousStep.path)
  }

  if (!isOpen || (location.pathname !== '/register' && !hasSavedProgress)) return null

  //Build a viewport-clamped cutout for the single SVG mask; this avoids seams between overlay panels.
  const spotlightRect = targetRect
    ? {
        top: Math.max(0, targetRect.top),
        left: Math.max(0, targetRect.left),
        right: Math.min(window.innerWidth, targetRect.right),
        bottom: Math.min(window.innerHeight, targetRect.bottom),
      }
    : null
  const shade = 'rgba(2, 6, 23, 0.62)'

  //Render the dimmed mask and the interactive tooltip above the application content.
  return (
    <>
      {createPortal((
        <svg
          aria-hidden="true"
          className="fixed inset-0 z-[100] h-full w-full"
          viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
          preserveAspectRatio="none"
          style={{ pointerEvents: 'auto' }}
        >
          <defs>
            <mask id="onboarding-spotlight-mask" x="0" y="0" width={window.innerWidth} height={window.innerHeight} maskUnits="userSpaceOnUse">
              <rect x="0" y="0" width={window.innerWidth} height={window.innerHeight} fill="white" />
              <rect
                className={animateSpotlight ? 'onboarding-spotlight-hole onboarding-spotlight-hole-animated' : 'onboarding-spotlight-hole'}
                x="0"
                y="0"
                rx="4"
                fill="black"
                style={{
                  width: spotlightRect ? spotlightRect.right - spotlightRect.left : 0,
                  height: spotlightRect ? spotlightRect.bottom - spotlightRect.top : 0,
                  transform: `translate(${spotlightRect?.left ?? 0}px, ${spotlightRect?.top ?? 0}px)`,
                }}
              />
            </mask>
          </defs>
          <rect x="0" y="0" width={window.innerWidth} height={window.innerHeight} fill={shade} mask="url(#onboarding-spotlight-mask)" />
        </svg>
      ), document.body)}
      <OnboardingTooltip
        step={step}
        stepIndex={stepIndex}
        totalSteps={ONBOARDING_STEPS.length - 1}
        targetRect={targetRect}
        onPrevious={previousTourStep}
        onContinue={continueTour}
        onExit={() => finishTour('skipped')}
      />
    </>
  )
}
