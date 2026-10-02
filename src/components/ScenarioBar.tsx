import React from 'react';
import { ActiveTab } from '../types';
import { Compass, Sparkles, HelpCircle, CheckSquare, Lightbulb, FileText } from 'lucide-react';

interface ScenarioBarProps {
  onSelectScenario: (tab: ActiveTab, query: string, extra?: any) => void;
}

export const ScenarioBar: React.FC<ScenarioBarProps> = ({ onSelectScenario }) => {
  return (
    <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-violet-50 border border-indigo-100/80 rounded-2xl p-4 shadow-xs">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
            Official Project Scenarios (Click to test instantly):
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">Auto-populates input & triggers live AI</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Scenario 1 */}
        <button
          onClick={() =>
            onSelectScenario('qna', 'Which is the largest ocean?', {
              level: 'School',
              subject: 'Geography & Earth Science',
            })
          }
          className="group flex items-start p-3 bg-white hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition-all shadow-xs"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mr-2.5 group-hover:scale-105 transition-transform">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Scenario 1
              </span>
              <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600">
                Ask a Question
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-mono">
              "Which is the largest ocean?"
            </p>
          </div>
        </button>

        {/* Scenario 2 */}
        <button
          onClick={() =>
            onSelectScenario(
              'quiz',
              'The Pythagoras Theorem states that in a right-angled triangle, the square of the hypotenuse (the side opposite the right angle) is equal to the sum of the squares of the other two sides: a² + b² = c².'
            )
          }
          className="group flex items-start p-3 bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all shadow-xs"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mr-2.5 group-hover:scale-105 transition-transform">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Scenario 2
              </span>
              <span className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700">
                Generate 3 MCQs
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-mono">
              "The Pythagoras Theorem"
            </p>
          </div>
        </button>

        {/* Scenario 3 */}
        <button
          onClick={() =>
            onSelectScenario('learning_path', 'SQL (Structured Query Language)', {
              experienceLevel: 'Beginner',
              targetTimeline: '6 weeks',
            })
          }
          className="group flex items-start p-3 bg-white hover:bg-purple-50/70 border border-slate-200 hover:border-purple-300 rounded-xl text-left transition-all shadow-xs"
        >
          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mr-2.5 group-hover:scale-105 transition-transform">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                Scenario 3
              </span>
              <span className="text-xs font-semibold text-slate-900 group-hover:text-purple-700">
                Learning Path Roadmap
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-mono">
              "SQL Structured Curriculum"
            </p>
          </div>
        </button>
      </div>

      {/* Additional Quick Concept & Summary Presets */}
      <div className="flex items-center space-x-2 mt-3 pt-2.5 border-t border-indigo-100/60 text-xs text-slate-500 flex-wrap gap-y-1">
        <span className="text-[11px] font-medium text-slate-400">More Tryouts:</span>
        <button
          onClick={() =>
            onSelectScenario('explain', 'Quantum Superposition', {
              level: 'High School',
            })
          }
          className="inline-flex items-center space-x-1 text-slate-600 hover:text-indigo-600 font-medium bg-white px-2 py-0.5 rounded border border-slate-200 hover:border-indigo-200 text-[11px]"
        >
          <Lightbulb className="w-3 h-3 text-amber-500" />
          <span>Explain Quantum Superposition</span>
        </button>
        <button
          onClick={() =>
            onSelectScenario(
              'summarize',
              `Photosynthesis is a biological process used by plants, algae, and certain bacteria to convert light energy into chemical energy. This chemical energy is stored in carbohydrate molecules, such as sugars, synthesized from carbon dioxide and water. In most cases, oxygen is released as a waste product. Photosynthesis is largely responsible for producing and maintaining the oxygen content of the Earth's atmosphere, and supplies most of the biological energy necessary for complex life on Earth.`
            )
          }
          className="inline-flex items-center space-x-1 text-slate-600 hover:text-indigo-600 font-medium bg-white px-2 py-0.5 rounded border border-slate-200 hover:border-indigo-200 text-[11px]"
        >
          <FileText className="w-3 h-3 text-blue-500" />
          <span>Summarize Photosynthesis Passage</span>
        </button>
      </div>
    </div>
  );
};
