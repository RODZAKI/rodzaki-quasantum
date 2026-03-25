import { supabase } from './supabase'

const CORPUS_BASE = "https://rodzaki.github.io/apex";
const ARTIFACTS_BASE = "https://rodzaki.github.io/artifacts";

export const api = {
  threads: () =>
    fetch(`${CORPUS_BASE}/canon/thread-catalog.json`).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}: Failed to load thread catalog`);
      return r.json();
    }),

  cards: () =>
    fetch(`${CORPUS_BASE}/canon/card-index.json`).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}: Failed to load card index`);
      return r.json();
    }),

  drawer: (name: string) =>
    fetch(`${CORPUS_BASE}/catalog/drawers/${name}.json`).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}: Failed to load drawer ${name}`);
      return r.json();
    }),

  corpus: () =>
    fetch(`${ARTIFACTS_BASE}/thread-corpus.json`).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}: Failed to load corpus index`);
      return r.json();
    }),

  artifact: (id: string) =>
    fetch(`${ARTIFACTS_BASE}/threads/${id}.json`).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}: Failed to load artifact ${id}`);
      return r.json();
    }),
};

export async function testSupabase() {
  const { data, error } = await supabase
    .from('threads')
    .select('*')
    .limit(1)

  console.log('SUPABASE TEST:', data, error)
}