import type { ReleaseItem } from '@/types/release'

export const releases: ReleaseItem[] = [
  // ── February 2026 ──────────────────────────────────────────────────────

  // Feb 2 (Mon) — 1 release
  {
    id: 'wpf-001',
    title: 'Smart field logic v2',
    date: '2026-02-02',
    brand: 'WPForms',
    brandSlug: 'wpforms',
    releaseType: 'feature',
    summary: 'Redesigned conditional logic engine with support for nested field groups and multi-step form branching.',
    tags: ['forms', 'logic'],
    changelogUrl: 'https://wpforms.com/changelog/',
  },
  {
    id: 'aio-001',
    title: 'Smart schema helper rollout',
    date: '2026-02-02',
    brand: 'AIOSEO',
    brandSlug: 'aioseo',
    releaseType: 'feature',
    summary: 'AI-powered schema markup suggestions based on page content analysis and competitor data.',
    tags: ['seo', 'schema', 'ai'],
  },

  // Feb 3 (Tue) — 4 releases (cluster day #1)
  {
    id: 'mi-001',
    title: 'GA4 attribution fixes',
    date: '2026-02-03',
    brand: 'MonsterInsights',
    brandSlug: 'monsterinsights',
    releaseType: 'fix',
    summary: 'Resolved cross-domain tracking attribution errors affecting multi-property GA4 setups.',
    tags: ['analytics', 'ga4'],
    changelogUrl: 'https://monsterinsights.com/changelog/',
  },
  {
    id: 'smtp-001',
    title: 'SMTP log retention controls',
    date: '2026-02-03',
    brand: 'WP Mail SMTP',
    brandSlug: 'wp-mail-smtp',
    releaseType: 'feature',
    summary: 'New admin controls for email log retention periods with auto-purge scheduling.',
    tags: ['email', 'logs'],
  },
  {
    id: 'sp-001',
    title: 'Template library performance pass',
    date: '2026-02-03',
    brand: 'SeedProd',
    brandSlug: 'seedprod',
    releaseType: 'improvement',
    summary: 'Lazy-loaded template thumbnails and search index rebuild cut library load times by 60%.',
  },
  {
    id: 'om-001',
    title: 'Conversion insights dashboard polish',
    date: '2026-02-03',
    brand: 'OptinMonster',
    brandSlug: 'optinmonster',
    releaseType: 'improvement',
    summary: 'Refreshed dashboard charts with interactive tooltips and exportable date-range comparisons.',
  },

  // Feb 4 (Wed) — empty
  // Feb 5 (Thu) — empty

  // Feb 6 (Fri) — 2 releases
  {
    id: 'dup-001',
    title: 'Cloud backup encryption',
    date: '2026-02-06',
    brand: 'Duplicator',
    brandSlug: 'duplicator',
    releaseType: 'feature',
    summary: 'AES-256 client-side encryption for backups sent to S3, Google Drive, and Dropbox.',
    tags: ['backup', 'security'],
  },
  {
    id: 'edd-001',
    title: 'Checkout extensibility improvements',
    date: '2026-02-06',
    brand: 'Easy Digital Downloads',
    brandSlug: 'easy-digital-downloads',
    releaseType: 'improvement',
    summary: 'New hooks and template overrides for custom checkout field injection and validation.',
  },

  // Feb 9 (Mon) — empty
  // Feb 10 (Tue) — empty

  // Feb 11 (Wed) — 3 releases
  {
    id: 'aff-001',
    title: 'Tiered commission rules',
    date: '2026-02-11',
    brand: 'AffiliateWP',
    brandSlug: 'affiliatewp',
    releaseType: 'feature',
    summary: 'Automatic commission rate escalation based on monthly referral volume thresholds.',
    tags: ['affiliates', 'commissions'],
  },
  {
    id: 'swp-001',
    title: 'Search relevance tuning',
    date: '2026-02-11',
    brand: 'SearchWP',
    brandSlug: 'searchwp',
    releaseType: 'improvement',
    summary: 'Improved BM25 scoring weights and added per-engine relevance calibration controls.',
  },
  {
    id: 'sb-001',
    title: 'TikTok feed integration',
    date: '2026-02-11',
    brand: 'Smash Balloon',
    brandSlug: 'smash-balloon',
    releaseType: 'launch',
    summary: 'Brand new TikTok feed type supporting video embeds, hashtag feeds, and creator profiles.',
    tags: ['social', 'tiktok'],
    changelogUrl: 'https://smashballoon.com/changelog/',
  },

  // Feb 12 (Thu) — 4 releases (cluster day #2)
  {
    id: 'wpf-002',
    title: 'New onboarding flow for custom fields',
    date: '2026-02-12',
    brand: 'WPForms',
    brandSlug: 'wpforms',
    releaseType: 'improvement',
    summary: 'Step-by-step wizard guiding users through custom field creation with live preview.',
  },
  {
    id: 'aio-002',
    title: 'Breadcrumb schema depth fix',
    date: '2026-02-12',
    brand: 'AIOSEO',
    brandSlug: 'aioseo',
    releaseType: 'fix',
    summary: 'Fixed breadcrumb structured data truncation on deeply nested category hierarchies.',
  },
  {
    id: 'mi-002',
    title: 'Real-time dashboard widgets',
    date: '2026-02-12',
    brand: 'MonsterInsights',
    brandSlug: 'monsterinsights',
    releaseType: 'feature',
    summary: 'Live visitor count and active page widgets with 30-second auto-refresh in the WP dashboard.',
  },
  {
    id: 'am-001',
    title: 'Awesome Motive 15-year anniversary',
    date: '2026-02-12',
    brand: 'Awesome Motive',
    brandSlug: 'awesome-motive',
    releaseType: 'milestone',
    summary: 'Celebrating 15 years of building WordPress tools used by over 25 million websites.',
    tags: ['company', 'milestone'],
  },

  // Feb 13 (Fri) — 1 release
  {
    id: 'smtp-002',
    title: 'Outlook OAuth token refresh fix',
    date: '2026-02-13',
    brand: 'WP Mail SMTP',
    brandSlug: 'wp-mail-smtp',
    releaseType: 'fix',
    summary: 'Resolved intermittent 401 errors when refreshing Outlook/Microsoft 365 OAuth tokens.',
  },

  // Feb 16 (Mon) — empty

  // Feb 17 (Tue) — 2 releases
  {
    id: 'sp-002',
    title: 'WooCommerce product grid block',
    date: '2026-02-17',
    brand: 'SeedProd',
    brandSlug: 'seedprod',
    releaseType: 'feature',
    summary: 'Drag-and-drop product grid block with filtering, sorting, and sale badge options.',
    tags: ['pagebuilder', 'woocommerce'],
  },
  {
    id: 'dup-002',
    title: 'Migration progress indicators',
    date: '2026-02-17',
    brand: 'Duplicator',
    brandSlug: 'duplicator',
    releaseType: 'improvement',
    summary: 'Real-time progress bars and ETA estimates during site migration and restoration.',
  },

  // Feb 18 (Wed) — 3 releases
  {
    id: 'om-002',
    title: 'Exit intent sensitivity tuning',
    date: '2026-02-18',
    brand: 'OptinMonster',
    brandSlug: 'optinmonster',
    releaseType: 'improvement',
    summary: 'Adjustable exit intent sensitivity slider with mobile scroll-up trigger fallback.',
  },
  {
    id: 'edd-002',
    title: 'Stripe payment element upgrade',
    date: '2026-02-18',
    brand: 'Easy Digital Downloads',
    brandSlug: 'easy-digital-downloads',
    releaseType: 'feature',
    summary: 'Migrated from legacy Stripe Checkout to Payment Element API with Apple Pay and Google Pay.',
    tags: ['payments', 'stripe'],
  },
  {
    id: 'aff-002',
    title: 'Affiliate coupon attribution fix',
    date: '2026-02-18',
    brand: 'AffiliateWP',
    brandSlug: 'affiliatewp',
    releaseType: 'fix',
    summary: 'Fixed coupon-based referral attribution failing when WooCommerce cart contains subscriptions.',
  },

  // Feb 19 (Thu) — empty

  // Feb 20 (Fri) — 2 releases
  {
    id: 'char-001',
    title: 'Campaign goal progress redesign',
    date: '2026-02-20',
    brand: 'Charitable',
    brandSlug: 'charitable',
    releaseType: 'improvement',
    summary: 'Redesigned campaign goal progress bars with animated fills, percentage labels, and milestone markers.',
    tags: ['donations', 'ux'],
  },
  {
    id: 'swp-002',
    title: 'PDF content indexing',
    date: '2026-02-20',
    brand: 'SearchWP',
    brandSlug: 'searchwp',
    releaseType: 'launch',
    summary: 'Full-text search indexing for uploaded PDF documents with highlighted excerpt previews.',
    tags: ['search', 'pdf'],
  },

  // Feb 23 (Mon) — 4 releases (cluster day #3)
  {
    id: 'sb-002',
    title: 'Feed caching layer rewrite',
    date: '2026-02-23',
    brand: 'Smash Balloon',
    brandSlug: 'smash-balloon',
    releaseType: 'improvement',
    summary: 'Rebuilt caching layer with stale-while-revalidate strategy reducing API calls by 40%.',
  },
  {
    id: 'wpf-003',
    title: 'Stripe payment field Apple Pay',
    date: '2026-02-23',
    brand: 'WPForms',
    brandSlug: 'wpforms',
    releaseType: 'feature',
    summary: 'Apple Pay and Google Pay support added to the Stripe payment field for one-tap checkout.',
    tags: ['forms', 'payments'],
    changelogUrl: 'https://wpforms.com/changelog/',
  },
  {
    id: 'aio-003',
    title: 'Link assistant crawl speed boost',
    date: '2026-02-23',
    brand: 'AIOSEO',
    brandSlug: 'aioseo',
    releaseType: 'improvement',
    summary: 'Parallelized internal link discovery scans now complete 3x faster on large sites.',
  },
  {
    id: 'mi-003',
    title: 'WooCommerce funnel tracking',
    date: '2026-02-23',
    brand: 'MonsterInsights',
    brandSlug: 'monsterinsights',
    releaseType: 'launch',
    summary: 'End-to-end funnel visualization from product view through checkout with drop-off analysis.',
    tags: ['analytics', 'woocommerce', 'funnels'],
  },

  // Feb 24 (Tue) — 2 releases
  {
    id: 'smtp-003',
    title: 'SendGrid webhook verification',
    date: '2026-02-24',
    brand: 'WP Mail SMTP',
    brandSlug: 'wp-mail-smtp',
    releaseType: 'feature',
    summary: 'Automatic delivery status tracking via signed SendGrid event webhooks.',
  },
  {
    id: 'sp-003',
    title: 'Maintenance mode countdown timer',
    date: '2026-02-24',
    brand: 'SeedProd',
    brandSlug: 'seedprod',
    releaseType: 'feature',
    summary: 'Animated countdown timer block for coming soon and maintenance pages with timezone support.',
  },

  // Feb 25 (Wed) — 1 release
  {
    id: 'dup-003',
    title: 'Multisite subsite cloning',
    date: '2026-02-25',
    brand: 'Duplicator',
    brandSlug: 'duplicator',
    releaseType: 'launch',
    summary: 'One-click subsite duplication within WordPress Multisite networks with table prefix handling.',
    tags: ['backup', 'multisite'],
  },

  // Feb 26 (Thu) — empty (5th empty weekday)

  // Feb 27 (Fri) — 3 releases
  {
    id: 'om-003',
    title: 'Geo-targeted campaign rules',
    date: '2026-02-27',
    brand: 'OptinMonster',
    brandSlug: 'optinmonster',
    releaseType: 'feature',
    summary: 'Show or hide campaigns based on visitor country, state, or city using IP geolocation.',
    tags: ['campaigns', 'targeting'],
  },
  {
    id: 'edd-003',
    title: 'Download file versioning',
    date: '2026-02-27',
    brand: 'Easy Digital Downloads',
    brandSlug: 'easy-digital-downloads',
    releaseType: 'improvement',
    summary: 'File version history with rollback support and customer notification on new versions.',
  },
  {
    id: 'aff-003',
    title: 'Creative asset library',
    date: '2026-02-27',
    brand: 'AffiliateWP',
    brandSlug: 'affiliatewp',
    releaseType: 'launch',
    summary: 'Centralized banner and link asset library for affiliates with performance tracking per creative.',
  },

  // ── March 2026 ─────────────────────────────────────────────────────────

  // Mar 2 (Mon) — 3 releases
  {
    id: 'char-005',
    title: 'Peer-to-peer fundraising campaigns',
    date: '2026-03-02',
    brand: 'Charitable',
    brandSlug: 'charitable',
    releaseType: 'launch',
    summary: 'Supporters can create personal fundraising pages linked to a parent campaign with individual goals and social sharing.',
    tags: ['donations', 'p2p'],
  },
  {
    id: 'swp-003',
    title: 'Live search results preview',
    date: '2026-03-02',
    brand: 'SearchWP',
    brandSlug: 'searchwp',
    releaseType: 'feature',
    summary: 'AJAX-powered live search dropdown with highlighted matching terms and thumbnail previews.',
  },
  {
    id: 'sb-003',
    title: 'Instagram Reels carousel layout',
    date: '2026-03-02',
    brand: 'Smash Balloon',
    brandSlug: 'smash-balloon',
    releaseType: 'feature',
    summary: 'Swipeable carousel layout optimized for Instagram Reels with autoplay and lightbox.',
  },

  // Mar 3 (Tue) — 4 releases (cluster day #4)
  {
    id: 'wpf-004',
    title: 'Repeater field group support',
    date: '2026-03-03',
    brand: 'WPForms',
    brandSlug: 'wpforms',
    releaseType: 'feature',
    summary: 'Users can dynamically add or remove groups of fields with customizable min/max limits.',
  },
  {
    id: 'aio-004',
    title: 'IndexNow auto-ping on publish',
    date: '2026-03-03',
    brand: 'AIOSEO',
    brandSlug: 'aioseo',
    releaseType: 'improvement',
    summary: 'Automatic IndexNow pings to Bing and Yandex when posts are published or updated.',
  },
  {
    id: 'mi-004',
    title: 'Site speed report integration',
    date: '2026-03-03',
    brand: 'MonsterInsights',
    brandSlug: 'monsterinsights',
    releaseType: 'feature',
    summary: 'Core Web Vitals dashboard widget pulling data from Chrome UX Report API.',
    tags: ['analytics', 'performance'],
  },
  {
    id: 'smtp-004',
    title: 'Email delivery rate dashboard',
    date: '2026-03-03',
    brand: 'WP Mail SMTP',
    brandSlug: 'wp-mail-smtp',
    releaseType: 'launch',
    summary: 'Centralized delivery success rate tracking across all configured mailer connections.',
    changelogUrl: 'https://wpmailsmtp.com/changelog/',
  },

  // Mar 4 (Wed) — 1 release
  {
    id: 'sp-004',
    title: 'Theme builder header/footer support',
    date: '2026-03-04',
    brand: 'SeedProd',
    brandSlug: 'seedprod',
    releaseType: 'feature',
    summary: 'Full site editing with custom header and footer templates for any WordPress theme.',
  },

  // Mar 5 (Thu) — 1 release
  {
    id: 'char-002',
    title: 'Donation form templates library',
    date: '2026-03-05',
    brand: 'Charitable',
    brandSlug: 'charitable',
    releaseType: 'feature',
    summary: 'Pre-built donation form templates for nonprofits with customizable layouts and goal tracking widgets.',
    tags: ['donations', 'templates'],
  },

  // Mar 6 (Fri) — 3 releases
  {
    id: 'dup-004',
    title: 'Scheduled backup timezone fix',
    date: '2026-03-06',
    brand: 'Duplicator',
    brandSlug: 'duplicator',
    releaseType: 'fix',
    summary: 'Scheduled backups now respect WordPress timezone setting instead of defaulting to UTC.',
  },
  {
    id: 'om-004',
    title: 'A/B test statistical significance',
    date: '2026-03-06',
    brand: 'OptinMonster',
    brandSlug: 'optinmonster',
    releaseType: 'improvement',
    summary: 'Auto-detection of statistical significance in A/B tests with confidence interval display.',
  },

  // Mar 8 (Sun) — 1 release
  {
    id: 'char-006',
    title: 'Donation receipt PDF generator',
    date: '2026-03-08',
    brand: 'Charitable',
    brandSlug: 'charitable',
    releaseType: 'feature',
    summary: 'Automatic PDF receipt generation for tax-deductible donations with customizable templates and org branding.',
    tags: ['donations', 'pdf'],
  },

  // Mar 9 (Mon) — 3 releases
  {
    id: 'edd-004',
    title: 'Customer portal redesign',
    date: '2026-03-09',
    brand: 'Easy Digital Downloads',
    brandSlug: 'easy-digital-downloads',
    releaseType: 'improvement',
    summary: 'Modern customer account portal with tabbed navigation, order history, and license management.',
  },
  {
    id: 'aff-004',
    title: 'Affiliate dashboard mobile redesign',
    date: '2026-03-09',
    brand: 'AffiliateWP',
    brandSlug: 'affiliatewp',
    releaseType: 'improvement',
    summary: 'Fully responsive affiliate dashboard with swipeable stats cards and mobile-optimized reports.',
  },
  {
    id: 'swp-004',
    title: 'WooCommerce attribute search',
    date: '2026-03-09',
    brand: 'SearchWP',
    brandSlug: 'searchwp',
    releaseType: 'feature',
    summary: 'Search by product attributes like color, size, and custom taxonomies with faceted filtering.',
    tags: ['search', 'woocommerce'],
  },

  // Mar 10 (Tue) — 2 releases
  {
    id: 'sb-004',
    title: 'YouTube Shorts feed support',
    date: '2026-03-10',
    brand: 'Smash Balloon',
    brandSlug: 'smash-balloon',
    releaseType: 'feature',
    summary: 'Dedicated YouTube Shorts feed type with vertical card layout and play-on-hover.',
  },
  {
    id: 'wpf-005',
    title: 'Form entry export scheduling',
    date: '2026-03-10',
    brand: 'WPForms',
    brandSlug: 'wpforms',
    releaseType: 'improvement',
    summary: 'Automated CSV/XLSX exports of form entries on daily, weekly, or monthly schedules via email.',
  },

  // Mar 11 (Wed) — empty

  // Mar 12 (Thu) — 3 releases
  {
    id: 'char-003',
    title: 'Recurring donations fix',
    date: '2026-03-12',
    brand: 'Charitable',
    brandSlug: 'charitable',
    releaseType: 'fix',
    summary: 'Fixed recurring donation processing failures when PayPal subscription webhooks arrive out of order.',
    tags: ['donations', 'payments'],
  },
  {
    id: 'aio-005',
    title: 'Redirection regex pattern support',
    date: '2026-03-12',
    brand: 'AIOSEO',
    brandSlug: 'aioseo',
    releaseType: 'feature',
    summary: 'Full regex support in redirect rules with capture group substitution and test mode.',
  },
  {
    id: 'mi-005',
    title: 'Popular posts widget refresh',
    date: '2026-03-12',
    brand: 'MonsterInsights',
    brandSlug: 'monsterinsights',
    releaseType: 'improvement',
    summary: 'Redesigned popular posts widget with new themes, inline styling options, and Gutenberg block.',
  },

  // Mar 13 (Fri) — 1 release
  {
    id: 'am-002',
    title: 'Awesome Motive acquires Jetstash',
    date: '2026-03-13',
    brand: 'Awesome Motive',
    brandSlug: 'awesome-motive',
    releaseType: 'milestone',
    summary: 'Strategic acquisition of Jetstash, a performance optimization platform for WordPress.',
    tags: ['company', 'acquisition'],
  },

  // Mar 14 (Sat) — 1 release
  {
    id: 'char-007',
    title: 'Gift Aid UK tax integration',
    date: '2026-03-14',
    brand: 'Charitable',
    brandSlug: 'charitable',
    releaseType: 'feature',
    summary: 'Built-in Gift Aid declaration capture and HMRC submission support for UK-based charities to reclaim 25% tax.',
    tags: ['donations', 'tax', 'uk'],
  },

  // Mar 16 (Mon) — 4 releases (cluster day #5)
  {
    id: 'smtp-005',
    title: 'Brevo (Sendinblue) mailer support',
    date: '2026-03-16',
    brand: 'WP Mail SMTP',
    brandSlug: 'wp-mail-smtp',
    releaseType: 'launch',
    summary: 'Native Brevo integration with one-click API key setup and transactional email routing.',
  },
  {
    id: 'sp-005',
    title: 'AI content block for landing pages',
    date: '2026-03-16',
    brand: 'SeedProd',
    brandSlug: 'seedprod',
    releaseType: 'launch',
    summary: 'AI-powered content generation block that creates copy based on page context and tone settings.',
    tags: ['pagebuilder', 'ai'],
  },
  {
    id: 'dup-005',
    title: 'Large file chunked upload',
    date: '2026-03-16',
    brand: 'Duplicator',
    brandSlug: 'duplicator',
    releaseType: 'improvement',
    summary: 'Chunked file uploads for backups over 2GB with automatic resume on connection failure.',
  },
  {
    id: 'om-005',
    title: 'Shopify integration launch',
    date: '2026-03-16',
    brand: 'OptinMonster',
    brandSlug: 'optinmonster',
    releaseType: 'launch',
    summary: 'Full OptinMonster campaign support for Shopify storefronts with native app installation.',
    tags: ['campaigns', 'shopify'],
  },

  // Mar 17 (Tue) — 2 releases
  {
    id: 'edd-005',
    title: 'License key generation overhaul',
    date: '2026-03-17',
    brand: 'Easy Digital Downloads',
    brandSlug: 'easy-digital-downloads',
    releaseType: 'improvement',
    summary: 'Cryptographically secure license key generation with customizable formats and bulk creation.',
  },
  {
    id: 'aff-005',
    title: 'PayPal mass payout integration',
    date: '2026-03-17',
    brand: 'AffiliateWP',
    brandSlug: 'affiliatewp',
    releaseType: 'feature',
    summary: 'One-click affiliate payouts via PayPal Payouts API with batch processing and status tracking.',
    tags: ['affiliates', 'payments'],
  },

  // Mar 18 (Wed) — empty

  // Mar 18 (Wed) — 1 release
  {
    id: 'char-008',
    title: 'Donor wall public display widget',
    date: '2026-03-18',
    brand: 'Charitable',
    brandSlug: 'charitable',
    releaseType: 'feature',
    summary: 'Embeddable donor wall widget showcasing contributors with customizable layouts, avatars, and donation tiers.',
    tags: ['donations', 'widget'],
  },

  // Mar 19 (Thu) — 3 releases
  {
    id: 'swp-005',
    title: 'Multisite global search',
    date: '2026-03-19',
    brand: 'SearchWP',
    brandSlug: 'searchwp',
    releaseType: 'launch',
    summary: 'Cross-site search across WordPress Multisite network with unified results ranking.',
  },
  {
    id: 'sb-005',
    title: 'Feed accessibility audit pass',
    date: '2026-03-19',
    brand: 'Smash Balloon',
    brandSlug: 'smash-balloon',
    releaseType: 'fix',
    summary: 'Fixed keyboard navigation, ARIA labels, and screen reader announcements across all feed types.',
    tags: ['social', 'accessibility'],
  },
  {
    id: 'wpf-006',
    title: 'Calculations field decimal precision fix',
    date: '2026-03-19',
    brand: 'WPForms',
    brandSlug: 'wpforms',
    releaseType: 'fix',
    summary: 'Fixed rounding errors in calculation fields when using currency formats with 3+ decimal places.',
  },

  // Mar 20 (Fri) — 1 release
  {
    id: 'aio-006',
    title: 'OpenGraph image fallback chain',
    date: '2026-03-20',
    brand: 'AIOSEO',
    brandSlug: 'aioseo',
    releaseType: 'fix',
    summary: 'Improved OpenGraph image resolution with fallback chain: custom → featured → first content image.',
  },

  // Mar 20 (Fri) — Charitable release added
  {
    id: 'char-004',
    title: 'Donor management dashboard',
    date: '2026-03-20',
    brand: 'Charitable',
    brandSlug: 'charitable',
    releaseType: 'feature',
    summary: 'Centralized donor management dashboard with lifetime value tracking, segmentation, and export tools.',
    tags: ['donations', 'dashboard'],
  },

  // Mar 22 (Sun) — 1 release
  {
    id: 'char-009',
    title: 'Payment gateway retry logic',
    date: '2026-03-22',
    brand: 'Charitable',
    brandSlug: 'charitable',
    releaseType: 'fix',
    summary: 'Intelligent retry logic for failed payment gateway transactions with exponential backoff and donor notification.',
    tags: ['donations', 'payments'],
  },

  // Mar 23 (Mon) — 2 releases
  {
    id: 'mi-006',
    title: '100 million installs milestone',
    date: '2026-03-23',
    brand: 'MonsterInsights',
    brandSlug: 'monsterinsights',
    releaseType: 'milestone',
    summary: 'MonsterInsights crosses 100 million all-time downloads on the WordPress plugin repository.',
    tags: ['analytics', 'milestone'],
  },
  {
    id: 'smtp-006',
    title: 'DNS record auto-check for DKIM/SPF',
    date: '2026-03-23',
    brand: 'WP Mail SMTP',
    brandSlug: 'wp-mail-smtp',
    releaseType: 'feature',
    summary: 'Automatic DNS record validation for DKIM and SPF with guided fix suggestions.',
  },

  // Mar 24 (Tue) — 2 releases
  {
    id: 'sp-006',
    title: 'Global design token system',
    date: '2026-03-24',
    brand: 'SeedProd',
    brandSlug: 'seedprod',
    releaseType: 'improvement',
    summary: 'Centralized color, typography, and spacing tokens applied across all page templates.',
  },
  {
    id: 'dup-006',
    title: 'Backblaze B2 storage support',
    date: '2026-03-24',
    brand: 'Duplicator',
    brandSlug: 'duplicator',
    releaseType: 'feature',
    summary: 'Native Backblaze B2 cloud storage integration for backup destinations.',
  },

  // Mar 25 (Wed) — 3 releases
  {
    id: 'om-006',
    title: 'Inline campaign embed type',
    date: '2026-03-25',
    brand: 'OptinMonster',
    brandSlug: 'optinmonster',
    releaseType: 'feature',
    summary: 'New inline embed campaign type that flows within page content with scroll-triggered animation.',
  },
  {
    id: 'edd-006',
    title: 'REST API v3 launch',
    date: '2026-03-25',
    brand: 'Easy Digital Downloads',
    brandSlug: 'easy-digital-downloads',
    releaseType: 'launch',
    summary: 'Complete REST API rewrite with OAuth2 authentication, pagination, and webhook subscriptions.',
    tags: ['api', 'developer'],
    changelogUrl: 'https://easydigitaldownloads.com/changelog/',
  },
  {
    id: 'am-003',
    title: 'Awesome Motive charity drive results',
    date: '2026-03-25',
    brand: 'Awesome Motive',
    brandSlug: 'awesome-motive',
    releaseType: 'milestone',
    summary: 'Annual charity drive raises $500K for tech education initiatives in underserved communities.',
  },

  // Mar 26 (Thu) — 1 release
  {
    id: 'aff-006',
    title: 'Fraud detection alerts',
    date: '2026-03-26',
    brand: 'AffiliateWP',
    brandSlug: 'affiliatewp',
    releaseType: 'fix',
    summary: 'Automated fraud detection flagging suspicious referral patterns with admin email alerts.',
  },

  // Mar 27 (Fri) — 2 releases
  {
    id: 'swp-006',
    title: 'Custom field weight multipliers',
    date: '2026-03-27',
    brand: 'SearchWP',
    brandSlug: 'searchwp',
    releaseType: 'improvement',
    summary: 'Granular weight multiplier controls for ACF, Meta Box, and Pods custom field sources.',
  },
  {
    id: 'sb-006',
    title: 'Masonry layout rendering fix',
    date: '2026-03-27',
    brand: 'Smash Balloon',
    brandSlug: 'smash-balloon',
    releaseType: 'fix',
    summary: 'Fixed layout shift and gap inconsistencies in masonry grid on Safari and Firefox.',
  },

  // Mar 30 (Mon) — 3 releases
  {
    id: 'wpf-008',
    title: 'WPForms 10 million active installs',
    date: '2026-03-30',
    brand: 'WPForms',
    brandSlug: 'wpforms',
    releaseType: 'milestone',
    summary: 'WPForms reaches 10 million active installations, becoming the most popular WordPress form plugin.',
    tags: ['forms', 'milestone'],
  },
  {
    id: 'wpf-007',
    title: 'Conversational forms mode',
    date: '2026-03-30',
    brand: 'WPForms',
    brandSlug: 'wpforms',
    releaseType: 'launch',
    summary: 'One-question-at-a-time conversational form layout with smooth transitions and progress bar.',
    tags: ['forms', 'ux'],
  },
  {
    id: 'aio-007',
    title: 'AI title and description generator',
    date: '2026-03-30',
    brand: 'AIOSEO',
    brandSlug: 'aioseo',
    releaseType: 'feature',
    summary: 'One-click AI generation of SEO titles and meta descriptions based on post content analysis.',
    tags: ['seo', 'ai'],
  },
]
