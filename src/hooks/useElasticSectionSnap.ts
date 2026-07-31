//declaring react hooks for elastic scroll snap behavior
import { useEffect, useRef } from 'react'

//declaring delay before snap animation starts after scroll stops
const SETTLE_DELAY_MS = 130
//declaring duration of the overshoot snap animation in milliseconds
const SNAP_DURATION_MS = 560

//This function applies an ease-out-back curve for the overshoot snap effect
function easeOutBack(progress: number) {
  const tension = 1.35
  const overshoot = tension + 1
  const shifted = progress - 1

  return 1 + overshoot * shifted ** 3 + tension * shifted ** 2
}//easeOutBack

//This function snaps a scroll container to the nearest data-elastic-snap child
export function useElasticSectionSnap() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    //Effects run after the ref is attached to the dashboard scroll container.
    const scrollContainer = containerRef.current as HTMLDivElement

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let settleTimer: number | undefined
    let frameId: number | undefined
    let isAnimating = false

    function cancelAnimation() {
      if (frameId !== undefined) {
        window.cancelAnimationFrame(frameId)
        frameId = undefined
      }
      isAnimating = false
    }//cancelAnimation

    function getNearestAnchor() {
      const containerTop = scrollContainer.getBoundingClientRect().top
      const anchors = Array.from(
        scrollContainer.querySelectorAll<HTMLElement>('[data-elastic-snap]'),
      )

      return anchors.reduce<{ element: HTMLElement; top: number } | null>(
        (closest, element) => {
          const top = Math.max(
            0,
            scrollContainer.scrollTop + element.getBoundingClientRect().top - containerTop,
          )

          if (!closest || Math.abs(top - scrollContainer.scrollTop) < Math.abs(closest.top - scrollContainer.scrollTop)) {
            return { element, top }
          }

          return closest
        },
        null,
      )
    }//getNearestAnchor

    function snapToNearestAnchor() {
      if (isAnimating) return

      const nearest = getNearestAnchor()
      if (!nearest || Math.abs(nearest.top - scrollContainer.scrollTop) < 2) return

      const targetTop = nearest.top

      if (reducedMotion.matches) {
        scrollContainer.scrollTop = targetTop
        return
      }

      const start = scrollContainer.scrollTop
      const distance = targetTop - start
      const startedAt = performance.now()
      isAnimating = true

      function animate(now: number) {
        const progress = Math.min((now - startedAt) / SNAP_DURATION_MS, 1)
        scrollContainer.scrollTop = start + distance * easeOutBack(progress)

        if (progress < 1) {
          frameId = window.requestAnimationFrame(animate)
          return
        }

        scrollContainer.scrollTop = targetTop
        isAnimating = false
        frameId = undefined
      }//animate

      frameId = window.requestAnimationFrame(animate)
    }//snapToNearestAnchor

    function scheduleSnap() {
      if (isAnimating) return
      if (settleTimer !== undefined) window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(snapToNearestAnchor, SETTLE_DELAY_MS)
    }//scheduleSnap

    function handleUserScrollStart() {
      cancelAnimation()
    }//handleUserScrollStart

    scrollContainer.addEventListener('scroll', scheduleSnap, { passive: true })
    scrollContainer.addEventListener('wheel', handleUserScrollStart, { passive: true })
    scrollContainer.addEventListener('touchstart', handleUserScrollStart, { passive: true })
    scrollContainer.addEventListener('pointerdown', handleUserScrollStart, { passive: true })

    return () => {
      if (settleTimer !== undefined) window.clearTimeout(settleTimer)
      cancelAnimation()
      scrollContainer.removeEventListener('scroll', scheduleSnap)
      scrollContainer.removeEventListener('wheel', handleUserScrollStart)
      scrollContainer.removeEventListener('touchstart', handleUserScrollStart)
      scrollContainer.removeEventListener('pointerdown', handleUserScrollStart)
    }
  }, [])

  return containerRef
}//useElasticSectionSnap
