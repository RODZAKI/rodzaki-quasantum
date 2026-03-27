import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Join() {
  const [email, setEmail] = useState("");
  const [statement, setStatement] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleSubmit() {
    if (!email || !statement) return;
    setStatus("submitting");

    const { error } = await supabase
      .from("proposals")
      .insert({ email, statement });

    if (error) {
      setStatus("error");
    } else {
      setStatus("done");
    }
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-lg font-medium">Proposal received.</p>
        <p className="mt-2 text-muted-foreground">The Steward will review it.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-24">
      <h1 className="text-2xl font-bold mb-2">Request to Participate</h1>
      <p className="text-muted-foreground mb-8">
        QUASANTUM is a structured reasoning substrate. Participation is stewarded, not open.
        Submit your intent below.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded border px-3 py-2 text-sm bg-background"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Statement of Intent</label>
          <textarea
            value={statement}
            onChange={e => setStatement(e.target.value)}
            rows={5}
            className="w-full rounded border px-3 py-2 text-sm bg-background"
           placeholder="What draws you to this system, and how do you intend to contribute?"
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-destructive">Something went wrong. Try again.</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={status === "submitting"}
          className="rounded border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
        >
          {status === "submitting" ? "Submitting…" : "Submit Proposal"}
        </button>
      </div>
    </div>
  );
}