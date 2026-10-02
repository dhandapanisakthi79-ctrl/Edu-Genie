import React, { useState } from 'react';
import { QAResult } from '../types';
import { 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Lightbulb, 
  ArrowRight,
  BookOpen,
  GraduationCap
} from 'lucide-react';

interface QAViewProps {
  initialQuestion?: string;
  initialLevel?: string;
  initialSubject?: string;
  onSaveHistory: (title: string, summary: string, data: any) => void;
}

export const QAView: React.FC<QAViewProps> = ({
  initialQuestion = '',
  initialLevel = 'School',
  initialSubject = 'General Knowledge',
  onSaveHistory,
}) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [level, setLevel] = useState(initialLevel);
  const [subject, setSubject] = useState(initialSubject);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QAResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Update when prop changes from scenario selection
  React.useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion);
      if (initialLevel) setLevel(initialLevel);
      if (initialSubject) setSubject(initialSubject);
      handleAskQuestion(initialQuestion, initialLevel, initialSubject);
    }
  }, [initialQuestion]);

  const handleAskQuestion = async (
    q = question,
    lvl = level,
    subj = subject
  ) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    stopSpeech();

    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, level: lvl, subject: subj }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || `Error ${res.status}`);
      }

      const data: QAResult = await res.json();
      setResult(data);
      onSaveHistory(`Q: ${q.slice(0, 45)}...`, data.answer.slice(0, 100) + '...', data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to get answer. Please check your network and API configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `${result.answer}\n\nKey Facts:\n${result.keyFacts.map((f) => `- ${f}`).join('\n')}`;
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
        const utterance = new SpeechSynthesisUtterance(result.answer);
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
      {/* Input Box Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Q&A Module: Ask Any Academic Question
            </h2>
            <p className="text-xs text-slate-500">
              Powered by Google Gemini for smart, concise, and context-aware responses
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Your Question
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Which is the largest ocean? Why does ice float? How do plants produce oxygen?"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 resize-y"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Academic Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Elementary / Middle School">School (Elementary / Middle)</option>
                <option value="High School">High School</option>
                <option value="Undergraduate College">Undergraduate College</option>
                <option value="General / Professional">General Learner</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject Area
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Geography & Earth Science">Geography & Earth Science</option>
                <option value="Mathematics & Geometry">Mathematics & Geometry</option>
                <option value="Physics & Chemistry">Physics & Chemistry</option>
                <option value="Biology & Life Science">Biology & Life Science</option>
                <option value="Computer Science & SQL">Computer Science & Data</option>
                <option value="History & Social Studies">History & Social Studies</option>
                <option value="General Knowledge">General Knowledge</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Concise, syllabus-aligned answers</span>
            </div>

            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm shadow-indigo-200"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Ask EduGenie</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <p className="font-semibold">Unable to process question</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          {/* Header Controls */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Answer
              </span>
              <span className="text-xs text-slate-500">{level} • {subject}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleSpeech}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                title={speaking ? 'Stop speech' : 'Listen to answer'}
              >
                {speaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-red-500" />
                    <span>Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Read Aloud</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Primary Answer Content */}
          <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {result.answer}
          </div>

          {/* Key Facts Section */}
          {result.keyFacts && result.keyFacts.length > 0 && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4.5">
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Key Fast Facts & Takeaways
                </h4>
              </div>
              <ul className="space-y-2">
                {result.keyFacts.map((fact, idx) => (
                  <li key={idx} className="flex items-start text-xs sm:text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2 mr-2.5 shrink-0" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Follow-up Exploration Questions */}
          {result.followUpQuestions && result.followUpQuestions.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center space-x-2 mb-2.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Explore Further (Click to Ask)
                </h4>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                {result.followUpQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuestion(q);
                      handleAskQuestion(q);
                    }}
                    className="group inline-flex items-center justify-between sm:justify-start space-x-2 px-3 py-2 rounded-lg bg-indigo-50/60 hover:bg-indigo-100/80 border border-indigo-200/70 text-xs font-medium text-indigo-900 transition-colors text-left"
                  >
                    <span>{q}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
