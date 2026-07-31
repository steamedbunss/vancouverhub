//Weather scene resolver for animated Environment card backgrounds and summary emoji
//Maps Meteosource icon numbers, precipitation fields, and summary text to a scene plus intensity

//declaring animated backdrop scene labels used by WeatherSceneBackground
export type WeatherScene =
  | 'clear-day'
  | 'clear-night'
  | 'partly-cloudy-day'
  | 'partly-cloudy-night'
  | 'cloudy'
  | 'rain'
  | 'thunder'
  | 'snow'
  | 'mixed'
  | 'ice'
  | 'hail'
  | 'fog'

//declaring precipitation animation strength levels for particle-heavy scenes
export type WeatherIntensity = 'possible' | 'light' | 'moderate' | 'heavy' | 'severe'

//declaring weather fields used to choose a visual scene from backend data
export interface WeatherSceneInput {
  summary: string
  icon?: string | null
  iconNumber?: number | null
  precipitation?: number | null
  precipitationType?: string | null
  windSpeed?: number | null
}

//declaring resolved scene and intensity pair returned to the UI layer
export interface WeatherVisual {
  scene: WeatherScene
  intensity: WeatherIntensity
}

//This function converts a precipitation amount in millimetres into an intensity label
function precipitationIntensity(
  amount: number | null | undefined,
  fallback: WeatherIntensity,
): WeatherIntensity {
  if (amount == null || amount <= 0) return fallback
  if (amount < 2.5) return 'light'
  if (amount < 7.6) return 'moderate'
  return 'heavy'
}//precipitationIntensity

//This function upgrades heavy precipitation to severe when wind speed is high enough
function addWindSeverity(
  intensity: WeatherIntensity,
  windSpeed: number | null | undefined,
): WeatherIntensity {
  if (intensity === 'heavy' && (windSpeed ?? 0) >= 40) return 'severe'
  return intensity
}//addWindSeverity

//This function builds a WeatherVisual object with an optional default intensity
function visual(scene: WeatherScene, intensity: WeatherIntensity = 'moderate'): WeatherVisual {
  return { scene, intensity }
}//visual

//This function resolves the animated weather scene from Meteosource icon metadata and fallbacks
//Uses Meteosource icon numbers as the primary source of truth when available
export function resolveWeatherVisual(input: WeatherSceneInput): WeatherVisual | null {
  const { iconNumber, precipitation, windSpeed } = input

  switch (iconNumber) {
    case 1:
      return visual('cloudy')
    case 2:
      return visual('clear-day')
    case 3:
    case 4:
      return visual('partly-cloudy-day')
    case 5:
    case 6:
    case 7:
    case 8:
    case 29:
    case 30:
    case 31:
      return visual('cloudy')
    case 9:
      return visual('fog')
    case 10:
      return visual('rain', 'light')
    case 11:
      return visual('rain', addWindSeverity(precipitationIntensity(precipitation, 'moderate'), windSpeed))
    case 12:
      return visual('rain', 'possible')
    case 13:
    case 32:
      return visual('rain', addWindSeverity(precipitationIntensity(precipitation, 'moderate'), windSpeed))
    case 14:
      return visual('thunder', addWindSeverity(precipitationIntensity(precipitation, 'moderate'), windSpeed))
    case 15:
    case 33:
      return visual('thunder', precipitationIntensity(precipitation, 'light'))
    case 16:
      return visual('snow', 'light')
    case 17:
      return visual('snow', addWindSeverity(precipitationIntensity(precipitation, 'moderate'), windSpeed))
    case 18:
      return visual('snow', 'possible')
    case 19:
    case 34:
      return visual('snow', addWindSeverity(precipitationIntensity(precipitation, 'moderate'), windSpeed))
    case 20:
    case 21:
    case 22:
    case 35:
      return visual('mixed', precipitationIntensity(precipitation, iconNumber === 21 ? 'possible' : 'moderate'))
    case 23:
      return visual('ice', precipitationIntensity(precipitation, 'moderate'))
    case 24:
    case 36:
      return visual('ice', 'possible')
    case 25:
      return visual('hail', precipitationIntensity(precipitation, 'moderate'))
    case 26:
      return visual('clear-night')
    case 27:
    case 28:
      return visual('partly-cloudy-night')
  }

  //Structured precipitation type is the next-best fallback when icon metadata is missing
  const precipitationType = input.precipitationType?.trim().toLowerCase() ?? ''
  if (/rain.?snow/.test(precipitationType)) return visual('mixed')
  if (/ice pellet|frozen rain|freezing rain/.test(precipitationType)) return visual('ice')
  if (precipitationType === 'snow') {
    return visual('snow', addWindSeverity(precipitationIntensity(precipitation, 'moderate'), windSpeed))
  }
  if (precipitationType === 'rain') {
    return visual('rain', addWindSeverity(precipitationIntensity(precipitation, 'moderate'), windSpeed))
  }

  //Summary matching is retained only for providers or responses without icon metadata
  const text = input.summary.trim().toLowerCase()
  if (!text) return null
  const isNight = /night|moon/.test(input.icon?.trim().toLowerCase() ?? '')

  if (/thunder|lightning|squall|\bstorm\b/.test(text) && !/snow|blizzard/.test(text)) {
    return visual('thunder', /severe/.test(text) ? 'severe' : /heavy/.test(text) ? 'heavy' : 'moderate')
  }
  if (/freezing rain|ice pellet|frozen rain/.test(text)) return visual('ice')
  if (/rain and snow|rain.?snow|sleet/.test(text)) return visual('mixed')
  if (/hail/.test(text)) return visual('hail')
  if (/snow|blizzard|flurr/.test(text)) {
    const intensity = /blizzard|severe/.test(text) ? 'severe' : /heavy/.test(text) ? 'heavy' : /light|flurr/.test(text) ? 'light' : 'moderate'
    return visual('snow', intensity)
  }
  if (/fog|mist|haze|smoke/.test(text)) return visual('fog')
  if (/rain|drizzle|shower|downpour|precip/.test(text)) {
    const intensity = /downpour|torrential|heavy/.test(text) ? 'heavy' : /drizzle|light|possible/.test(text) ? 'light' : 'moderate'
    return visual('rain', addWindSeverity(intensity, windSpeed))
  }
  if (/partly clear|mainly clear|mostly clear|partly sunny|partly cloudy|mainly sunny|mostly sunny/.test(text)) {
    return visual(isNight ? 'partly-cloudy-night' : 'partly-cloudy-day')
  }
  if (/mostly cloudy|overcast|cloudy|cloud/.test(text)) return visual('cloudy')
  if (/clear|sunny|fair|bright/.test(text)) return visual(isNight ? 'clear-night' : 'clear-day')

  return visual('cloudy')
}//resolveWeatherVisual

//This function returns a compact emoji for the resolved weather scene
export function weatherSummaryEmoji(input: WeatherSceneInput): string {
  const scene = resolveWeatherVisual(input)?.scene
  if (scene === 'clear-day') return '☀️'
  if (scene === 'clear-night') return '🌙'
  if (scene === 'partly-cloudy-day') return '🌤️'
  if (scene === 'partly-cloudy-night') return '☁️'
  if (scene === 'thunder') return '⛈️'
  if (scene === 'snow') return '❄️'
  if (scene === 'mixed') return '🌨️'
  if (scene === 'ice') return '🌧️'
  if (scene === 'hail') return '🧊'
  if (scene === 'fog') return '🌫️'
  if (scene === 'rain') return '🌧️'
  if (scene === 'cloudy') return '☁️'
  return '🌤️'
}//weatherSummaryEmoji
