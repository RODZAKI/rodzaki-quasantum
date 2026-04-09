import { useEffect } from "react";
import { testSupabase } from "./lib/api";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Curate from "./pages/Curate";
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
import Lineage from "./pages/Lineage";
import Fields from "./pages/Fields";
import Home from "./pages/Home";
import MotifExtraction from "./pages/MotifExtraction";
import FieldDetail from "./pages/FieldDetail";
import ArtifactDetail from "./components/ArtifactDetail";
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

function AppShell() {
  return (
    <ThemeProvider defaultTheme="light">
      <TooltipProvider>
        <Sonner />
        <HashRouter>

<Routes>
            <Route path="/" element={<Index />} />
            <Route path="/home" element={<Home />} />
            <Route path="/master-index" element={<MasterIndex />} />
            <Route path="/threads" element={<Threads />} />
            <Route path="/thread/:id" element={<ThreadView />} />
            <Route path="/q/classify" element={<Classify />} />
            <Route path="/curate" element={<Curate />} />
            <Route path="/join" element={<Join />} />
            <Route path="/proposals" element={<ProposalReview />} />
            <Route path="/supersede" element={<Supersede />} />
            <Route path="/observe" element={<Observe />} />
            <Route path="/lineage" element={<Lineage />} />
            <Route path="/q/fields" element={<Fields />} />
            <Route path="/q/fields/:id" element={<FieldDetail />} />
            <Route path="/q/motifs" element={<MotifExtraction />} />
            <Route path="/q/artifact/:id" element={<ArtifactDetail />} />
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