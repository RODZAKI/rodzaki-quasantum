import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Search, Menu, X, ChevronDown, User, Globe, Layers, BookOpen } from 'lucide-react';

export default function Header() {
  const {
    currentView,
    setView,
    searchQuery,
    setSearchQuery,
    currentUser,
    selectedFieldId,
    fields
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const selectedField = fields.find(f => f.id === selectedFieldId);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-wider text-white">QUASANTUM</span>
          </div>

          <nav className="hidden md:flex items-center gap-1 text-sm">
            <button
              onClick={() => setView('home')}
              className={`px-3 py-1.5 rounded-md ${
                currentView === 'home'
                  ? 'text-indigo-400 bg-indigo-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Globe className="w-4 h-4 inline mr-1.5" />
              Fields
            </button>

            {selectedField && (
              <>
                <ChevronDown className="w-3 h-3 text-slate-600 rotate-[-90deg]" />
                <button
                  onClick={() => setView('field-detail', selectedFieldId)}
                  className="px-3 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <BookOpen className="w-4 h-4 inline mr-1.5" />
                  {selectedField.name}
                </button>
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">

            <div className={`${searchOpen ? 'w-64' : 'w-0'} overflow-hidden transition-all duration-300`}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
              />
            </div>

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <Search className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-800/50 text-slate-300 text-xs">
              <User className="w-3 h-3" />
              {currentUser?.display_name || 'Anonymous'}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95">
          <div className="px-4 py-3 space-y-1">
            <button onClick={() => setView('home')} className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg">
              Fields
            </button>
            {selectedField && (
              <button onClick={() => setView('field-detail', selectedFieldId)} className="block w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg">
                {selectedField.name}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}