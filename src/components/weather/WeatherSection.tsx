import { CompactWeather } from '../dashboard/CompactWeather'

//WeatherSection is a backward-compatible wrapper around CompactWeather
//It renders the same environment summary powered by the Vancouver Hub backend
export function WeatherSection() {
  return <CompactWeather />
}//WeatherSection
