import { useEffect, useRef, useState, useCallback } from "react"
import * as d3 from "d3-force"
import { supabase } from "@/integrations/supabase/client"

type Relation = {
  from_artifact_id: string
  to_artifact_id: string
}

type Props = {
  centerId: string
  relations: Relation[]
}

type NodeDatum = d3.SimulationNodeDatum & {
  id: string
  group: number
  fx?: number | null
  fy?: number | null
}

type LinkDatum = {
  source: string | NodeDatum
  target: string | NodeDatum
}

const W = 800
const H = 500
const PAD = 20

export default function RelationGraph({ centerId, relations }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<NodeDatum, LinkDatum> | null>(null)
  const expandGraphRef = useRef<(id: string) => void>(() => {})

  const [graphNodes, setGraphNodes] = useState<Set<string>>(new Set())
  const [graphEdges, setGraphEdges] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const mergeRelations = useCallback((incoming: Relation[]) => {
    setGraphNodes(prev => {
      const next = new Set(prev)
      incoming.forEach(r => {
        if (r.from_artifact_id) next.add(r.from_artifact_id)
        if (r.to_artifact_id) next.add(r.to_artifact_id)
      })
      return next
    })
    setGraphEdges(prev => {
      const next = new Set(prev)
      incoming.forEach(r => {
        if (r.from_artifact_id && r.to_artifact_id) {
          next.add(`${r.from_artifact_id}|${r.to_artifact_id}`)
        }
      })
      return next
    })
  }, [])

  const expandGraph = useCallback(async (nodeId: string) => {
    if (!nodeId || nodeId === "UNASSIGNED") return
    if (expanded.has(nodeId)) return

    setExpanded(prev => new Set(prev).add(nodeId))

    const { data, error } = await supabase
      .from("relations")
      .select("*")
      .or(`from_artifact_id.eq.${nodeId},to_artifact_id.eq.${nodeId}`)

    if (error) {
      console.error("Expand error:", error)
      return
    }

    mergeRelations(data || [])
  }, [expanded, mergeRelations])

  // Keep ref current so click handlers always call the latest version
  useEffect(() => {
    expandGraphRef.current = expandGraph
  }, [expandGraph])

  // Reset graph when centerId changes
  useEffect(() => {
    if (!centerId) return
    setGraphNodes(new Set([centerId]))
    setGraphEdges(new Set())
    setExpanded(new Set())
  }, [centerId])

  // Merge incoming relations
  useEffect(() => {
    if (!relations || relations.length === 0) return
    mergeRelations(relations)
  }, [relations])

  // Rebuild simulation when graph state changes
  useEffect(() => {
    if (graphNodes.size === 0) return
    if (graphNodes.size > 150) {
      console.warn("Graph size limit reached — expansion halted")
      return
    }
    if (!svgRef.current) return

    const nodes: NodeDatum[] = Array.from(graphNodes).map(id => ({
      id,
      group: id === centerId ? 1 : expanded.has(id) ? 2 : 3,
      fx: id === centerId ? W / 2 : undefined,
      fy: id === centerId ? H / 2 : undefined,
    }))

    const links: LinkDatum[] = Array.from(graphEdges).map(key => {
      const [from, to] = key.split("|")
      return { source: from, target: to }
    })

    if (simulationRef.current) simulationRef.current.stop()

    const simulation = d3.forceSimulation<NodeDatum>(nodes)
      .force("link", d3.forceLink<NodeDatum, LinkDatum>(links).id(d => d.id).distance(55))
      .force("charge", d3.forceManyBody().strength(-60))
      .force("center", d3.forceCenter(W / 2, H / 2).strength(0.15))
      .force("x", d3.forceX(W / 2).strength(0.06))
      .force("y", d3.forceY(H / 2).strength(0.06))
      .alphaDecay(0.05)
      .velocityDecay(0.5)

    simulationRef.current = simulation

    const svg = svgRef.current
    svg.innerHTML = ""

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    svg.appendChild(g)

    const lineEls = links.map(() => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
      line.setAttribute("stroke", "#4b5563")
      line.setAttribute("stroke-width", "1")
      g.appendChild(line)
      return line
    })

    const colors = ["#60a5fa", "#34d399", "#94a3b8"]

    const circleEls = nodes.map(node => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      const r = node.group === 1 ? "10" : "7"
      circle.setAttribute("r", r)
      circle.setAttribute("fill", colors[node.group - 1] || "#aaa")
      circle.style.cursor = "pointer"

      const title = document.createElementNS("http://www.w3.org/2000/svg", "title")
      title.textContent = node.id
      circle.appendChild(title)

      circle.addEventListener("click", (e) => {
        e.stopPropagation()
        expandGraphRef.current(node.id)
      })

      circle.addEventListener("dblclick", (e) => {
        e.stopPropagation()
        window.location.href = `/quasantum/#/thread/${node.id}`
      })

      g.appendChild(circle)
      return circle
    })

    simulation.on("tick", () => {
      // Clamp nodes within bounds
      nodes.forEach(node => {
        node.x = Math.max(PAD, Math.min(W - PAD, node.x ?? W / 2))
        node.y = Math.max(PAD, Math.min(H - PAD, node.y ?? H / 2))
      })

      links.forEach((link, i) => {
        const s = link.source as NodeDatum
        const t = link.target as NodeDatum
        lineEls[i].setAttribute("x1", String(s.x ?? 0))
        lineEls[i].setAttribute("y1", String(s.y ?? 0))
        lineEls[i].setAttribute("x2", String(t.x ?? 0))
        lineEls[i].setAttribute("y2", String(t.y ?? 0))
      })
      nodes.forEach((node, i) => {
        circleEls[i].setAttribute("cx", String(node.x ?? 0))
        circleEls[i].setAttribute("cy", String(node.y ?? 0))
      })
    })

    return () => { simulation.stop() }
  }, [graphNodes, graphEdges, expanded, centerId])

  return (
    <div className="mt-6 border border-gray-700 rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-xs text-gray-400 bg-gray-900 border-b border-gray-700">
        Click node to expand · Double-click to navigate · {graphNodes.size} nodes · {graphEdges.size} edges
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        overflow="hidden"
        className="bg-gray-900 w-full"
        style={{ height: "500px" }}
      />
    </div>
  )
}
