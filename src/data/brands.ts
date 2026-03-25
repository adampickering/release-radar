import type { BrandInfo } from '@/types/release'

export const brands: BrandInfo[] = [
  { name: 'WPForms',               slug: 'wpforms',               domain: 'wpforms.com',               color: '#E27730' },
  { name: 'AIOSEO',                slug: 'aioseo',                domain: 'aioseo.com',                color: '#005AE0' },
  { name: 'WP Mail SMTP',          slug: 'wp-mail-smtp',          domain: 'wpmailsmtp.com',            color: '#E27730' },
  { name: 'MonsterInsights',       slug: 'monsterinsights',       domain: 'monsterinsights.com',       color: '#5FA624' },
  { name: 'OptinMonster',          slug: 'optinmonster',          domain: 'optinmonster.com',          color: '#7CBB32' },
  { name: 'SeedProd',              slug: 'seedprod',              domain: 'seedprod.com',              color: '#F56E28' },
  { name: 'Duplicator',            slug: 'duplicator',            domain: 'duplicator.com',            color: '#00A0D2' },
  { name: 'AffiliateWP',           slug: 'affiliatewp',           domain: 'affiliatewp.com',           color: '#1E7AAF' },
  { name: 'SearchWP',              slug: 'searchwp',              domain: 'searchwp.com',              color: '#3A82D6' },
  { name: 'Smash Balloon',         slug: 'smash-balloon',         domain: 'smashballoon.com',          color: '#EB4141' },
  { name: 'Easy Digital Downloads', slug: 'easy-digital-downloads', domain: 'easydigitaldownloads.com', color: '#2794DA' },
  { name: 'Awesome Motive',        slug: 'awesome-motive',        domain: 'awesomemotive.com',         color: '#185CE3' },
]

export const brandsBySlug = Object.fromEntries(brands.map(b => [b.slug, b]))
