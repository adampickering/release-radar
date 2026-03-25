import { releases } from '@/data/releases'
import { brands } from '@/data/brands'

console.log(`Loaded ${releases.length} releases across ${brands.length} brands`)

function App() {
  return (
    <div className="min-h-screen bg-am-light font-sans">
      <h1 className="text-am-navy text-2xl font-bold p-8">Release Radar</h1>
    </div>
  )
}

export default App
