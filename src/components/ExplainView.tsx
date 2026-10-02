import React, { useState, useEffect } from 'react';
import { ExplainResult } from '../types';
import { 
  Lightbulb, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  ArrowRight,
  ShieldAlert,
  Target
} from 'lucide-react';

interface ExplainViewProps {
  initialTopic?: string;
  initialLevel?: string;
  onSaveHistory: (title: string, summary: string, data: any) => void;
}

export const ExplainView: React.FC<ExplainViewProps> = ({
  initialTopic = '',
  initialLevel = 'Beginner',
  onSaveHistory,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [level, setLevel] = useState(initialLevel);
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
      if (initialLevel) setLevel(initialLevel);
      handleExplain(initialTopic, initialLevel);
    }
  }, [initialTopic]);

  const handleExplain = async (t = topic, lvl = level) => {
    if (!t.trim()) return;
    setLoading(true);
    setError(null);
    stopSpeech();

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: t, level: lvl, context }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || `Error ${res.status}`);
      }

      const data: ExplainResult = await res.json();
      setResult(data);
      onSaveHistory(`Explain: ${t.slice(0, 35)}`, data.simpleDefinition.slice(0, 90) + '...', data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate explanation.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `${result.title}\n\nDefinition:\n${result.simpleDefinition}\n\nAnalogy:\n${result.analogy}\n\nWhy it matters:\n${result.whyItMatters}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeech = () => {
    if (!result) return;
    if (speaking) {
      stopSpeech();
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const textToRead = `${result.title}. ${result.simpleDefinition}. Analogy: ${result.analogy}`;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = 1.0;
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setSpeaking(true);
      }
    }
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  };

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Concept Explainer: Intuitive Clarity for Any Topic
            </h2>
            <p className="text-xs text-slate-500">
              Break down complex ideas with real-world analogies and zero cognitive overload
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExplain();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Topic or Complex Concept
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. The Pythagoras Theorem, Quantum Superposition, Recursion in Coding, Blockchain"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Audience / Depth
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Beginner / School Student">Beginner / School Student (ELI5)</option>
                <option value="High School">High School</option>
                <option value="Undergraduate College">Undergraduate College</option>
                <option value="Self-Learner / Career Switcher">Self-Learner / Career Switcher</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Optional Context (e.g. For biology class, For coding interview)
              </label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Optional background or specific angle..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Includes simple analogies & step-by-step logic</span>
            </div>

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-all shadow-sm shadow-amber-200"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Simplifying...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Explain Concept</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <p className="font-semibold">Explanation Error</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mr-2">
                Concept Breakdown
              </span>
              <h3 className="text-lg font-bold text-slate-900 inline align-middle">
                {result.title}
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleSpeech}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200"
              >
                {speaking ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{speaking ? 'Stop' : 'Listen'}</span>
              </button>

              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Simple Definition */}
          <div className="bg-gradient-to-r from-amber-50/60 to-orange-50/40 border border-amber-200/80 rounded-xl p-4 sm:p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-1.5">
              The Plain English Definition
            </h4>
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
              {result.simpleDefinition}
            </p>
          </div>

          {/* Intuitive Real-world Analogy */}
          {result.analogy && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Real-World Intuitive Analogy
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-white p-3.5 rounded-lg border border-slate-200">
                "{result.analogy}"
              </p>
            </div>
          )}

          {/* Step-by-Step Breakdown */}
          {result.steps && result.steps.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Step-by-Step Mechanics: How It Actually Works
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.steps.map((st) => (
                  <div
                    key={st.stepNumber}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {st.stepNumber}
                      </span>
                      <h5 className="text-xs font-bold text-slate-800">{st.title}</h5>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{st.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Why it Matters & Misconception */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
              <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1">
                🌟 Why This Concept Matters
              </h5>
              <p className="text-xs text-emerald-800 leading-relaxed">{result.whyItMatters}</p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
              <div className="flex items-center space-x-1.5 mb-1 text-rose-900">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <h5 className="text-xs font-bold uppercase tracking-wider">
                  Common Misconception Debunked
                </h5>
              </div>
              <p className="text-xs text-slate-700">
                <span className="line-through text-rose-700/80 mr-1">{result.commonMisconception}</span>
                <span className="font-semibold text-rose-900 block mt-1">✓ {result.clarification}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
