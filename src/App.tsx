/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Clock, Settings as SettingsIcon, Languages, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Home from './components/Home';
import History from './components/History';
import Settings from './components/Settings';
import { db } from './lib/db';
import { cn } from './lib/utils';

function AppContent() {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  if (showSplash) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[var(--background)] font-display">
        <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
           className="relative flex flex-col items-center"
        >
          <div className="w-28 h-28 bg-[var(--primary)] rounded-3xl flex items-center justify-center shadow-[0_20px_50px_rgba(26,115,232,0.3)]">
            <Languages className="w-14 h-14 text-white" />
          </div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-col items-center"
          >
             <h2 className="text-4xl font-black text-[var(--text-main)] tracking-tighter">GujaratiVani</h2>
             <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--primary)] mt-1">Premium Edition</span>
          </motion.div>
        </motion.div>
        <div className="absolute bottom-16 flex flex-col items-center gap-4">
          <Loader2 className="w-5 h-5 text-[var(--primary)] animate-spin" />
          <p className="text-[10px] uppercase font-bold tracking-[0.1em] text-[var(--text-secondary)] opacity-50 underline decoration-[var(--primary)] decoration-2 underline-offset-4">Building Translation Engine</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: '/', label: 'Translate', icon: HomeIcon },
    { id: '/history', label: 'History', icon: Clock },
    { id: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[var(--background)] shadow-2xl relative overflow-hidden font-sans">
      
      {/* Dynamic Screen Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-full absolute inset-0"
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={
                <Settings 
                  isDarkMode={isDarkMode} 
                  onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                  onClearHistory={async () => {
                    if (confirm("Clear all history?")) {
                      await db.history.clear();
                    }
                  }}
                />
              } />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-[#1a1a1b] border-t border-gray-100 dark:border-gray-800 px-8 py-4 pb-8 flex justify-between items-center z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-[40px]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.id}
              className={({ isActive }) => cn(
                "flex flex-col items-center gap-2 transition-all relative px-4",
                isActive ? "text-[var(--primary)] scale-110" : "text-gray-400 dark:text-gray-600 grayscale opacity-60"
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    "w-12 h-12 flex items-center justify-center rounded-2xl transition-all",
                    isActive ? "bg-[var(--primary-bg)] shadow-inner" : "bg-transparent"
                  )}>
                    <Icon className={cn("w-6 h-6", isActive && "stroke-[3px]")} />
                  </div>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest leading-none",
                    isActive ? "opacity-100" : "opacity-0"
                  )}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Background Decorative Blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)] opacity-[0.03] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500 opacity-[0.03] blur-[100px] pointer-events-none" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

