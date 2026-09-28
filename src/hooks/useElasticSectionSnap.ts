//declaring react hooks for elastic scroll snap behavior
import { useEffect, useRef } from 'react'

//declaring delay before snap animation starts after scroll stops
const SETTLE_DELAY_MS = 130
//declaring duration of the overshoot snap animation in milliseconds
const SNAP_DURATION_MS = 560
//declaring how far toward the adjacent panel users scroll before it becomes the snap target
const FORWARD_SNAP_THRESHOLD = 0.3

//This function applies an ease-out-back curve for the overshoot snap effect
function easeOutBack(progress: number) {
  const tension = 1.35
  const overshoot = tension + 1
  const shifted = progress - 1

  return 1 + overshoot * shifted ** 3 + tension * shifted ** 2
}//easeOutBack

//This hook snaps the dashboard scroll container to section anchors after scroll settles
//Scroll direction and a 30% threshold pick the previous or next anchor, not always the nearest
export function useElasticSectionSnap() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    //Effects run after the ref is attached to the dashboard scroll container.
    const scrollContainer = containerRef.current as HTMLDivElement

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    //Mobile and zoomed-in layouts use natural scrolling instead of section snapping.
    const narrowViewport = window.matchMedia('(max-width: 767px)')
    let settleTimer: number | undefined
    let frameId: number | undefined
    let isAnimating = false
    let lastScrollTop = scrollContainer.scrollTop
    let scrollDirection: 'up' | 'down' = 'down'

    function cancelAnimation() {
      if (frameId !== undefined) {
        window.cancelAnimationFrame(frameId)
        frameId = undefined
      }
      isAnimating = false
    }//cancelAnimation

    function getSnapTarget() {
      const containerTop = scrollContainer.getBoundingClientRect().top
      const anchors = Array.from(
        scrollContainer.querySelectorAll<HTMLElement>('[data-elastic-snap]'),
      ).map((element) => ({
        element,
        top: Math.max(
            0,
            scrollContainer.scrollTop + element.getBoundingClientRect().top - containerTop,
          ),
      }))

      if (anchors.length === 0) return null

      const position = scrollContainer.scrollTop
      const upperIndex = anchors.findIndex((anchor) => anchor.top >= position)
      if (upperIndex === -1) return anchors[anchors.length - 1]
      if (upperIndex === 0) return anchors[0]

      const previous = anchors[upperIndex - 1]
      const next = anchors[upperIndex]
      const distance = Math.max(next.top - previous.top, 1)

      if (scrollDirection === 'down') {
        const progress = (position - previous.top) / distance
        return progress >= FORWARD_SNAP_THRESHOLD ? next : previous
      }

      const progress = (next.top - position) / distance
      return progress >= FORWARD_SNAP_THRESHOLD ? previous : next
    }//getSnapTarget

    function snapToNearestAnchor() {
      if (isAnimating) return

      const target = getSnapTarget()
      if (!target || Math.abs(target.top - scrollContainer.scrollTop) < 2) return

      const targetTop = target.top

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

    function handleScroll() {
      if (document.documentElement.classList.contains('onboarding-tour-active')) {
        if (settleTimer !== undefined) window.clearTimeout(settleTimer)
        settleTimer = undefined
        cancelAnimation()
        lastScrollTop = scrollContainer.scrollTop
        return
      }
      if (narrowViewport.matches) return
      if (isAnimating) return
      const currentScrollTop = scrollContainer.scrollTop
      if (Math.abs(currentScrollTop - lastScrollTop) > 0.5) {
        scrollDirection = currentScrollTop > lastScrollTop ? 'down' : 'up'
        lastScrollTop = currentScrollTop
      }
      if (settleTimer !== undefined) window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(snapToNearestAnchor, SETTLE_DELAY_MS)
    }//handleScroll

    function handleUserScrollStart() {
      cancelAnimation()
    }//handleUserScrollStart

    function handleViewportChange() {
      if (narrowViewport.matches) {
        if (settleTimer !== undefined) window.clearTimeout(settleTimer)
        settleTimer = undefined
        cancelAnimation()
      }
    }//handleViewportChange

    const tourObserver = new MutationObserver(() => {
      if (!document.documentElement.classList.contains('onboarding-tour-active')) return
      if (settleTimer !== undefined) window.clearTimeout(settleTimer)
      settleTimer = undefined
      cancelAnimation()
      lastScrollTop = scrollContainer.scrollTop
    })
    tourObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
    scrollContainer.addEventListener('wheel', handleUserScrollStart, { passive: true })
    scrollContainer.addEventListener('touchstart', handleUserScrollStart, { passive: true })
    scrollContainer.addEventListener('pointerdown', handleUserScrollStart, { passive: true })
    narrowViewport.addEventListener('change', handleViewportChange)

    return () => {
      if (settleTimer !== undefined) window.clearTimeout(settleTimer)
      cancelAnimation()
      scrollContainer.removeEventListener('scroll', handleScroll)
      scrollContainer.removeEventListener('wheel', handleUserScrollStart)
      scrollContainer.removeEventListener('touchstart', handleUserScrollStart)
      scrollContainer.removeEventListener('pointerdown', handleUserScrollStart)
      narrowViewport.removeEventListener('change', handleViewportChange)
      tourObserver.disconnect()
    }
  }, [])

  return containerRef
}//useElasticSectionSnap
