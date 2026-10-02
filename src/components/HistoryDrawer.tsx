import React from 'react';
import { HistoryItem, ActiveTab } from '../types';
import { X, Trash2, Clock, ArrowRight, BookOpen, CheckSquare, Lightbulb, FileText, Compass } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const getIcon = (tab: ActiveTab) => {
    switch (tab) {
      case 'qna': return <BookOpen className="w-3.5 h-3.5 text-blue-600" />;
      case 'explain': return <Lightbulb className="w-3.5 h-3.5 text-amber-600" />;
      case 'quiz': return <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case 'summarize': return <FileText className="w-3.5 h-3.5 text-blue-500" />;
      case 'learning_path': return <Compass className="w-3.5 h-3.5 text-purple-600" />;
      default: return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getBadgeStyle = (tab: ActiveTab) => {
    switch (tab) {
      case 'qna': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'explain': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'quiz': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'summarize': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'learning_path': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Study History & Log</h3>
          </div>
          <div className="flex items-center space-x-2">
            {items.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-rose-600 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 font-medium inline-flex items-center space-x-1"
                title="Clear all history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No study sessions recorded yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Your asked questions, concept breakdowns, quizzes, and roadmaps will appear here.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectItem(item);
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/70 cursor-pointer transition-all space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getBadgeStyle(item.tab)}`}>
                    {getIcon(item.tab)}
                    <span>{item.tab.replace('_', ' ')}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {item.summary}
                </p>
                <div className="flex items-center text-[10px] font-semibold text-indigo-600 group-hover:underline pt-1">
                  <span>Open Session</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
