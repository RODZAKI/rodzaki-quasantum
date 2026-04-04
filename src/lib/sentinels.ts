// ⟁ SENTINEL LOGGER — v1.0 (append-only, no enforcement) ⟁

type SentinelType =
  | "connectivity_spike"
  | "isolation"
  | "propagation_breach"
  | "false_resolution"
  | "drift";

interface SentinelEvent {
  timestamp?: string;
  type: SentinelType;
  node?: string;
  artifact?: string;
  shards_affected?: number;
  change?: string;
  component?: string;
  from?: any;
  to?: any;
  resolution_type?: string;
  note?: string;
}

const STORAGE_KEY = "quasantum_sentinel_log";

export function logSentinel(event: SentinelEvent) {
  const entry = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  console.warn("⟁ SENTINEL", entry);

  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    const log = existing ? JSON.parse(existing) : [];
    log.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch (err) {
    console.error("Sentinel log failure", err);
  }
}

export function getSentinelLog(): SentinelEvent[] {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    return existing ? JSON.parse(existing) : [];
  } catch {
    return [];
  }
}
