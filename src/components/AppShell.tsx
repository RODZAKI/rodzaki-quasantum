import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { user } = useAuth()

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-slate-800 bg-slate-950/90 backdrop-blur flex items-center px-6 gap-6">

        {/* Left: back to threshold + wordmark */}
        <div className="flex items-center gap-4">
          <a
            href="https://rodzaki.github.io"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Threshold
          </a>
          <Link
            to="/q/fields"
            className="font-bold text-sm tracking-widest text-white hover:text-indigo-400 transition-colors"
          >
            QUASANTUM
          </Link>
        </div>

        {/* Center: primary nav */}
        <nav className="flex items-center gap-1 text-sm flex-1">
          <Link
            to="/q/fields"
            className={`px-3 py-1.5 rounded transition-colors ${
              isActive("/q/fields") ? "text-white bg-slate-800" : "text-slate-400 hover:text-white"
            }`}
          >
            Fields
          </Link>
          <Link
            to="/q/topology"
            className={`px-3 py-1.5 rounded transition-colors text-xs ${
              isActive("/q/topology") ? "text-slate-300 bg-slate-800/60" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Topology
          </Link>
          <Link
            to="/threads"
            className={`px-3 py-1.5 rounded transition-colors ${
              isActive("/threads") ? "text-white bg-slate-800" : "text-slate-400 hover:text-white"
            }`}
          >
            Threads
          </Link>
          <Link
            to="/master-index"
            className={`px-3 py-1.5 rounded transition-colors ${
              isActive("/master-index") ? "text-white bg-slate-800" : "text-slate-400 hover:text-white"
            }`}
          >
            Index
          </Link>
        </nav>

        {/* Right: identity */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {user ? (
            <span className="text-slate-300">{user.email}</span>
          ) : (
            <Link to="/join" className="hover:text-white transition-colors">Sign in</Link>
          )}
        </div>

      </header>
      <main className="pt-14">
        {children}
      </main>
    </div>
  )
}
