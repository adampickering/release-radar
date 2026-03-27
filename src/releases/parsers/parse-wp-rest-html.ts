export interface WpRestProductBlock {
  productHeading: string
  bullets: string[]
}

/**
 * Strips HTML tags from a string, returning plain text.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

/**
 * Extracts a version number from a WP REST post title.
 * e.g. "Version 10.8.9 Released" -> "10.8.9"
 */
export function extractVersionFromTitle(title: string): string | undefined {
  const match = title.match(/(\d+(?:\.\d+)+)/)
  return match?.[1]
}

/**
 * Parses WP REST post HTML content into per-product blocks.
 *
 * Expects HTML structured as:
 *   <h3>Product Name</h3>
 *   <ul><li>Change description</li>...</ul>
 *
 * If there are no <h3> headings, all bullets are returned under a single
 * block with productHeading = 'General'.
 */
export function parseWpRestHtml(html: string): WpRestProductBlock[] {
  const blocks: WpRestProductBlock[] = []

  // Split by <h3> tags
  const h3Pattern = /<h3[^>]*>(.*?)<\/h3>/gi
  const headings = [...html.matchAll(h3Pattern)]

  if (headings.length === 0) {
    // No product headings — treat entire content as one block
    const bullets = extractBullets(html)
    if (bullets.length > 0) {
      blocks.push({ productHeading: 'General', bullets })
    }
    return blocks
  }

  for (let i = 0; i < headings.length; i++) {
    const productHeading = stripHtml(headings[i][1])
    const sectionStart = headings[i].index! + headings[i][0].length
    const sectionEnd = i + 1 < headings.length ? headings[i + 1].index! : html.length
    const sectionHtml = html.slice(sectionStart, sectionEnd)

    const bullets = extractBullets(sectionHtml)
    if (bullets.length > 0) {
      blocks.push({ productHeading, bullets })
    }
  }

  return blocks
}

/**
 * Extracts bullet text from <li> elements in an HTML fragment.
 */
function extractBullets(html: string): string[] {
  const liPattern = /<li[^>]*>(.*?)<\/li>/gis
  const bullets: string[] = []

  for (const match of html.matchAll(liPattern)) {
    const text = stripHtml(match[1])
    if (text) {
      bullets.push(text)
    }
  }

  return bullets
}
