import { useUserConfig } from '../../context/UserConfigContext'
import { sectionShell } from './dashboardLayout'
import { TrafficSection } from './sections/TrafficSection'
import { EventsSection } from './sections/EventsSection'
import { Safety311Section } from './sections/Safety311Section'

//constant for a full-viewport snap panel that vertically centers its child section
const snapPanel =
  'flex min-h-[calc(100svh-4rem)] items-center py-8 md:py-12'

export function DashboardRenderer() {
  //read the user dashboard config to decide which sections are visible
  const { config } = useUserConfig()

  //visible holds boolean flags for each dashboard section toggle
  const visible = config.dashboardVisible

  return (
    <div className="bg-white dark:bg-gray-950">
      {/*Local events section; only rendered when the user has it enabled in settings*/}
      {visible['local-events'] && (
        <section data-elastic-snap className={snapPanel}>
          <EventsSection compact />
        </section>
      )}

      {/*Traffic section with a centered shell wrapper*/}
      {visible.traffic && (
        <section data-elastic-snap className={snapPanel}>
          <div className={`w-full ${sectionShell}`}>
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 lg:gap-10">
              {visible.traffic && <TrafficSection compact />}
            </div>
          </div>
        </section>
      )}

      {/*Safety 311 section; only rendered when the user has it enabled in settings*/}
      {visible['safety-311'] && (
        <section data-elastic-snap className={snapPanel}>
          <div className="mx-auto w-full max-w-7xl px-6 sm:px-8">
            <Safety311Section />
          </div>
        </section>
      )}
    </div>
  )
}//DashboardRenderer
