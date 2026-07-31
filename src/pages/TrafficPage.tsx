//TrafficPage.tsx is a page wrapper for BC road and traffic conditions
import { DriveBCSection } from '../components/DriveBCSection'
import { RainbowText } from '../components/RainbowText'

//TrafficPage renders the page title and delegates data loading to DriveBCSection
export function TrafficPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      {/*Page header with the traffic conditions title*/}
      <div className="text-center">
        <h1 className="text-4xl font-black tracking-tight md:text-5xl">
          <RainbowText>BC Traffic Conditions</RainbowText>
        </h1>
      </div>
      {/*DriveBCSection handles Open511 event fetching, filters, list view, and map view*/}
      <div className="mt-8">
        <DriveBCSection />
      </div>
    </div>
  )
}//TrafficPage
