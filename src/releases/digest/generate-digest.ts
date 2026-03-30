import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface UiRelease {
  id: string
  title: string
  date: string
  brand: string
  brandSlug: string
  releaseType: string
  summary: string
  changelogUrl: string
  tags: string[]
}

interface DigestHighlight {
  title: string
  type: string
  summary: string
}

interface DigestOtherRelease {
  title: string
  type: string
  shortSummary: string
}

interface DigestStats {
  releases: number
  brands: number
  features: number
  fixes: number
}

interface DigestContent {
  weekRange: string
  greeting: string
  introParagraph: string
  stats: DigestStats
  highlights: DigestHighlight[]
  otherReleases: DigestOtherRelease[]
  closingJoke: string
  generatedAt: string
}

interface OpenRouterChoice {
  message: {
    content: string
  }
}

interface OpenRouterResponse {
  choices: OpenRouterChoice[]
}

interface AiDigestResult {
  greeting: string
  introParagraph: string
  highlights: DigestHighlight[]
  closingJoke: string
}

function getWeekReleases(releases: UiRelease[]): UiRelease[] {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  return releases
    .filter((r) => {
      if (!r.date) return false
      const releaseDate = new Date(r.date)
      return releaseDate >= sevenDaysAgo
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })
}

function computeStats(releases: UiRelease[]): DigestStats {
  const brands = new Set(releases.map((r) => r.brandSlug))
  const features = releases.filter(
    (r) => r.releaseType === 'feature' || r.releaseType === 'launch' || r.releaseType === 'milestone'
  ).length
  const fixes = releases.filter((r) => r.releaseType === 'fix').length

  return {
    releases: releases.length,
    brands: brands.size,
    features,
    fixes,
  }
}

function getWeekRange(): string {
  const now = new Date()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]

  const startMonth = monthNames[sevenDaysAgo.getMonth()]
  const endMonth = monthNames[now.getMonth()]
  const startDay = sevenDaysAgo.getDate()
  const endDay = now.getDate()
  const year = now.getFullYear()

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} \u2013 ${endDay}, ${year}`
  }
  return `${startMonth} ${startDay} \u2013 ${endMonth} ${endDay}, ${year}`
}

async function callOpenRouter(releases: UiRelease[], stats: DigestStats): Promise<AiDigestResult> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set')
  }

  const releaseSummaries = releases
    .map((r) => `- ${r.title} (${r.releaseType}): ${r.summary.slice(0, 200)}`)
    .join('\n')

  const systemPrompt = `You are a witty newsletter writer for a WordPress plugin industry digest called "Release Radar".
Your tone is knowledgeable, slightly playful, and engaging — like a seasoned developer who enjoys a good pun but keeps things professional.
You write for an audience of WordPress developers and agency owners who care about plugin updates.

You MUST respond with valid JSON only, no markdown code blocks, no prose outside the JSON.

JSON format:
{
  "greeting": "A brief, warm and slightly witty greeting (1 sentence)",
  "introParagraph": "An engaging intro paragraph summarizing the week's release activity (2-3 sentences, witty but informative)",
  "highlights": [
    {
      "title": "Plugin Name vX.Y.Z",
      "type": "feature|fix|improvement|launch|milestone|experiment",
      "summary": "A compelling 1-2 sentence summary of why this release matters"
    }
  ],
  "closingJoke": "A short, clever closing quip or pun related to WordPress, plugins, or software releases (1-2 sentences)"
}

Pick 3-5 most noteworthy releases as highlights. Focus on major features, significant fixes, or interesting launches.`

  const userPrompt = `Here's this week's WordPress plugin release data:

Stats: ${stats.releases} releases from ${stats.brands} brands (${stats.features} features/launches, ${stats.fixes} fixes)

Releases:
${releaseSummaries}

Write the digest content based on these releases.`

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter API error ${response.status}: ${errorText}`)
  }

  const data = (await response.json()) as OpenRouterResponse
  const rawContent = data.choices[0]?.message?.content ?? ''

  // Strip markdown code blocks if present
  const jsonContent = rawContent
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()

  const parsed = JSON.parse(jsonContent) as AiDigestResult
  return parsed
}

async function main(): Promise<void> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set')
  }

  const outputDir = resolve(import.meta.dirname, '../output')
  const inputPath = resolve(outputDir, 'ui-releases.json')
  const outputPath = resolve(outputDir, 'weekly-digest.json')

  const rawData = readFileSync(inputPath, 'utf-8')
  const allReleases = JSON.parse(rawData) as UiRelease[]

  const weekReleases = getWeekReleases(allReleases)

  if (weekReleases.length === 0) {
    console.log('No releases found in the last 7 days. Exiting.')
    process.exit(0)
  }

  console.log(`Found ${weekReleases.length} releases from the last 7 days across ${new Set(weekReleases.map(r => r.brandSlug)).size} brands`)

  const stats = computeStats(weekReleases)
  const weekRange = getWeekRange()

  console.log('Calling OpenRouter API...')
  const aiResult = await callOpenRouter(weekReleases, stats)

  // Build otherReleases from non-highlight titles
  const highlightTitles = new Set(aiResult.highlights.map((h) => h.title.toLowerCase()))
  const otherReleases: DigestOtherRelease[] = weekReleases
    .filter((r) => !highlightTitles.has(r.title.toLowerCase()))
    .map((r) => {
      const firstLine = r.summary.split('\n')[0] ?? r.summary
      const shortSummary = firstLine.length > 80 ? firstLine.slice(0, 77) + '...' : firstLine
      return {
        title: r.title,
        type: r.releaseType,
        shortSummary,
      }
    })

  const digest: DigestContent = {
    weekRange,
    greeting: aiResult.greeting,
    introParagraph: aiResult.introParagraph,
    stats,
    highlights: aiResult.highlights,
    otherReleases,
    closingJoke: aiResult.closingJoke,
    generatedAt: new Date().toISOString(),
  }

  writeFileSync(outputPath, JSON.stringify(digest, null, 2))
  console.log(`Digest written to ${outputPath}`)
  console.log(`  Week: ${weekRange}`)
  console.log(`  Highlights: ${aiResult.highlights.length}`)
  console.log(`  Other releases: ${otherReleases.length}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
