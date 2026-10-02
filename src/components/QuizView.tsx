import React, { useState, useEffect } from 'react';
import { QuizResult, QuizQuestion } from '../types';
import confetti from 'canvas-confetti';
import { 
  CheckSquare, 
  Sparkles, 
  Send, 
  RotateCcw, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  HelpCircle,
  Trophy
} from 'lucide-react';

interface QuizViewProps {
  initialTopicOrPassage?: string;
  onSaveHistory: (title: string, summary: string, data: any) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  initialTopicOrPassage = '',
  onSaveHistory,
}) => {
  const [inputContent, setInputContent] = useState(initialTopicOrPassage);
  const [questionCount, setQuestionCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // User quiz interactions state:
  // Key: question index -> value: selected option string
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  // Status of the quiz: 'in_progress' | 'completed'
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (initialTopicOrPassage) {
      setInputContent(initialTopicOrPassage);
      handleGenerateQuiz(initialTopicOrPassage);
    }
  }, [initialTopicOrPassage]);

  const handleGenerateQuiz = async (content = inputContent, count = questionCount) => {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    setUserAnswers({});
    setIsCompleted(false);

    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage: content, count }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || `Error ${res.status}`);
      }

      const data: QuizResult = await res.json();
      if (!data.questions || !data.questions.length) {
        throw new Error('No quiz questions were returned by the model.');
      }

      setQuizData(data);
      onSaveHistory(
        `Quiz: ${data.topic || content.slice(0, 30)}`,
        `Generated ${data.questions.length} MCQs for assessment`,
        data
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIdx: number, selectedOption: string) => {
    // If this question was already answered, don't re-select
    if (userAnswers[qIdx] !== undefined) return;

    const newAnswers = {
      ...userAnswers,
      [qIdx]: selectedOption,
    };
    setUserAnswers(newAnswers);

    // Check if all questions are now answered
    if (quizData && Object.keys(newAnswers).length === quizData.questions.length) {
      setIsCompleted(true);
      // Calculate score
      let correctCount = 0;
      quizData.questions.forEach((q, idx) => {
        if (newAnswers[idx] === q.correctAnswer) correctCount++;
      });

      if (correctCount === quizData.questions.length) {
        // Perfect score confetti!
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (_) {}
      }
    }
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setIsCompleted(false);
  };

  // Score calculations
  const calculateScore = () => {
    if (!quizData) return { score: 0, total: 0, percentage: 0 };
    let score = 0;
    quizData.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) score++;
    });
    return {
      score,
      total: quizData.questions.length,
      percentage: Math.round((score / quizData.questions.length) * 100),
    };
  };

  const scoreData = calculateScore();

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Quiz Module: 3 MCQs with Real-Time Feedback
            </h2>
            <p className="text-xs text-slate-500">
              Tests conceptual mastery with 4 options per question and immediate corrections
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerateQuiz();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Topic or Educational Passage
            </label>
            <textarea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="e.g. Enter a concept like 'The Pythagoras Theorem' or paste a biology/history passage..."
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/50 resize-y"
              required
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <label className="text-xs font-medium text-slate-600">Question Count:</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={3}>3 MCQs (Default)</option>
                <option value={4}>4 MCQs</option>
                <option value={5}>5 MCQs</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !inputContent.trim()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm shadow-emerald-200"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Formulating Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Quiz</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <p className="font-semibold">Quiz Generation Failed</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}

      {/* Quiz Interactive Player */}
      {quizData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          {/* Header & Progress */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Interactive Assessment
                </span>
                <span className="text-xs text-slate-500">
                  {Object.keys(userAnswers).length} of {quizData.questions.length} answered
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                {quizData.topic}
              </h3>
            </div>

            <button
              onClick={handleResetQuiz}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Answers</span>
            </button>
          </div>

          {/* Completion Banner */}
          {isCompleted && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between flex-wrap gap-3 ${
                scoreData.percentage >= 70
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    scoreData.percentage >= 70
                      ? 'bg-emerald-200 text-emerald-800'
                      : 'bg-amber-200 text-amber-800'
                  }`}
                >
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">
                    Quiz Completed! Your Score: {scoreData.score} / {scoreData.total} ({scoreData.percentage}%)
                  </h4>
                  <p className="text-xs opacity-90">
                    {scoreData.percentage === 100
                      ? '🌟 Flawless understanding! You have mastered this concept.'
                      : scoreData.percentage >= 70
                      ? 'Great job! Review the explanations below for the questions you missed.'
                      : 'Good effort! Review the detailed correct explanations below to strengthen your understanding.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleResetQuiz}
                className="px-3 py-1.5 bg-white text-slate-800 font-semibold text-xs rounded-lg border border-slate-200 shadow-xs hover:bg-slate-50"
              >
                Retake Quiz
              </button>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-6">
            {quizData.questions.map((q, idx) => {
              const selectedOption = userAnswers[idx];
              const isAnswered = selectedOption !== undefined;
              const isCorrect = selectedOption === q.correctAnswer;

              return (
                <div
                  key={q.id || idx}
                  className={`p-5 rounded-xl border transition-all ${
                    !isAnswered
                      ? 'bg-slate-50/60 border-slate-200'
                      : isCorrect
                      ? 'bg-emerald-50/30 border-emerald-200/80'
                      : 'bg-rose-50/30 border-rose-200/80'
                  }`}
                >
                  {/* Question Title */}
                  <div className="flex items-start space-x-3 mb-3.5">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                      {q.question}
                    </h4>
                  </div>

                  {/* 4 Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isOptionSelected = selectedOption === opt;
                      const isOptionCorrect = opt === q.correctAnswer;

                      let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/40';

                      if (isAnswered) {
                        if (isOptionCorrect) {
                          btnStyle = 'bg-emerald-100/80 border-emerald-400 text-emerald-900 font-semibold shadow-xs';
                        } else if (isOptionSelected && !isCorrect) {
                          btnStyle = 'bg-rose-100/90 border-rose-400 text-rose-900 font-semibold shadow-xs';
                        } else {
                          btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(idx, opt)}
                          className={`flex items-start p-3 rounded-xl border text-left text-xs sm:text-sm transition-all ${btnStyle}`}
                        >
                          <span className="font-mono font-bold mr-2 text-xs opacity-75 shrink-0">
                            {letter}.
                          </span>
                          <span className="flex-1">{opt}</span>

                          {/* Status icon if answered */}
                          {isAnswered && (
                            <span className="ml-2 shrink-0">
                              {isOptionCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              )}
                              {isOptionSelected && !isCorrect && (
                                <XCircle className="w-4 h-4 text-rose-600" />
                              )}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Feedback Box (Shown right after student selects an option) */}
                  {isAnswered && (
                    <div
                      className={`mt-3.5 p-3.5 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 font-bold mb-1">
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Correct! Excellent choice.</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-rose-600" />
                            <span>
                              Incorrect. The correct answer is: <strong className="text-emerald-800 underline">{q.correctAnswer}</strong>
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-slate-700 mt-1">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
