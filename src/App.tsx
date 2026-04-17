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
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";
import MasterIndex from "./pages/MasterIndex";
import Threads from "./pages/Threads";
import ThreadView from "./pages/ThreadView";
import Join from "./pages/Join";
import ProposalReview from "./pages/ProposalReview";
import Observe from "./pages/Observe";
import Lineage from "./pages/Lineage";
import Fields from "./pages/Fields";
import Home from "./pages/Home";
import FieldDetail from "./pages/FieldDetail";
import Topology from "./pages/Topology";
import ArtifactDetail from "./components/ArtifactDetail";
import GraphValidate from "./pages/GraphValidate";
import AppShell from "./components/AppShell";
import { AuthProvider } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

function ThreadQueryHandler() {
  const [searchParams] = useSearchParams();
  const thread = searchParams.get("thread");

  if (thread) {
    return <Navigate to={`/thread/${thread}`} replace />;
  }

  return <Index />;
}

function AppRouter() {
  return (
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Sonner />
        <HashRouter>

<Routes>
            <Route path="/" element={<AppLayout />} />
            <Route path="/home" element={<Home />} />
            <Route path="/master-index" element={<MasterIndex />} />
            <Route path="/threads" element={<Threads />} />
            <Route path="/thread/:id" element={<ThreadView />} />
            <Route path="/join" element={<Join />} />
            <Route path="/proposals" element={<ProposalReview />} />
            <Route path="/observe" element={<Observe />} />
            <Route path="/lineage" element={<Lineage />} />
            <Route path="/q/fields" element={<AppShell><Fields /></AppShell>} />
            <Route path="/q/fields/:id" element={<AppShell><FieldDetail /></AppShell>} />
            <Route path="/q/topology" element={<AppShell><Topology /></AppShell>} />
            <Route path="/q/artifact/:id" element={<AppShell><ArtifactDetail /></AppShell>} />
            <Route path="/debug/graph-v2/:artifactId" element={<GraphValidate />} />
            <Route path="/zz-graph-validate/:artifactId" element={<GraphValidate />} />
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
        <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  );
}