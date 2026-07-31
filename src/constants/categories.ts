//declaring category id and definition types from shared types module
import type { CategoryDefinition, CategoryId } from '../types'

//declaring all hub category ids in display order
export const ALL_CATEGORY_IDS: CategoryId[] = [
  'local-events',
  'environment',
  'traffic',
  'housing',
  'gas-prices',
  'gov-programs',
  'safety-311',
]

//Temporarily paused product areas. Keep their definitions and implementation
//files intact so each area can be restored by removing its ID from this set.
export const TEMPORARILY_DISABLED_CATEGORY_IDS: ReadonlySet<CategoryId> = new Set([
  'housing',
  'gov-programs',
])

//declaring categories whose full pages are hidden but cards may still show
export const TEMPORARILY_DISABLED_PAGE_IDS: ReadonlySet<CategoryId> = new Set([
  'gas-prices',
])

//This function checks whether a category is fully disabled in nav and dashboard
export function isCategoryTemporarilyDisabled(categoryId: CategoryId) {
  return TEMPORARILY_DISABLED_CATEGORY_IDS.has(categoryId)
}//isCategoryTemporarilyDisabled

//This function checks whether a category page route should be hidden
export function isCategoryPageTemporarilyDisabled(categoryId: CategoryId) {
  return (
    isCategoryTemporarilyDisabled(categoryId) ||
    TEMPORARILY_DISABLED_PAGE_IDS.has(categoryId)
  )
}//isCategoryPageTemporarilyDisabled

//declaring full category metadata map with labels, paths, and descriptions
export const CATEGORIES: Record<CategoryId, CategoryDefinition> = {
  'local-events': {
    id: 'local-events',
    label: 'Local Events',
    shortLabel: 'Events',
    path: '/events',
    description: 'Nearby events based on date and neighbourhood.',
  },
  environment: {
    id: 'environment',
    label: 'Environment',
    shortLabel: 'Environment',
    path: '/environment',
    description: 'Air quality, wildfire activity, and weather at your location.',
  },
  traffic: {
    id: 'traffic',
    label: 'Traffic',
    shortLabel: 'Traffic',
    path: '/traffic',
    description: 'Road closures, cameras, and commute impact near you.',
  },
  housing: {
    id: 'housing',
    label: 'Housing',
    shortLabel: 'Housing',
    path: '/housing',
    description: 'Rent benchmarks and housing data for Vancouver neighbourhoods.',
  },
  'gas-prices': {
    id: 'gas-prices',
    label: 'Gas Prices',
    shortLabel: 'Gas',
    path: '/gas',
    description: 'Nearby fuel prices filtered by type and sorted your way.',
  },
  'gov-programs': {
    id: 'gov-programs',
    label: 'Gov Programs',
    shortLabel: 'Gov Programs',
    path: '/gov-programs',
    description: 'City programs, grants, and public services.',
  },
  'safety-311': {
    id: 'safety-311',
    label: 'Neighbourhood',
    shortLabel: 'Neighbourhood',
    path: '/safety-311',
    description: 'Recent 311 service requests near your location.',
  },
}
