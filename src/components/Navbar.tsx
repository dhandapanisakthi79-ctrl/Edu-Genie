import React from 'react';
import { ActiveTab } from '../types';
import { 
  Sparkles, 
  HelpCircle, 
  Lightbulb, 
  CheckSquare, 
  FileText, 
  Compass, 
  Code2, 
  History,
  BookOpen
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  historyCount: number;
  onOpenHistory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  historyCount,
  onOpenHistory,
}) => {
  const tabs = [
    { id: 'qna' as ActiveTab, label: 'Q&A Hub', icon: HelpCircle, description: 'Ask questions, get smart answers' },
    { id: 'explain' as ActiveTab, label: 'Concept Explainer', icon: Lightbulb, description: 'Simplified learning & analogies' },
    { id: 'quiz' as ActiveTab, label: 'Quiz Generator', icon: CheckSquare, description: 'Interactive 3 MCQs with feedback' },
    { id: 'summarize' as ActiveTab, label: 'Summarizer', icon: FileText, description: 'Concise revision summaries' },
    { id: 'learning_path' as ActiveTab, label: 'Learning Path', icon: Compass, description: 'Curriculum & roadmap' },
    { id: 'code_guide' as ActiveTab, label: 'Python & VS Code', icon: Code2, description: 'Backend source & setup guide' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('qna')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">EduGenie</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-500" /> Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">AI-Powered Educational Learning Assistant</p>
            </div>
          </div>

          {/* Right Action: History button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenHistory}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
              title="View your study history"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>Study History</span>
              {historyCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
