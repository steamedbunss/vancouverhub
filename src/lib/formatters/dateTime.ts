//This function formats API timestamps consistently across location-aware cards
export function formatUpdateDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Update time unavailable'

  //declaring long-form date, eg. "July 30, 2026"
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
  //declaring 12-hour time, eg. "8:38 PM"
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)

  return `${formattedDate}, ${formattedTime}`
}//formatUpdateDateTime
