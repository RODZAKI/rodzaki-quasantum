export default function Home() {
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Quasantum</h1>

      <div className="space-y-2">
        <a href="#/q/classify" className="block underline">
          Classify
        </a>
        <a href="#/q/fields" className="block underline">
          Fields
        </a>
        <span className="block text-gray-500">Sample Artifact</span>
      </div>
    </div>
  )
}
