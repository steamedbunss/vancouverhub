import {
  ALL_CATEGORY_IDS,
  CATEGORIES,
  isCategoryPageTemporarilyDisabled,
} from '../../constants/categories'
import { useUserConfig } from '../../context/UserConfigContext'
import { RainbowText } from '../RainbowText'
import { Toggle } from '../ui/Toggle'

//NavCustomization lets the user choose which category links appear in the navbar
export function NavCustomization() {
  const { draft, setDraftNavVisible } = useUserConfig()

  return (
    <section data-onboarding-target="tour-settings-navigation" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
      <h3 className="text-xl font-bold tracking-[0.12em] text-gray-500 uppercase dark:text-gray-300">
        <RainbowText>Show in Nav Bar</RainbowText>
      </h3>
      {/*This map renders one toggle per category for navbar visibility*/}
      <div className="mt-2 divide-y divide-gray-100 dark:divide-gray-800">
        {ALL_CATEGORY_IDS.map((categoryId) => {
          const disabled = isCategoryPageTemporarilyDisabled(categoryId)

          return (
            <Toggle
              key={categoryId}
              label={
                disabled
                  ? `${CATEGORIES[categoryId].label} - Planned Future`
                  : CATEGORIES[categoryId].label
              }
              checked={disabled ? false : draft.navVisible[categoryId]}
              disabled={disabled}
              onChange={(value) => setDraftNavVisible(categoryId, value)}
            />
          )
        })}
      </div>
    </section>
  )
}//NavCustomization
