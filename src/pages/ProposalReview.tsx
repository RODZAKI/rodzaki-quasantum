import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type Proposal = {
  id: string;
  created_at: string;
  email: string;
  statement: string;
  status: string;
};

const ACCEPT_CRITERIA = [
  "Coherence — expresses a single intelligible idea or unit",
  "Relevance — belongs within the semantic scope of the field",
  "Non-Redundancy — does not trivially duplicate an existing LIVE artifact",
  "Legibility — interpretable without external reconstruction",
];

const REJECT_CRITERIA = [
  "Incoherent or unintelligible",
  "Structurally empty or meaningless",
  "Spam, abuse, or adversarial input",
  "Duplicates existing content without transformation",
];

export default function ProposalReview() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchProposals();
  }, []);

  async function fetchProposals() {
    const { data, error } = await supabase
      .from("proposals")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setProposals(data);
    setLoading(false);
  }

  async function handleAccept(proposal: Proposal) {
    setActing(proposal.id);

    const { error: updateError } = await supabase
      .from("proposals")
      .update({ status: "ACCEPTED" })
      .eq("id", proposal.id);

    if (updateError) {
      window.alert(`Update error: ${updateError.message}`);
      setActing(null);
      return;
    }

    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(proposal.email);

    if (inviteError) {
      window.alert(`Invite error: ${inviteError.message}`);
    } else {
      window.alert(`Magic link sent to ${proposal.email}`);
    }

    await fetchProposals();
    setActing(null);
  }

  async function handleReject(proposal: Proposal) {
    setActing(proposal.id);

    const { error } = await supabase
      .from("proposals")
      .update({ status: "REJECTED" })
      .eq("id", proposal.id);

    if (error) {
      window.alert(`Error: ${error.message}`);
    }

    await fetchProposals();
    setActing(null);
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-muted-foreground">Steward access required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-muted-foreground">Loading proposals…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold mb-8">Proposals</h1>

      {proposals.length === 0 && (
        <p className="text-muted-foreground">No proposals yet.</p>
      )}

      <div className="space-y-6">
        {proposals.map((p) => (
          <div key={p.id} className="rounded border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{p.email}</span>
              <span className="text-xs text-muted-foreground">{p.status}</span>
            </div>
            <p className="text-sm">{p.statement}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(p.created_at).toLocaleString()}
            </p>

            {p.status === "PENDING" && (
              <>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleAccept(p)}
                    disabled={acting === p.id}
                    className="rounded border px-3 py-1 text-sm hover:bg-muted disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(p)}
                    disabled={acting === p.id}
                    className="rounded border px-3 py-1 text-sm hover:bg-muted disabled:opacity-50"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                    className="rounded border px-3 py-1 text-sm hover:bg-muted text-muted-foreground"
                  >
                    {expanded === p.id ? "Hide criteria" : "Show criteria"}
                  </button>
                </div>

                {expanded === p.id && (
                  <div className="mt-3 grid grid-cols-2 gap-4 text-xs border-t pt-3">
                    <div>
                      <p className="font-semibold mb-1">Accept if:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        {ACCEPT_CRITERIA.map((c) => (
                          <li key={c}>· {c}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Reject if:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        {REJECT_CRITERIA.map((c) => (
                          <li key={c}>· {c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}