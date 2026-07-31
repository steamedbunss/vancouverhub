//declaring weather scene union for animated card backgrounds
export type WeatherScene = 'clear' | 'cloudy' | 'rain' | 'thunder' | 'snow' | 'fog'

//This function maps free-text weather summaries into animated card scenes, eg. "rain" -> 'rain'
export function resolveWeatherScene(summary: string): WeatherScene | null {
  const text = summary.trim().toLowerCase()
  if (!text) return null

  if (/thunder|lightning|squall|severe turbulence|\bstorm\b/.test(text) && !/snow|blizzard/.test(text)) {
    return 'thunder'
  }
  if (/snow|blizzard|flurr|sleet|ice pellet|freezing/.test(text)) {
    return 'snow'
  }
  if (/fog|mist|haze|smoke/.test(text)) {
    return 'fog'
  }
  if (/rain|drizzle|shower|downpour|precip/.test(text)) {
    return 'rain'
  }
  if (
    /partly sunny|partly cloudy|mostly cloudy|overcast|cloudy|cloud/.test(text)
  ) {
    return 'cloudy'
  }
  if (/clear|sunny|fair|mainly sunny|mostly sunny|bright/.test(text)) {
    return 'clear'
  }

  return 'cloudy'
}//resolveWeatherScene

//This function returns the emoji shown beside degrees C for the current summary or scene
export function weatherSummaryEmoji(summary: string): string {
  const text = summary.trim().toLowerCase()
  const scene = resolveWeatherScene(summary)

  if (scene === 'clear') return '☀️'
  if (scene === 'thunder') return '⛈️'
  if (scene === 'snow') return '❄️'
  if (scene === 'fog') return '🌫️'
  if (scene === 'rain') {
    if (/drizzle|light/.test(text)) return '🌦️'
    return '🌧️'
  }
  if (scene === 'cloudy') {
    if (/partly sunny|partly cloudy|mainly sunny/.test(text)) return '⛅'
    return '☁️'
  }

  return '🌤️'
}//weatherSummaryEmoji
