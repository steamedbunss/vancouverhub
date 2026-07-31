//declaring display variants for common Vancouver 311 request types
const REQUEST_TYPE_VARIANTS: Record<string, readonly [string, string]> = {
  Pothole: ['Pothole reported', 'Watch for this pothole'],
  'Street Repair': ['Street needs repair', 'Road damage reported'],
  'Sidewalk Repair': ['Sidewalk needs repair', 'Damaged sidewalk reported'],
  'Street Light Out': ['Streetlight is out', 'Dark streetlight reported'],
  'Traffic Signal Repair': ['Traffic signal malfunction', 'Signal needs repair'],
  'Traffic Calming': ['Traffic calming requested', 'Speeding concern reported'],
  'Street Construction Concern': [
    'Concern about street construction',
    'Construction issue nearby',
  ],
  'Street Surface Water Flooding': ['Flooding on the street', 'Standing water reported'],
  'Street Cleaning and Debris Pick Up': [
    'Debris needs cleanup',
    'Street cleaning requested',
  ],
  'General Street Issues': ['General street issue', 'Street problem reported'],
  'Water Leak': ['Water leak reported', 'Leak spotted nearby'],
  'Water Hydrant Concern': ['Hydrant issue reported', 'Concern about fire hydrant'],
  'Catch Basin Concern': ['Storm drain concern', 'Catch basin issue reported'],
  'Sewer Maintenance Hole Concern': ['Manhole concern reported', 'Sewer access issue'],
  'Street or Traffic Light Utility Damage': [
    'Traffic light damage reported',
    'Utility damage near roadway',
  ],
  'New Crosswalk Marking': ['Crosswalk marking requested', 'New crosswalk requested'],
  'Dead Animal Pick Up': ['Dead animal needs pickup', 'Animal removal requested'],
  'Abandoned Non-Recyclables-Small': [
    'Abandoned items reported',
    'Illegal dumping (small items)',
  ],
  'Abandoned Recyclables': [
    'Abandoned recyclables reported',
    'Recycling left curbside',
  ],
  'Graffiti Removal - City Property': ['Graffiti reported', 'Graffiti needs removal'],
}

//This function strips "case" suffix noise from raw 311 request type strings
function normalizeRequestType(requestType: string) {
  return requestType.replace(/\bcase\b/gi, '').replace(/\s{2,}/g, ' ').trim()
}//normalizeRequestType

//This function cycles original and variant titles by request id so nearby cards differ
export function resolveServiceRequestTitle(requestType: string, requestId: number) {
  const original = normalizeRequestType(requestType)
  const variants = REQUEST_TYPE_VARIANTS[original]
  if (!variants) return original

  const slot = ((requestId % 3) + 3) % 3
  if (slot === 1) return variants[0]
  if (slot === 2) return variants[1]
  return original
}//resolveServiceRequestTitle
