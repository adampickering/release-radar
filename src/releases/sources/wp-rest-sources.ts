import type { WpRestChangelogSource } from '../types'

export const wpRestSources: WpRestChangelogSource[] = [
  {
    brand: 'Thrive Themes',
    brandSlug: 'thrive-themes',
    apiUrl: 'https://changelog.thrivethemes.com/wp-json/wp/v2/posts',
    perPage: 30,
    products: [
      { pluginSlug: 'thrive-architect', pluginName: 'Thrive Architect', headingMatch: 'Thrive Architect' },
      { pluginSlug: 'thrive-theme-builder', pluginName: 'Thrive Theme Builder', headingMatch: 'Thrive Theme Builder' },
      { pluginSlug: 'thrive-quiz-builder', pluginName: 'Thrive Quiz Builder', headingMatch: 'Thrive Quiz Builder' },
      { pluginSlug: 'thrive-apprentice', pluginName: 'Thrive Apprentice', headingMatch: 'Thrive Apprentice' },
      { pluginSlug: 'thrive-ultimatum', pluginName: 'Thrive Ultimatum', headingMatch: 'Thrive Ultimatum' },
      { pluginSlug: 'thrive-leads', pluginName: 'Thrive Leads', headingMatch: 'Thrive Leads' },
      { pluginSlug: 'thrive-dashboard', pluginName: 'Thrive Dashboard', headingMatch: 'Thrive Dashboard' },
      { pluginSlug: 'thrive-comments', pluginName: 'Thrive Comments', headingMatch: 'Thrive Comments' },
      { pluginSlug: 'thrive-product-manager', pluginName: 'Thrive Product Manager', headingMatch: 'Thrive Product Manager' },
    ],
    accessDefault: 'public',
  },
]
