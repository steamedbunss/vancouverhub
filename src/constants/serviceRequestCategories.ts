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
    pillIdle: 'border-red-300 bg-red-100 text-red-800 hover:bg-red-200 dark:border-red-700 dark:bg-red-950 dark:text-red-200 dark:hover:bg-red-900',
    pillSelected: 'border-red-500 bg-red-500 text-white',
  },
  WATER: {
    title: 'text-blue-500',
    pillIdle: 'border-blue-300 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200 dark:hover:bg-blue-900',
    pillSelected: 'border-blue-500 bg-blue-500 text-white',
  },
  NOISE: {
    title: 'text-yellow-400',
    pillIdle: 'border-yellow-300 bg-yellow-100 text-yellow-900 hover:bg-yellow-200 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200 dark:hover:bg-yellow-900',
    pillSelected: 'border-yellow-400 bg-yellow-400 text-gray-950',
  },
  GARBAGE: {
    title: 'text-green-500',
    pillIdle: 'border-green-300 bg-green-100 text-green-800 hover:bg-green-200 dark:border-green-700 dark:bg-green-950 dark:text-green-200 dark:hover:bg-green-900',
    pillSelected: 'border-green-500 bg-green-500 text-white',
  },
  ROAD: {
    title: 'text-orange-500',
    pillIdle: 'border-orange-300 bg-orange-100 text-orange-800 hover:bg-orange-200 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-200 dark:hover:bg-orange-900',
    pillSelected: 'border-orange-500 bg-orange-500 text-white',
  },
  GRAFFITI: {
    title: 'text-purple-500',
    pillIdle: 'border-purple-300 bg-purple-100 text-purple-800 hover:bg-purple-200 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-200 dark:hover:bg-purple-900',
    pillSelected: 'border-purple-500 bg-purple-500 text-white',
  },
}

//This function returns the Tailwind color classes for a 311 category
export function getServiceRequestCategoryColor(category: ApiServiceRequestCategory) {
  return SERVICE_REQUEST_CATEGORY_COLORS[category]
}//getServiceRequestCategoryColor
