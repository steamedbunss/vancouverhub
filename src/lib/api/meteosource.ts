//Meteosource weather API client
//https://www.meteosource.com/

//declaring API base URL and key from environment
const BASE = 'https://www.meteosource.com/api/v1/free'
const API_KEY = import.meta.env.VITE_METEOSOURCE_API_KEY

//declaring fixed Vancouver downtown coordinates for weather queries
const LAT = 49.2827
const LON = -123.1207

//declaring raw Meteosource point response shape
interface MeteosourcePointResponse {
  current: {
    temperature: number
    summary: string
    icon_num: number
  }
}

//declaring normalized weather card data returned to UI components
export interface WeatherCardData {
  temperature: number
  summary: string
  iconNum: number
}

//This function fetches current Vancouver weather from Meteosource point API
export async function getVancouverWeather(): Promise<WeatherCardData> {
  if (!API_KEY) {
    throw new Error(
      'Missing VITE_METEOSOURCE_API_KEY. Add it to .env and restart the dev server.',
    )
  }

  const url = `${BASE}/point?lat=${LAT}&lon=${LON}&sections=current&language=en&units=metric&key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Meteosource fetch failed: ${res.status}`)

  const data = (await res.json()) as MeteosourcePointResponse
  return {
    temperature: data.current.temperature,
    summary: data.current.summary,
    iconNum: data.current.icon_num,
  }
}//getVancouverWeather
