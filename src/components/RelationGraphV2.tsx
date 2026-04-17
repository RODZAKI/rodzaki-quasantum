import { useEffect, useRef, useCallback } from "react"
import * as d3 from "d3-force"
import { supabase } from "@/integrations/supabase/client"

type Relation = {
  from_artifact_id: string
  to_artifact_id: string
}

type Props = {
  centerId: string
  relations: Relation[]
  onSelectNode?: (nodeId: string) => void
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
const NODE_COLORS = ["#60a5fa", "#34d399", "#94a3b8"]

export default function RelationGraphV2({ centerId, relations, onSelectNode }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const groupRef = useRef<SVGGElement | null>(null)

  // Persistent simulation — never replaced after init
  const simulationRef = useRef<d3.Simulation<NodeDatum, LinkDatum> | null>(null)

  // Stable refs for node/edge data so tick handler doesn't close over stale state
  const nodeMapRef = useRef<Map<string, NodeDatum>>(new Map())
  const edgeSetRef = useRef<Set<string>>(new Set())
  const expandedRef = useRef<Set<string>>(new Set())
  const centerIdRef = useRef<string>(centerId)

  // CHANGE 3: Flag — true while existing nodes are pinned during an expansion merge
  const pinnedRef = useRef<boolean>(false)

  // DOM element maps — keyed for incremental updates
  const circleMapRef = useRef<Map<string, SVGCircleElement>>(new Map())
  const lineMapRef = useRef<Map<string, SVGLineElement>>(new Map())

  // Selected node tracking (imperative — no React state to avoid D3 re-init)
  const selectedNodeRef = useRef<string | null>(null)

  // Stable callback refs
  const expandGraphRef = useRef<(id: string) => void>(() => {})
  const onSelectNodeRef = useRef<(id: string) => void>(() => {})

  useEffect(() => {
    centerIdRef.current = centerId
  }, [centerId])

  useEffect(() => {
    onSelectNodeRef.current = onSelectNode ?? (() => {})
  }, [onSelectNode])

  // Build or retrieve a node, preserving existing position
  const getOrCreateNode = useCallback((id: string): NodeDatum => {
    if (nodeMapRef.current.has(id)) return nodeMapRef.current.get(id)!

    // Position new node near an existing neighbor if possible
    let startX = W / 2 + (Math.random() - 0.5) * 60
    let startY = H / 2 + (Math.random() - 0.5) * 60

    for (const edge of edgeSetRef.current) {
      const [from, to] = edge.split("|")
      if (from === id && nodeMapRef.current.has(to)) {
        const neighbor = nodeMapRef.current.get(to)!
        if (neighbor.x != null && neighbor.y != null) {
          startX = neighbor.x + (Math.random() - 0.5) * 30
          startY = neighbor.y + (Math.random() - 0.5) * 30
          break
        }
      }
      if (to === id && nodeMapRef.current.has(from)) {
        const neighbor = nodeMapRef.current.get(from)!
        if (neighbor.x != null && neighbor.y != null) {
          startX = neighbor.x + (Math.random() - 0.5) * 30
          startY = neighbor.y + (Math.random() - 0.5) * 30
          break
        }
      }
    }

    const node: NodeDatum = {
      id,
      group: id === centerId ? 1 : expandedRef.current.has(id) ? 2 : 3,
      x: startX,
      y: startY,
      fx: id === centerId ? W / 2 : undefined,
      fy: id === centerId ? H / 2 : undefined,
    }
    nodeMapRef.current.set(id, node)
    return node
  }, [centerId])

  // Append a circle DOM element for a node
  const appendCircle = useCallback((node: NodeDatum) => {
    if (!groupRef.current || circleMapRef.current.has(node.id)) return
    const g = groupRef.current

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
    const r = node.group === 1 ? "10" : "7"
    circle.setAttribute("r", r)
    circle.setAttribute("fill", NODE_COLORS[node.group - 1] || "#aaa")
    circle.style.cursor = "pointer"

    const title = document.createElementNS("http://www.w3.org/2000/svg", "title")
    title.textContent = node.id
    circle.appendChild(title)

    circle.addEventListener("click", (e) => {
      e.stopPropagation()
      // Deselect previous node
      const prev = selectedNodeRef.current
      if (prev && prev !== node.id) {
        const prevCircle = circleMapRef.current.get(prev)
        if (prevCircle) {
          const prevNode = nodeMapRef.current.get(prev)
          prevCircle.setAttribute("fill", NODE_COLORS[(prevNode?.group ?? 3) - 1] || "#aaa")
        }
      }
      // Select this node
      selectedNodeRef.current = node.id
      circle.setAttribute("fill", "#22c55e")
      expandGraphRef.current(node.id)
      onSelectNodeRef.current(node.id)
    })

    circle.addEventListener("dblclick", (e) => {
      e.stopPropagation()
      window.location.href = `#/thread/${node.id}`
    })

    g.appendChild(circle)
    circleMapRef.current.set(node.id, circle)
  }, [])

  // Append a line DOM element for an edge
  const appendLine = useCallback((edgeKey: string) => {
    if (!groupRef.current || lineMapRef.current.has(edgeKey)) return

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
    line.setAttribute("stroke", "#4b5563")
    line.setAttribute("stroke-width", "1")

    // Insert lines before circles so they render beneath nodes
    const firstCircle = groupRef.current.querySelector("circle")
    groupRef.current.insertBefore(line, firstCircle)
    lineMapRef.current.set(edgeKey, line)
  }, [])

  // Core incremental merge: add new nodes/edges without touching existing ones
  const mergeIncoming = useCallback((incoming: Relation[]) => {
    if (!simulationRef.current) return
    if (nodeMapRef.current.size > 150) {
      console.warn("Graph size limit reached — expansion halted")
      return
    }

    // CHANGE 3: Snapshot existing IDs before any additions
    const existingIds = new Set(nodeMapRef.current.keys())

    let changed = false

    // Register new edges first so getOrCreateNode can use them for positioning
    for (const r of incoming) {
      if (!r.from_artifact_id || !r.to_artifact_id) continue
      const key = `${r.from_artifact_id}|${r.to_artifact_id}`
      if (!edgeSetRef.current.has(key)) {
        edgeSetRef.current.add(key)
        changed = true
      }
    }

    // Create node objects for any new IDs
    for (const r of incoming) {
      if (r.from_artifact_id && !nodeMapRef.current.has(r.from_artifact_id)) {
        getOrCreateNode(r.from_artifact_id)
        changed = true
      }
      if (r.to_artifact_id && !nodeMapRef.current.has(r.to_artifact_id)) {
        getOrCreateNode(r.to_artifact_id)
        changed = true
      }
    }

    if (!changed) return

    // Append DOM elements for new nodes and edges
    for (const node of nodeMapRef.current.values()) {
      appendCircle(node)
    }
    for (const key of edgeSetRef.current) {
      appendLine(key)
    }

    // CHANGE 4: Sync color/group for all expanded nodes now that topology is applied
    // This replaces the synchronous pre-fetch color update that was in expandGraph
    for (const id of expandedRef.current) {
      const node = nodeMapRef.current.get(id)
      if (node) node.group = 2
      const circle = circleMapRef.current.get(id)
      if (circle) circle.setAttribute("fill", NODE_COLORS[1]) // green = expanded
    }

    // Rebuild link data from current edge set
    const links: LinkDatum[] = Array.from(edgeSetRef.current).map(key => {
      const [from, to] = key.split("|")
      return { source: from, target: to }
    })

    const allNodes = Array.from(nodeMapRef.current.values())

    // CHANGE 3: Pin pre-existing non-center nodes so they don't displace on merge
    const cId = centerIdRef.current
    for (const [id, node] of nodeMapRef.current) {
      if (id !== cId && existingIds.has(id)) {
        node.fx = node.x
        node.fy = node.y
      }
    }
    pinnedRef.current = true

    // Update simulation in place — do not recreate
    simulationRef.current.nodes(allNodes)
    const linkForce = simulationRef.current.force("link") as d3.ForceLink<NodeDatum, LinkDatum> | null
    linkForce?.links(links)
    // CHANGE 1: Reduced reheat alpha (was 0.3)
    simulationRef.current.alpha(0.15).restart()
    // CHANGE 2: Increase damping during merge — tick handler restores when settled
    simulationRef.current.velocityDecay(0.65)
  }, [getOrCreateNode, appendCircle, appendLine])

  const expandGraph = useCallback(async (nodeId: string) => {
    if (!nodeId || nodeId === "UNASSIGNED") return
    if (expandedRef.current.has(nodeId)) return

    // Mark as expanded before fetch so getOrCreateNode assigns group=2 for new nodes
    // CHANGE 4: No synchronous color update here — deferred to mergeIncoming
    expandedRef.current.add(nodeId)

    const { data, error } = await supabase
      .from("relations")
      .select("*")
      .or(`from_artifact_id.eq.${nodeId},to_artifact_id.eq.${nodeId}`)

    if (error) {
      console.error("Expand error:", error)
      return
    }

    mergeIncoming(data || [])
  }, [mergeIncoming])

  useEffect(() => {
    expandGraphRef.current = expandGraph
  }, [expandGraph])

  // Initialize SVG and persistent simulation once
  useEffect(() => {
    if (!svgRef.current) return

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g")
    svgRef.current.appendChild(g)
    groupRef.current = g

    const simulation = d3.forceSimulation<NodeDatum>([])
      .force("link", d3.forceLink<NodeDatum, LinkDatum>([]).id(d => d.id).distance(55))
      .force("charge", d3.forceManyBody().strength(-60))
      .force("center", d3.forceCenter(W / 2, H / 2).strength(0.15))
      .force("x", d3.forceX(W / 2).strength(0.06))
      .force("y", d3.forceY(H / 2).strength(0.06))
      .alphaDecay(0.05)
      .velocityDecay(0.5)
      .on("tick", () => {
        // CHANGE 2 + 3: Release pins and restore damping once simulation has settled
        if (pinnedRef.current && simulationRef.current && simulationRef.current.alpha() < 0.06) {
          const cId = centerIdRef.current
          for (const [id, node] of nodeMapRef.current) {
            if (id !== cId) {
              node.fx = undefined
              node.fy = undefined
            }
          }
          simulationRef.current.velocityDecay(0.5)
          pinnedRef.current = false
        }

        for (const [id, node] of nodeMapRef.current) {
          node.x = Math.max(PAD, Math.min(W - PAD, node.x ?? W / 2))
          node.y = Math.max(PAD, Math.min(H - PAD, node.y ?? H / 2))
          const circle = circleMapRef.current.get(id)
          if (circle) {
            circle.setAttribute("cx", String(node.x))
            circle.setAttribute("cy", String(node.y))
          }
        }
        for (const [key, line] of lineMapRef.current) {
          const [fromId, toId] = key.split("|")
          const from = nodeMapRef.current.get(fromId)
          const to = nodeMapRef.current.get(toId)
          if (from && to) {
            line.setAttribute("x1", String(from.x ?? 0))
            line.setAttribute("y1", String(from.y ?? 0))
            line.setAttribute("x2", String(to.x ?? 0))
            line.setAttribute("y2", String(to.y ?? 0))
          }
        }
      })

    simulationRef.current = simulation

    return () => {
      simulation.stop()
      simulationRef.current = null
    }
  }, []) // empty — runs once

  // Reset everything when centerId changes
  useEffect(() => {
    if (!centerId || !svgRef.current) return

    simulationRef.current?.stop()
    nodeMapRef.current.clear()
    edgeSetRef.current.clear()
    expandedRef.current.clear()
    circleMapRef.current.clear()
    lineMapRef.current.clear()
    pinnedRef.current = false

    if (groupRef.current) {
      groupRef.current.innerHTML = ""
    }

    const centerNode: NodeDatum = {
      id: centerId,
      group: 1,
      x: W / 2,
      y: H / 2,
      fx: W / 2,
      fy: H / 2,
    }
    nodeMapRef.current.set(centerId, centerNode)
    appendCircle(centerNode)

    if (simulationRef.current) {
      simulationRef.current.nodes([centerNode])
      const linkForce = simulationRef.current.force("link") as d3.ForceLink<NodeDatum, LinkDatum> | null
      linkForce?.links([])
      simulationRef.current.alpha(0.3).restart()
    }
  }, [centerId, appendCircle])

  // Merge incoming relations prop
  useEffect(() => {
    if (!relations || relations.length === 0) return
    mergeIncoming(relations)
  }, [relations, mergeIncoming])

  const nodeCount = nodeMapRef.current.size
  const edgeCount = edgeSetRef.current.size

  return (
    <div className="mt-6 border border-gray-700 rounded-lg overflow-hidden">
      <div className="px-3 py-2 text-xs text-gray-400 bg-gray-900 border-b border-gray-700">
        Click node to expand · Double-click to navigate · {nodeCount} nodes · {edgeCount} edges
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
