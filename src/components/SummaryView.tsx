import React, { useState, useEffect } from 'react';
import { SummaryResult } from '../types';
import { 
  FileText, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Clock, 
  CheckCircle,
  Hash,
  BookOpen
} from 'lucide-react';

interface SummaryViewProps {
  initialText?: string;
  onSaveHistory: (title: string, summary: string, data: any) => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  initialText = '',
  onSaveHistory,
}) => {
  const [text, setText] = useState(initialText);
  const [focus, setFocus] = useState('General Revision');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (initialText) {
      setText(initialText);
      handleSummarize(initialText);
    }
  }, [initialText]);

  const handleSummarize = async (content = text) => {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    stopSpeech();

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, focus }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || `Error ${res.status}`);
      }

      const data: SummaryResult = await res.json();
      setResult(data);
      onSaveHistory(`Summary: ${data.title || content.slice(0, 30)}`, data.quickSummary, data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const content = `${result.title}\n\nSummary:\n${result.quickSummary}\n\nKey Takeaways:\n${result.keyTakeaways.map((t) => `- ${t}`).join('\n')}`;
    navigator.clipboard.writeText(content);
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
        const utterance = new SpeechSynthesisUtterance(result.quickSummary);
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

  // Compute word counts
  const originalWords = text.trim() ? text.trim().split(/\s+/).length : 0;
  const summaryWords = result?.quickSummary ? result.quickSummary.trim().split(/\s+/).length : 0;
  const reductionPercent = originalWords > 0 && summaryWords > 0 
    ? Math.max(0, Math.round(((originalWords - summaryWords) / originalWords) * 100))
    : 0;

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Summary Module: Quick Revision from Large Passages
            </h2>
            <p className="text-xs text-slate-500">
              Retains core substance while eliminating redundancy for lightning-fast comprehension
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSummarize();
          }}
          className="space-y-4"
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Educational Text / Lecture Notes / Research Article
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {originalWords} words
              </span>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste large educational text, chapters, textbook paragraphs, or research articles..."
              rows={6}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 resize-y"
              required
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <label className="text-xs font-medium text-slate-600">Revision Focus:</label>
              <select
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="General Revision">General Revision (Balanced)</option>
                <option value="Exam Cram">High-Yield Exam Cram (Key Points)</option>
                <option value="Key Vocabulary & Concepts">Vocabulary & Definitions</option>
                <option value="Executive Briefing">Executive Briefing (Ultra-Concise)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm shadow-blue-200"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Summarizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Summarize Text</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <p className="font-semibold">Summarization Error</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Summary Result Card */}
      {result && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mr-2">
                Executive Revision
              </span>
              <h3 className="text-base font-bold text-slate-900 inline align-middle">
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

          {/* Efficiency Metric Banner */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Original Length</p>
              <p className="text-sm sm:text-base font-bold text-slate-800 font-mono">
                {originalWords} words
              </p>
            </div>
            <div className="border-x border-slate-200">
              <p className="text-[11px] text-slate-500 font-medium">Summary Length</p>
              <p className="text-sm sm:text-base font-bold text-blue-600 font-mono">
                {summaryWords} words
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Reading Reduction</p>
              <p className="text-sm sm:text-base font-bold text-emerald-600 font-mono">
                ~{reductionPercent}% faster
              </p>
            </div>
          </div>

          {/* Core Summary Paragraph */}
          <div className="p-4 sm:p-5 rounded-xl bg-blue-50/50 border border-blue-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-1.5">
              Core Summary
            </h4>
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
              {result.quickSummary}
            </p>
          </div>

          {/* Key Takeaways */}
          {result.keyTakeaways && result.keyTakeaways.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Key Revision Takeaways
                </h4>
              </div>
              <ul className="space-y-2">
                {result.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start text-xs sm:text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 mr-2.5 shrink-0" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Core Vocabulary & Terminology */}
          {result.keyTerms && result.keyTerms.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center space-x-2 mb-3">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Essential Vocabulary & Concepts
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.keyTerms.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                    <strong className="text-xs font-bold text-slate-900 block mb-0.5">
                      {t.term}
                    </strong>
                    <p className="text-xs text-slate-600">{t.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
