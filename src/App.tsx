import { useEffect } from "react";
import { testSupabase } from "./lib/api";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useSearchParams,
} from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MasterIndex from "./pages/MasterIndex";
import Threads from "./pages/Threads";
import ThreadView from "./pages/ThreadView";
import Classify from "./pages/Classify";
import Join from "./pages/Join";
import ProposalReview from "./pages/ProposalReview";
import Supersede from "./pages/Supersede";
import Observe from "./pages/Observe";
import StewardNav from "./components/StewardNav";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

function ThreadQueryHandler() {
  const [searchParams] = useSearchParams();
  const thread = searchParams.get("thread");

  if (thread) {
    return <Navigate to={`/thread/${thread}`} replace />;
  }

  return <Index />;
}

function AuthStatusBar() {
  const { user, loading, signInWithMagicLink, signOut } = useAuth();

  async function handleSignIn() {
    const email = window.prompt("Enter email for magic link sign-in:");
    if (!email) return;

    const { error } = await signInWithMagicLink(email);

    if (error) {
      window.alert(`Sign-in error: ${error}`);
      return;
    }

    window.alert("Magic link sent. Check your email.");
  }

  async function handleSignOut() {
    const { error } = await signOut();

    if (error) {
      window.alert(`Sign-out error: ${error}`);
    }
  }

  if (loading) {
    return (
      <div className="w-full border-b px-4 py-2 text-sm text-muted-foreground">
        Auth: loading…
      </div>
    );
  }

  return (
    <div className="w-full border-b px-4 py-2 text-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div>
          {user ? (
            <>
              Signed in as <span className="font-medium">{user.email}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Not signed in</span>
          )}
        </div>

        <div>
          {user ? (
            <button
              onClick={handleSignOut}
              className="rounded border px-3 py-1 hover:bg-muted"
            >
              Sign out
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              className="rounded border px-3 py-1 hover:bg-muted"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AppShell() {
  return (
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>

        <Sonner />

        <HashRouter>
          <AuthStatusBar />
          <StewardNav />
          <Routes>
            <Route path="/" element={<ThreadQueryHandler />} />
            <Route path="/master-index" element={<MasterIndex />} />
            <Route path="/threads" element={<Threads />} />
            <Route path="/thread/:id" element={<ThreadView />} />
            <Route path="/classify" element={<Classify />} />
            <Route path="/join" element={<Join />} />
            <Route path="/proposals" element={<ProposalReview />} />
            <Route path="/supersede" element={<Supersede />} />
            <Route path="/observe" element={<Observe />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default function App() {
  useEffect(() => {
    testSupabase();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </QueryClientProvider>
  );
}