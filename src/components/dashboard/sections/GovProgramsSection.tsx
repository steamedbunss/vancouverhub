import { Link } from 'react-router-dom'
import { RainbowText } from '../../RainbowText'
import { MOCK_GOV_PROGRAMS } from '../../../data/mockData'

//LADDER_OFFSETS holds Tailwind margin classes for a staggered card layout
const LADDER_OFFSETS = ['ml-0', 'ml-5 sm:ml-8', 'ml-10 sm:ml-16']

export function GovProgramsSection() {
  return (
    <section className="py-8 md:py-10">
      {/*Section header with link, title, and active program count*/}
      <div className="text-left">
        <Link
          to="/gov-programs"
          className="text-[11px] font-semibold tracking-[0.2em] uppercase"
        >
          <RainbowText>See all →</RainbowText>
        </Link>
        <h2 className="mt-3 text-5xl font-black tracking-tighter text-gray-900 md:text-6xl md:leading-[0.95] dark:text-white">
          Gov
          <br />
          Programs
        </h2>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {MOCK_GOV_PROGRAMS.activePrograms} active programs near you
        </p>
      </div>

      {/*Highlight cards in a staggered ladder layout*/}
      <div className="mt-8 flex flex-col gap-3">
        {/*This map iterates through each program highlight and renders a card*/}
        {MOCK_GOV_PROGRAMS.highlights.map((program, index) => (
          <div
            key={program.title}
            className={`max-w-sm rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] ${LADDER_OFFSETS[index]}`}
          >
            <h3 className="text-sm leading-snug font-bold text-gray-900">
              {program.title}
            </h3>
            <p className="mt-2 text-[11px] text-gray-500">{program.deadline}</p>
          </div>
        ))}
      </div>
    </section>
  )
}//GovProgramsSection
