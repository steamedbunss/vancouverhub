//Animated weather backdrop for the Environment page current-conditions card
//Renders CSS-driven sky, cloud, sun, moon, and particle layers from a WeatherScene label

import { useMemo } from 'react'
import type { WeatherIntensity, WeatherScene } from '../../lib/weather/weatherScene'

//This function renders a sunny daytime sky with sun rays and core
function ClearDayScene() {
  return <>
    <div className="weather-bg-clear" />
    <div className="weather-sun-ray" />
    <div className="weather-sun-ray weather-sun-ray-diag" />
    <div className="weather-sun-core" />
  </>
}//ClearDayScene

//This function renders a clear or partly cloudy nighttime sky with stars and moon
function ClearNightScene({ partlyCloudy = false }: { partlyCloudy?: boolean }) {
  return <>
    <div className="weather-bg-clear-night" />
    <div className="weather-stars" />
    <div className="weather-moon" />
    {partlyCloudy && <>
      <div className="weather-cloud weather-cloud-night-a" />
      <div className="weather-cloud weather-cloud-night-b" />
    </>}
  </>
}//ClearNightScene

//This function layers daytime clouds over the clear-day sky
function PartlyCloudyDayScene() {
  return <>
    <ClearDayScene />
    <div className="weather-cloud weather-cloud-day-a" />
    <div className="weather-cloud weather-cloud-day-b" />
  </>
}//PartlyCloudyDayScene

//This function renders a fully overcast sky with multiple cloud layers
function CloudyScene() {
  return <>
    <div className="weather-bg-cloudy" />
    <div className="weather-cloud weather-cloud-a" />
    <div className="weather-cloud weather-cloud-b" />
    <div className="weather-cloud weather-cloud-c" />
    <div className="weather-cloud weather-cloud-d" />
  </>
}//CloudyScene

//declaring animated rain and snow particle counts for each weather intensity level
const particleCounts: Record<WeatherIntensity, number> = {
  possible: 8,
  light: 18,
  moderate: 36,
  heavy: 62,
  severe: 82,
}

//This function renders falling rain drops sized by precipitation intensity
function RainParticles({ intensity }: { intensity: WeatherIntensity }) {
  const drops = useMemo(
    () => Array.from({ length: particleCounts[intensity] }, (_, index) => ({
      id: index,
      left: ((index * 37) % 100) + (index % 7) * 0.3,
      duration: (intensity === 'heavy' || intensity === 'severe' ? 0.38 : intensity === 'light' || intensity === 'possible' ? 0.95 : 0.65) + (index % 5) * 0.07,
      delay: (index % 11) * 0.08,
    })),
    [intensity],
  )
  return drops.map((drop) => <div
    key={drop.id}
    className={`weather-drop weather-particle-${intensity}`}
    style={{ left: `${drop.left}%`, animationDuration: `${drop.duration}s`, animationDelay: `${drop.delay}s` }}
  />)
}//RainParticles

//This function renders drifting snowflakes sized and timed by precipitation intensity
function SnowParticles({ intensity }: { intensity: WeatherIntensity }) {
  const flakes = useMemo(
    () => Array.from({ length: Math.max(6, particleCounts[intensity] - 8) }, (_, index) => ({
      id: index,
      left: ((index * 41) % 100) + (index % 5) * 0.4,
      size: 3 + (index % (intensity === 'heavy' || intensity === 'severe' ? 6 : 4)),
      duration: (intensity === 'severe' ? 1.7 : intensity === 'heavy' ? 2.7 : intensity === 'light' || intensity === 'possible' ? 6.2 : 4.5) + (index % 6) * 0.3,
      delay: (index % 9) * 0.2,
      drift: intensity === 'severe' ? 190 + (index % 8) * 10 : intensity === 'heavy' ? 75 + (index % 8) * 7 : 12 + (index % 8) * 4,
    })),
    [intensity],
  )
  return flakes.map((flake) => <div
    key={flake.id}
    className={`weather-flake weather-particle-${intensity}`}
    style={{
      left: `${flake.left}%`,
      width: flake.size,
      height: flake.size,
      animationDuration: `${flake.duration}s`,
      animationDelay: `${flake.delay}s`,
      ['--flake-drift' as string]: `${flake.drift}px`,
    }}
  />)
}//SnowParticles

//This function renders a rainy sky background with animated rain particles
function RainScene({ intensity }: { intensity: WeatherIntensity }) {
  return <><div className={`weather-bg-rain weather-bg-${intensity}`} /><RainParticles intensity={intensity} /></>
}//RainScene

//This function renders a thunderstorm sky with rain, cloud layers, and lightning flash
function ThunderScene({ intensity }: { intensity: WeatherIntensity }) {
  return <>
    <div className={`weather-bg-thunder weather-bg-${intensity}`} />
    <RainParticles intensity={intensity === 'possible' ? 'light' : intensity} />
    <div className={`weather-thunder-flash weather-thunder-${intensity}`} />
    <div className="weather-cloud weather-cloud-a" />
    <div className="weather-cloud weather-cloud-c" />
  </>
}//ThunderScene

//This function renders a snowy sky background with animated snowflakes
function SnowScene({ intensity }: { intensity: WeatherIntensity }) {
  return <><div className={`weather-bg-snow weather-bg-${intensity}`} /><SnowParticles intensity={intensity} /></>
}//SnowScene

//This function renders mixed rain and snow falling together at the same intensity
function MixedScene({ intensity }: { intensity: WeatherIntensity }) {
  return <>
    <div className={`weather-bg-mixed weather-bg-${intensity}`} />
    <RainParticles intensity={intensity} />
    <SnowParticles intensity={intensity} />
  </>
}//MixedScene

//This function renders falling ice pellets or hail stones over an icy sky background
function PelletScene({ intensity, hail = false }: { intensity: WeatherIntensity; hail?: boolean }) {
  const pellets = useMemo(
    () => Array.from({ length: Math.max(10, Math.floor(particleCounts[intensity] * 0.7)) }, (_, index) => ({
      id: index,
      left: (index * 43) % 100,
      size: hail ? 5 + (index % 4) : 3 + (index % 3),
      duration: (hail ? 0.65 : 0.9) + (index % 5) * 0.08,
      delay: (index % 9) * 0.1,
    })),
    [hail, intensity],
  )
  return <>
    <div className={`weather-bg-ice weather-bg-${intensity}`} />
    {pellets.map((pellet) => <div
      key={pellet.id}
      className={`weather-pellet ${hail ? 'weather-hail' : ''}`}
      style={{
        left: `${pellet.left}%`,
        width: pellet.size,
        height: pellet.size,
        animationDuration: `${pellet.duration}s`,
        animationDelay: `${pellet.delay}s`,
      }}
    />)}
  </>
}//PelletScene

//This function renders a foggy sky with layered mist bands
function FogScene() {
  return <>
    <div className="weather-bg-fog" />
    <div className="weather-fog-layer weather-fog-a" />
    <div className="weather-fog-layer weather-fog-b" />
  </>
}//FogScene

//This function selects and renders the animated weather backdrop for the current scene
export function WeatherSceneBackground({
  scene,
  intensity,
}: {
  scene: WeatherScene
  intensity: WeatherIntensity
}) {
  return <div className="weather-bg-layer" aria-hidden>
    {scene === 'clear-day' && <ClearDayScene />}
    {scene === 'clear-night' && <ClearNightScene />}
    {scene === 'partly-cloudy-day' && <PartlyCloudyDayScene />}
    {scene === 'partly-cloudy-night' && <ClearNightScene partlyCloudy />}
    {scene === 'cloudy' && <CloudyScene />}
    {scene === 'rain' && <RainScene intensity={intensity} />}
    {scene === 'thunder' && <ThunderScene intensity={intensity} />}
    {scene === 'snow' && <SnowScene intensity={intensity} />}
    {scene === 'mixed' && <MixedScene intensity={intensity} />}
    {scene === 'ice' && <PelletScene intensity={intensity} />}
    {scene === 'hail' && <PelletScene intensity={intensity} hail />}
    {scene === 'fog' && <FogScene />}
  </div>
}//WeatherSceneBackground
