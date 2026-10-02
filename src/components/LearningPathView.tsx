import React, { useState, useEffect } from 'react';
import { LearningPathResult } from '../types';
import { 
  Compass, 
  Sparkles, 
  Send, 
  Calendar, 
  CheckSquare, 
  ExternalLink, 
  FolderGit2, 
  Lightbulb, 
  BookMarked,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';

interface LearningPathViewProps {
  initialTopic?: string;
  initialLevel?: string;
  initialTimeline?: string;
  onSaveHistory: (title: string, summary: string, data: any) => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  initialTopic = '',
  initialLevel = 'Beginner',
  initialTimeline = '6 weeks',
  onSaveHistory,
}) => {
  const [topic, setTopic] = useState(initialTopic);
  const [level, setLevel] = useState(initialLevel);
  const [timeline, setTimeline] = useState(initialTimeline);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LearningPathResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Student progress tracker: Set of checked topic keys (e.g., "stage_1_topic_2")
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialTopic) {
      setTopic(initialTopic);
      if (initialLevel) setLevel(initialLevel);
      if (initialTimeline) setTimeline(initialTimeline);
      handleGeneratePath(initialTopic, initialLevel, initialTimeline);
    }
  }, [initialTopic]);

  const handleGeneratePath = async (
    t = topic,
    lvl = level,
    time = timeline
  ) => {
    if (!t.trim()) return;
    setLoading(true);
    setError(null);
    setCompletedTopics({});

    try {
      const res = await fetch('/api/learn/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: t,
          experienceLevel: lvl,
          targetTimeline: time,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || `Error ${res.status}`);
      }

      const data: LearningPathResult = await res.json();
      setResult(data);
      onSaveHistory(`Roadmap: ${data.topic || t}`, data.overview.slice(0, 90) + '...', data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate learning path.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTopicCheck = (key: string) => {
    setCompletedTopics((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCopy = () => {
    if (!result) return;
    let text = `# Learning Path: ${result.topic}\n\n${result.overview}\n\n`;
    result.stages.forEach((st) => {
      text += `## Stage ${st.stageNumber}: ${st.title} (${st.level} - ${st.duration})\n`;
      text += `${st.description}\n`;
      text += `Topics:\n${st.topicsToMaster.map((t) => `- [ ] ${t}`).join('\n')}\n`;
      text += `Project: ${st.handsOnProject.title} - ${st.handsOnProject.goal}\n\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Progress computation
  const totalSubtopics = result?.stages.reduce((acc, st) => acc + st.topicsToMaster.length, 0) || 0;
  const completedCount = Object.values(completedTopics).filter(Boolean).length;
  const progressPercent = totalSubtopics > 0 ? Math.round((completedCount / totalSubtopics) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Learning Path Module: Structured Curriculum & Roadmaps
            </h2>
            <p className="text-xs text-slate-500">
              Beginner to advanced milestones with timelines, projects, and vetted resources
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGeneratePath();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subject, Skill, or Language to Master
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. SQL (Structured Query Language), Machine Learning, Calculus, Python, React"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Current Experience Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Complete Beginner (Zero Background)">Complete Beginner (Zero Background)</option>
                <option value="Beginner (Knows Basics)">Beginner (Knows Basics)</option>
                <option value="Intermediate">Intermediate (Looking to Master)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Timeline Goal
              </label>
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="2-4 weeks (Intensive Bootcamp)">2-4 weeks (Intensive)</option>
                <option value="6 weeks (Balanced)">6 weeks (Balanced Pace)</option>
                <option value="8-12 weeks (Deep Mastery)">8-12 weeks (Comprehensive)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Includes projects & curated free resources</span>
            </div>

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-all shadow-sm shadow-purple-200"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Drafting Curriculum...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>Generate Learning Path</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <p className="font-semibold">Roadmap Generation Error</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Result Roadmap */}
      {result && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 mr-2">
                Structured Roadmap
              </span>
              <h3 className="text-base font-bold text-slate-900 inline align-middle">
                {result.topic}
              </h3>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Roadmap'}</span>
            </button>
          </div>

          {/* Overview & Prerequisites */}
          <div className="p-4 sm:p-5 rounded-xl bg-purple-50/40 border border-purple-200/80 space-y-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-1">
                Overview & Learning Objective
              </h4>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">
                {result.overview}
              </p>
            </div>

            {result.prerequisites && result.prerequisites.length > 0 && (
              <div className="pt-2 border-t border-purple-200/60 flex items-center space-x-2 flex-wrap text-xs text-purple-950">
                <span className="font-bold">Prerequisites:</span>
                {result.prerequisites.map((req, idx) => (
                  <span key={idx} className="bg-white px-2 py-0.5 rounded border border-purple-200">
                    {req}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Progress Bar */}
          {totalSubtopics > 0 && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">Your Checklist Progress</span>
                <span className="font-bold text-purple-700 font-mono">
                  {completedCount} of {totalSubtopics} topics checked ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Stages Timeline */}
          <div className="space-y-6 pt-2">
            {result.stages.map((st, sIdx) => {
              const stageBadgeColor =
                st.level.toLowerCase().includes('beginner')
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : st.level.toLowerCase().includes('intermediate')
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-purple-50 text-purple-700 border-purple-200';

              return (
                <div
                  key={st.stageNumber || sIdx}
                  className="relative pl-6 sm:pl-8 border-l-2 border-purple-200 hover:border-purple-400 transition-colors pb-6 last:pb-0"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                    {st.stageNumber}
                  </div>

                  <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${stageBadgeColor}`}>
                            {st.level}
                          </span>
                          <span className="inline-flex items-center text-xs text-slate-500 font-medium">
                            <Calendar className="w-3 h-3 mr-1" /> {st.duration}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                          Stage {st.stageNumber}: {st.title}
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {st.description}
                    </p>

                    {/* Topics to master checklist */}
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Topics to Master (Click to mark completed):
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {st.topicsToMaster.map((topicItem, tIdx) => {
                          const topicKey = `s_${sIdx}_t_${tIdx}`;
                          const isDone = !!completedTopics[topicKey];

                          return (
                            <button
                              key={tIdx}
                              type="button"
                              onClick={() => toggleTopicCheck(topicKey)}
                              className={`flex items-start p-2.5 rounded-lg border text-left text-xs transition-all ${
                                isDone
                                  ? 'bg-purple-100/60 border-purple-300 text-purple-950 font-medium'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded mt-0.5 mr-2 flex items-center justify-center shrink-0 border ${
                                  isDone
                                    ? 'bg-purple-600 border-purple-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                              </span>
                              <span className={isDone ? 'line-through opacity-80' : ''}>
                                {topicItem}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hands-on Project */}
                    {st.handsOnProject && (
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                          <FolderGit2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                            Hands-On Stage Project
                          </div>
                          <h6 className="text-xs font-bold text-slate-900 mt-0.5">
                            {st.handsOnProject.title}
                          </h6>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {st.handsOnProject.goal}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Curated Resources */}
                    {st.resources && st.resources.length > 0 && (
                      <div>
                        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Recommended Learning Resources
                        </h5>
                        <div className="space-y-1.5">
                          {st.resources.map((res, rIdx) => (
                            <div
                              key={rIdx}
                              className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-800 mr-2">{res.name}</span>
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                  {res.type}
                                </span>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {res.recommendation}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Best Practice Tips */}
          {result.bestPracticeTips && result.bestPracticeTips.length > 0 && (
            <div className="pt-2">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center space-x-2 mb-2 text-amber-900">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Study Strategy & Best Practice Tips
                  </h4>
                </div>
                <ul className="space-y-1.5 text-xs text-amber-950">
                  {result.bestPracticeTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 mr-2 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
