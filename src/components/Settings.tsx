import React from 'react';
import { Moon, Sun, Info, Trash2, Heart, ExternalLink, ShieldCheck } from 'lucide-react';
import { db } from '../lib/db';

interface SettingsProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onClearHistory: () => void;
}

export default function Settings({ isDarkMode, onToggleDarkMode, onClearHistory }: SettingsProps) {
  return (
    <div className="flex flex-col h-full bg-transparent pb-20">
      <div className="px-6 pt-10 pb-6">
        <h1 className="text-3xl font-black font-display text-[var(--text-main)] tracking-tight">Settings</h1>
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mt-1 opacity-60">System & Preferences</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-6">
        {/* Preference Section */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest px-1 text-[var(--text-secondary)] opacity-50">Preferences</p>
          <div className="card p-0 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-inner">
                  {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-sm font-black">Dark Mode</p>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] opacity-70">Ease eye strain</p>
                </div>
              </div>
              <button 
                onClick={onToggleDarkMode}
                className={`w-14 h-7 rounded-full p-1.5 transition-colors ${isDarkMode ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? 'translate-x-[26px]' : 'translate-x-0'}`} />
              </button>
            </div>

          <button 
            onClick={onClearHistory}
            className="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-red-600">Clear History</p>
                <p className="text-[10px] font-bold text-red-400">Delete all local records</p>
              </div>
            </div>
          </button>
        </div>
      </div>

        {/* About Section */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest px-1 text-[var(--text-secondary)] opacity-50">About</p>
          <div className="card p-0 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
            <div className="p-5 flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center">
                  <Info className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black">GujaratiVani Pro</p>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)]">V1.0.4 • Stable Build</p>
                </div>
            </div>
            
            <a href="#" className="p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black">Privacy Protocol</p>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)]">Zero Data Cloud Policy</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          </div>
        </div>

        <div className="py-8 flex flex-col items-center justify-center opacity-40 gap-2">
          <p className="text-xs font-semibold flex items-center gap-1 uppercase tracking-widest">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for Gujarati Speakers
          </p>
          <p className="text-[10px]">Powered by Google Gemini AI</p>
        </div>
      </div>
    </div>
  );
}
