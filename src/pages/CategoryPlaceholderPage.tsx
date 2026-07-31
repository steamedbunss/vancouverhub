//CategoryPlaceholderPage.tsx shows a coming soon message for categories not yet built
import { Link } from 'react-router-dom'
import type { CategoryDefinition } from '../types'

//props for a placeholder page; category supplies the label and description text
interface CategoryPlaceholderPageProps {
  category: CategoryDefinition
}

//CategoryPlaceholderPage displays static placeholder content for an unfinished category
export function CategoryPlaceholderPage({
  category,
}: CategoryPlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      {/*Coming soon badge and category title from the passed category definition*/}
      <p className="text-[11px] font-semibold tracking-[0.2em] text-gray-400 uppercase">
        Coming soon
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-900 md:text-5xl">
        {category.label}
      </h1>
      <p className="mt-4 max-w-lg text-lg leading-relaxed text-gray-500">
        {category.description}
      </p>
      {/*Placeholder notice and link back to the dashboard*/}
      <p className="mt-6 text-sm text-gray-400">
        This page is a placeholder. Full category views will be built next.
      </p>
      <Link
        to="/"
        className="mt-8 inline-block text-sm font-medium text-hub-navy hover:underline"
      >
        ← Back to dashboard
      </Link>
    </div>
  )
}//CategoryPlaceholderPage
