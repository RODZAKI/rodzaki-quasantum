import { useMemo } from "react"

type Relation = {
  target: string
  score: number
}

type Props = {
  centerId: string
  relations: Relation[]
}

export default function RelationGraph({ centerId, relations }: Props) {
  const nodes = useMemo(() => {
    const center = { id: centerId, x: 150, y: 150 }

    const orbit = relations.slice(0, 6).map((rel, i) => {
      const angle = (i / 6) * Math.PI * 2
      const radius = 100

      return {
        id: rel.target,
        x: 150 + Math.cos(angle) * radius,
        y: 150 + Math.sin(angle) * radius,
        score: rel.score,
      }
    })

    return { center, orbit }
  }, [centerId, relations])

  return (
    <div className="mt-6">
      <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-2">
        Relation Graph
      </h3>

      <svg width={300} height={300} className="bg-black/20 rounded">
        {nodes.orbit.map((node) => (
          <line
            key={node.id}
            x1={nodes.center.x}
            y1={nodes.center.y}
            x2={node.x}
            y2={node.y}
            stroke="rgba(255,255,255,0.2)"
          />
        ))}

        <circle
          cx={nodes.center.x}
          cy={nodes.center.y}
          r={10}
          fill="white"
        />

        {nodes.orbit.map((node) => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r={6 + node.score * 4}
            fill="rgba(255,255,255,0.7)"
          />
        ))}
      </svg>
    </div>
  )
}
