/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, HistoryItem } from './types';
import { Navbar } from './components/Navbar';
import { ScenarioBar } from './components/ScenarioBar';
import { QAView } from './components/QAView';
import { ExplainView } from './components/ExplainView';
import { QuizView } from './components/QuizView';
import { SummaryView } from './components/SummaryView';
import { LearningPathView } from './components/LearningPathView';
import { CodeViewerModal } from './components/CodeViewerModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Sparkles, BookOpen, Terminal, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('qna');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  // Preload/pass-through parameters for scenarios
  const [scenarioData, setScenarioData] = useState<{
    tab: ActiveTab;
    query: string;
    extra?: any;
    timestamp: number;
  } | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('edugenie_history');
      if (saved) {
        setHistoryItems(JSON.parse(saved));
      }
    } catch (_) {}
  }, []);

  const saveHistoryItem = (title: string, summary: string, data: any) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      tab: activeTab,
      title,
      summary,
      data,
    };
    setHistoryItems((prev) => {
      const updated = [newItem, ...prev].slice(0, 30);
      try {
        localStorage.setItem('edugenie_history', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistoryItems([]);
    try {
      localStorage.removeItem('edugenie_history');
    } catch (_) {}
  };

  const handleSelectScenario = (tab: ActiveTab, query: string, extra?: any) => {
    setActiveTab(tab);
    setScenarioData({
      tab,
      query,
      extra,
      timestamp: Date.now(),
    });
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setActiveTab(item.tab);
    setScenarioData({
      tab: item.tab,
      query: item.title,
      extra: item.data,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navigation bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={historyItems.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Quick Scenario Runner Bar (always accessible at top for one-click testing) */}
        <ScenarioBar onSelectScenario={handleSelectScenario} />

        {/* Dynamic Tab Views */}
        <div className="transition-all duration-200">
          {activeTab === 'qna' && (
            <QAView
              key={scenarioData?.tab === 'qna' ? scenarioData.timestamp : 'qna_default'}
              initialQuestion={scenarioData?.tab === 'qna' ? scenarioData.query : ''}
              initialLevel={scenarioData?.tab === 'qna' ? scenarioData.extra?.level : 'School'}
              initialSubject={scenarioData?.tab === 'qna' ? scenarioData.extra?.subject : 'General Knowledge'}
              onSaveHistory={saveHistoryItem}
            />
          )}

          {activeTab === 'explain' && (
            <ExplainView
              key={scenarioData?.tab === 'explain' ? scenarioData.timestamp : 'explain_default'}
              initialTopic={scenarioData?.tab === 'explain' ? scenarioData.query : ''}
              initialLevel={scenarioData?.tab === 'explain' ? scenarioData.extra?.level : 'Beginner'}
              onSaveHistory={saveHistoryItem}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizView
              key={scenarioData?.tab === 'quiz' ? scenarioData.timestamp : 'quiz_default'}
              initialTopicOrPassage={scenarioData?.tab === 'quiz' ? scenarioData.query : ''}
              onSaveHistory={saveHistoryItem}
            />
          )}

          {activeTab === 'summarize' && (
            <SummaryView
              key={scenarioData?.tab === 'summarize' ? scenarioData.timestamp : 'summarize_default'}
              initialText={scenarioData?.tab === 'summarize' ? scenarioData.query : ''}
              onSaveHistory={saveHistoryItem}
            />
          )}

          {activeTab === 'learning_path' && (
            <LearningPathView
              key={scenarioData?.tab === 'learning_path' ? scenarioData.timestamp : 'lp_default'}
              initialTopic={scenarioData?.tab === 'learning_path' ? scenarioData.query : ''}
              initialLevel={scenarioData?.tab === 'learning_path' ? scenarioData.extra?.experienceLevel : 'Beginner'}
              initialTimeline={scenarioData?.tab === 'learning_path' ? scenarioData.extra?.targetTimeline : '6 weeks'}
              onSaveHistory={saveHistoryItem}
            />
          )}

          {activeTab === 'code_guide' && (
            <CodeViewerModal />
          )}
        </div>
      </main>

      {/* Study History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={historyItems}
        onSelectItem={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">EduGenie</span>
            <span>•</span>
            <span>Powered by Google Gemini 3.8</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('code_guide')}
              className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center space-x-1"
            >
              <Terminal className="w-3.5 h-3.5 mr-1" />
              <span>VS Code Setup & Python Source</span>
            </button>
            <span>•</span>
            <span className="text-slate-400">Lightweight & Cloud-Powered Learning</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
