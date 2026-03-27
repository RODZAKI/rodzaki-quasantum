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

export default function ProposalReview() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

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
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}