//declaring backend service request category type
import type { ApiServiceRequestCategory } from '../types/backend'

//declaring shared Tailwind color palette for 311 category filter pills and card titles
export const SERVICE_REQUEST_CATEGORY_COLORS: Record<
  ApiServiceRequestCategory,
  {
    title: string
    pillIdle: string
    pillSelected: string
  }
> = {
  SAFETY: {
    title: 'text-red-500',
    pillIdle: 'border-red-500 text-red-500 hover:bg-red-500/10',
    pillSelected: 'border-red-500 bg-red-500 text-white',
  },
  WATER: {
    title: 'text-blue-500',
    pillIdle: 'border-blue-500 text-blue-500 hover:bg-blue-500/10',
    pillSelected: 'border-blue-500 bg-blue-500 text-white',
  },
  NOISE: {
    title: 'text-yellow-400',
    pillIdle: 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/10',
    pillSelected: 'border-yellow-400 bg-yellow-400 text-gray-950',
  },
  GARBAGE: {
    title: 'text-green-500',
    pillIdle: 'border-green-500 text-green-500 hover:bg-green-500/10',
    pillSelected: 'border-green-500 bg-green-500 text-white',
  },
  ROAD: {
    title: 'text-orange-500',
    pillIdle: 'border-orange-500 text-orange-500 hover:bg-orange-500/10',
    pillSelected: 'border-orange-500 bg-orange-500 text-white',
  },
  GRAFFITI: {
    title: 'text-purple-500',
    pillIdle: 'border-purple-500 text-purple-500 hover:bg-purple-500/10',
    pillSelected: 'border-purple-500 bg-purple-500 text-white',
  },
}

//This function returns the Tailwind color classes for a 311 category
export function getServiceRequestCategoryColor(category: ApiServiceRequestCategory) {
  return SERVICE_REQUEST_CATEGORY_COLORS[category]
}//getServiceRequestCategoryColor
