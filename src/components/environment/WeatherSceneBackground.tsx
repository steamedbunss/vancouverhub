import { useMemo } from 'react'
import type { WeatherScene } from '../../lib/weather/weatherScene'

//ClearScene renders sun rays and a bright sky background for clear weather
function ClearScene() {
  return (
    <>
      <div className="weather-bg-clear" />
      <div className="weather-sun-ray" />
      <div className="weather-sun-ray weather-sun-ray-diag" />
      <div className="weather-sun-core" />
    </>
  )
}//ClearScene

//CloudyScene renders layered animated clouds over a cloudy sky background
function CloudyScene() {
  return (
    <>
      <div className="weather-bg-cloudy" />
      <div className="weather-cloud weather-cloud-a" />
      <div className="weather-cloud weather-cloud-b" />
      <div className="weather-cloud weather-cloud-c" />
      <div className="weather-cloud weather-cloud-d" />
    </>
  )
}//CloudyScene

//RainScene renders falling rain drops over a rainy sky background
function RainScene() {
  //drops is a memoized array of 36 rain drop positions and animation timings
  const drops = useMemo(
    () =>
      Array.from({ length: 36 }, (_, index) => ({
        id: index,
        left: ((index * 37) % 100) + (index % 7) * 0.3,
        duration: 0.65 + (index % 5) * 0.12,
        delay: (index % 11) * 0.12,
      })),
    [],
  )

  return (
    <>
      <div className="weather-bg-rain" />
      {/*This map places one animated drop div per precomputed drop object*/}
      {drops.map((drop) => (
        <div
          key={drop.id}
          className="weather-drop"
          style={{
            left: `${drop.left}%`,
            animationDuration: `${drop.duration}s`,
            animationDelay: `${drop.delay}s`,
          }}
        />
      ))}
    </>
  )
}//RainScene

//ThunderScene renders a flash effect and dark clouds for thunderstorm weather
function ThunderScene() {
  return (
    <>
      <div className="weather-bg-thunder" />
      <div className="weather-thunder-flash" />
      <div className="weather-cloud weather-cloud-a" />
      <div className="weather-cloud weather-cloud-c" />
    </>
  )
}//ThunderScene

//SnowScene renders drifting snowflakes over a snowy sky background
function SnowScene() {
  //flakes is a memoized array of 28 snowflake positions, sizes, and drift values
  const flakes = useMemo(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        id: index,
        left: ((index * 41) % 100) + (index % 5) * 0.4,
        size: 3 + (index % 4),
        duration: 4.5 + (index % 6) * 0.55,
        delay: (index % 9) * 0.35,
        drift: 12 + (index % 8) * 4,
      })),
    [],
  )

  return (
    <>
      <div className="weather-bg-snow" />
      {/*This map places one animated flake div per precomputed flake object*/}
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="weather-flake"
          style={{
            left: `${flake.left}%`,
            width: flake.size,
            height: flake.size,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            ['--flake-drift' as string]: `${flake.drift}px`,
          }}
        />
      ))}
    </>
  )
}//SnowScene

//FogScene renders layered fog bands over a muted fog background
function FogScene() {
  return (
    <>
      <div className="weather-bg-fog" />
      <div className="weather-fog-layer weather-fog-a" />
      <div className="weather-fog-layer weather-fog-b" />
    </>
  )
}//FogScene

//WeatherSceneBackground picks and renders the CSS animated scene matching the weather summary
export function WeatherSceneBackground({ scene }: { scene: WeatherScene }) {
  return (
    <div className="weather-bg-layer" aria-hidden>
      {scene === 'clear' && <ClearScene />}
      {scene === 'cloudy' && <CloudyScene />}
      {scene === 'rain' && <RainScene />}
      {scene === 'thunder' && <ThunderScene />}
      {scene === 'snow' && <SnowScene />}
      {scene === 'fog' && <FogScene />}
    </div>
  )
}//WeatherSceneBackground
