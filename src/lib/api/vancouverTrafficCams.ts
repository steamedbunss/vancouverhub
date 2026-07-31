//City of Vancouver traffic camera image host client
//https://trafficcams.vancouver.ca/
//Pages like grandview4.htm expose North / East / South / West stills
//(updated about every 10-15 minutes).

//declaring compass direction labels for four-way camera views
export type CameraDirection = 'North' | 'East' | 'South' | 'West'

//declaring a single directional still image from an intersection camera page
export interface IntersectionCameraView {
  direction: CameraDirection | string
  imageUrl: string
  alt: string
}

//declaring parsed intersection camera page with all directional views
export interface IntersectionCameraPage {
  title: string
  pageUrl: string
  views: IntersectionCameraView[]
  fetchedAt: number
}

//declaring sort order for compass directions on camera pages
const DIRECTION_ORDER: CameraDirection[] = [
  'North',
  'East',
  'South',
  'West',
]

//This function returns the same-origin traffic-camera proxy base path
//Vite proxies /proxy/trafficcams in local dev; Netlify rewrites it in production
function trafficCamsBase(): string {
  return '/proxy/trafficcams'
}//trafficCamsBase

//This function converts relative camera image hrefs to absolute URLs
function toAbsoluteCameraUrl(href: string, pageUrl: string): string {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return href
  }

  const origin = 'https://trafficcams.vancouver.ca'
  if (href.startsWith('/')) {
    return `${origin}${href}`
  }

  //Relative to page path, eg. cameraimages/Foo.jpg
  const page = new URL(pageUrl)
  return new URL(href, page).toString()
}//toAbsoluteCameraUrl

//This function appends a cache-bust timestamp query param to image URLs
function withCacheBust(imageUrl: string, fetchedAt: number): string {
  const url = new URL(imageUrl)
  url.searchParams.set('t', String(fetchedAt))
  return url.toString()
}//withCacheBust

//This function sorts camera views in North, East, South, West order
function sortViews(views: IntersectionCameraView[]): IntersectionCameraView[] {
  return [...views].sort((a, b) => {
    const ai = DIRECTION_ORDER.indexOf(a.direction as CameraDirection)
    const bi = DIRECTION_ORDER.indexOf(b.direction as CameraDirection)
    const aRank = ai === -1 ? 99 : ai
    const bRank = bi === -1 ? 99 : bi
    return aRank - bRank
  })
}//sortViews

//This function fetches an intersection camera HTML page and extracts directional stills
export async function fetchIntersectionCameraViews(
  pageUrl: string,
): Promise<IntersectionCameraPage> {
  const fetchedAt = Date.now()
  const absolutePage = new URL(pageUrl, 'https://trafficcams.vancouver.ca/')
  const path = absolutePage.pathname + absolutePage.search
  const fetchUrl = `${trafficCamsBase()}${path}`

  const response = await fetch(fetchUrl)
  if (!response.ok) {
    throw new Error(`Traffic cam page failed (${response.status})`)
  }

  const html = await response.text()
  const doc = new DOMParser().parseFromString(html, 'text/html')

  const title =
    doc.querySelector('h1')?.textContent?.trim() ||
    absolutePage.pathname.replace(/^\//, '')

  const views: IntersectionCameraView[] = []

  doc.querySelectorAll('.camera').forEach((cameraBlock) => {
    const direction =
      cameraBlock.querySelector('strong')?.textContent?.trim() ||
      cameraBlock.querySelector('p')?.textContent?.trim() ||
      'View'
    const img = cameraBlock.querySelector('img')
    const src = img?.getAttribute('src')
    if (!src) return

    const absolute = toAbsoluteCameraUrl(src, absolutePage.toString())
    views.push({
      direction,
      imageUrl: withCacheBust(absolute, fetchedAt),
      alt: img?.getAttribute('alt')?.trim() || `${title} - ${direction}`,
    })
  })

  //Fallback: any labeled image on the page
  if (views.length === 0) {
    doc.querySelectorAll('img[src*="cameraimages"]').forEach((img) => {
      const src = img.getAttribute('src')
      if (!src) return
      const alt = img.getAttribute('alt')?.trim() || 'Traffic camera'
      const direction =
        alt.split('-').pop()?.trim() || 'View'
      views.push({
        direction,
        imageUrl: withCacheBust(
          toAbsoluteCameraUrl(src, absolutePage.toString()),
          fetchedAt,
        ),
        alt,
      })
    })
  }

  return {
    title,
    pageUrl: absolutePage.toString(),
    views: sortViews(views),
    fetchedAt,
  }
}//fetchIntersectionCameraViews
