import { Link } from 'react-router-dom'
import { RainbowText } from '../../RainbowText'
import { MOCK_HOUSING } from '../../../data/mockData'

export function HousingSection() {
  return (
    <section className="py-8 md:py-10">
      {/*Right-aligned housing benchmarks and section title*/}
      <div className="flex flex-col items-start md:items-end md:text-right">
        {/*Badge showing which month the benchmark data represents*/}
        <span className="rounded-full bg-gray-900 px-3 py-1 text-[10px] font-medium text-white">
          {MOCK_HOUSING.month} Benchmarks available
        </span>

        {/*One-bedroom and two-bedroom benchmark rent figures*/}
        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:gap-12 md:justify-end">
          <div>
            <p className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl dark:text-white">
              ${MOCK_HOUSING.oneBed.toLocaleString()}
            </p>
            <p className="mt-2 text-[10px] font-semibold tracking-[0.15em] text-gray-500 uppercase dark:text-gray-400">
              1BR Benchmark Rent
            </p>
          </div>
          <div>
            <p className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl dark:text-white">
              ${MOCK_HOUSING.twoBed.toLocaleString()}
            </p>
            <p className="mt-2 text-[10px] font-semibold tracking-[0.15em] text-gray-500 uppercase dark:text-gray-400">
              2BR Benchmark Rent
            </p>
          </div>
        </div>

        <Link
          to="/housing"
          className="mt-10 text-[11px] font-semibold tracking-[0.2em] uppercase"
        >
          <RainbowText>See all →</RainbowText>
        </Link>
        <h2 className="mt-2 text-5xl font-black tracking-tighter text-black md:text-6xl md:leading-[0.9]">
          Housing
        </h2>
      </div>
    </section>
  )
}//HousingSection
