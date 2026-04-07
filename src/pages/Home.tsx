export default function Home() {
  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Quasantum</h1>

      <div className="space-y-2">
        <a href="#/classify" className="block underline">
          Classify
        </a>
        <a href="#/fields" className="block underline">
          Fields
        </a>
        <a href="#/artifacts/openai-0001" className="block underline">
          Sample Artifact
        </a>
      </div>
    </div>
  )
}
