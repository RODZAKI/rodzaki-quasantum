import React, { useState, useEffect } from "react";
import { useStore } from "../lib/store";
import { Search, Menu, X, ChevronDown, Globe, Layers, BookOpen, ArrowLeft, User, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { getProfile } from "@/lib/services";

const ROLE_COLORS: Record<string, string> = {
  steward: "text-indigo-400 bg-indigo-500/20",
  editor: "text-purple-400 bg-purple-500/20",
  contributor: "text-green-400 bg-green-500/20",
  observer: "text-slate-400 bg-slate-500/20",
  visitor: "text-slate-500 bg-slate-700/20",
};

export default function Header() {
  const { currentView, setView, searchQuery, setSearchQuery, selectedFieldId, fields } = useStore();
  const { user, signInWithMagicLink, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profile, setProfile] = useState<{ display_name: string; role: string } | null>(null);

  const selectedField = fields.find(f => f.id === selectedFieldId);

  useEffect(() => {
    if (user) {
      getProfile(user.id).then(p => setProfile(p as { display_name: string; role: string } | null));
    } else {
      setProfile(null);
    }
  }, [user]);

  async function handleSignIn() {
    const email = window.prompt("Enter email for magic link sign-in:");
    if (!email) return;
    const { error } = await signInWithMagicLink(email);
    if (error) { window.alert("Sign-in error: " + error); return; }
    window.alert("Magic link sent. Check your email.");
  }

  async function handleSignOut() {
    const { error } = await signOut();
    if (error) window.alert("Sign-out error: " + error);
  }

  const stewardLinks = [
    { href: "/proposals", label: "Proposals" },
    { href: "/supersede", label: "Supersede" },
    { href: "/classify", label: "Classify" },
    { href: "/curate", label: "Curate" },
  ];

  const roleColor = ROLE_COLORS[profile?.role ?? "visitor"] ?? ROLE_COLORS.visitor;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex items-center gap-4">
          <a  
              href="/"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              title="Return to Threshold"
            >
              <ArrowLeft className="w-3 h-3" />
              Threshold
            </a>
            <div className="w-px h-4 bg-slate-800" />
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView("home")}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-wider text-white">QUASANTUM</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            <button
              onClick={() => setView("home")}
              className={`px-3 py-1.5 rounded-md ${currentView === "home" ? "text-indigo-400 bg-indigo-500/10" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
            >
              <Globe className="w-4 h-4 inline mr-1.5" />
              Fields
            </button>

            {selectedField && (
              <>
                <ChevronDown className="w-3 h-3 text-slate-600 rotate-[-90deg]" />
                <button
                  onClick={() => setView("field-detail", selectedFieldId)}
                  className="px-3 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <BookOpen className="w-4 h-4 inline mr-1.5" />
                  {selectedField.name}
                </button>
              </>
            )}

            {user && (
              <>
                <div className="w-px h-4 bg-slate-700 mx-1" />
                {stewardLinks.map(link => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${location.hash.includes(link.href) ? "text-indigo-400 bg-indigo-500/10" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <div className={`${searchOpen ? "w-64" : "w-0"} overflow-hidden transition-all duration-300`}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
              />
            </div>

            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
              <Search className="w-4 h-4" />
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-800/50 text-slate-300 text-xs">
                  <User className="w-3 h-3" />
                  <span>{profile?.display_name ?? user.email}</span>
                  {profile?.role && (
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${roleColor}`}>
                      {profile.role}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs transition-colors"
              >
                <LogIn className="w-3 h-3" />
                Sign in
              </button>
            )}

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95">
          <div className="px-4 py-3 space-y-1">
            <a href="/" className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg">
              ← Threshold
            </a>
            <button onClick={() => setView("home")} className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg">
              Fields
            </button>
            {selectedField && (
              <button onClick={() => setView("field-detail", selectedFieldId)} className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg">
                {selectedField.name}
              </button>
            )}
            {user && stewardLinks.map(link => (
              <Link key={link.href} to={link.href} className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}