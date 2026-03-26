import type { ReleaseItem } from '@/types/release'
import uiReleasesJson from '@/releases/output/ui-releases.json'

export const releases: ReleaseItem[] = uiReleasesJson as ReleaseItem[]
