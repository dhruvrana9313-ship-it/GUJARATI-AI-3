import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Clock, MessageSquare, Trash2, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { db } from '../lib/db';

export default function History() {
  const history = useLiveQuery(() => db.history.orderBy('timestamp').reverse().toArray());

  const clearHistory = async () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      await db.history.clear();
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent pb-20">
      <div className="px-6 pt-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--text-main)]">History</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Your past translations</p>
        </div>
        {history && history.length > 0 && (
          <button onClick={clearHistory} className="btn-icon text-red-500">
            <Trash2 className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-8">
        {!history || history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30 text-center px-8">
            <Clock className="w-20 h-20 mb-4" />
            <p className="text-lg font-medium">No history yet</p>
            <p className="text-sm">Translations you perform will appear here.</p>
          </div>
        ) : (
          history.map((item, index) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              key={item.id}
              className="card p-4 hover:border-[var(--primary)]/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-black uppercase tracking-wider opacity-60">
                    {format(item.timestamp, 'MMM d, h:mm a')}
                  </span>
                </div>
                <div className="text-[9px] bg-[var(--primary-bg)] border border-[var(--primary-border)] px-2 py-0.5 rounded text-[var(--primary)] uppercase font-black tracking-widest">
                  {item.sourceLanguage}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-xs text-[var(--text-secondary)] font-medium line-clamp-1 opacity-70 underline decoration-gray-200 underline-offset-4">{item.inputText}</p>
                <p className="text-xl font-black text-[var(--text-main)] font-display leading-tight tracking-tight">{item.translatedText}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
