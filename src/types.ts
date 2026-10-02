export type ActiveTab = 'qna' | 'explain' | 'quiz' | 'summarize' | 'learning_path' | 'code_guide';

export interface QAResult {
  answer: string;
  keyFacts: string[];
  followUpQuestions: string[];
}

export interface StepExplanation {
  stepNumber: number;
  title: string;
  description: string;
}

export interface ExplainResult {
  title: string;
  simpleDefinition: string;
  analogy: string;
  steps: StepExplanation[];
  whyItMatters: string;
  commonMisconception: string;
  clarification: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizResult {
  topic: string;
  summary?: string;
  questions: QuizQuestion[];
}

export interface KeyTerm {
  term: string;
  definition: string;
}

export interface SummaryResult {
  title: string;
  quickSummary: string;
  keyTakeaways: string[];
  keyTerms: KeyTerm[];
  originalWordCount?: number;
  summaryWordCount?: number;
  timeSavedMinutes?: string;
}

export interface LearningStageResource {
  name: string;
  type: string;
  recommendation: string;
}

export interface LearningStage {
  stageNumber: number;
  title: string;
  level: string;
  duration: string;
  description: string;
  topicsToMaster: string[];
  handsOnProject: {
    title: string;
    goal: string;
  };
  resources: LearningStageResource[];
}

export interface LearningPathResult {
  topic: string;
  overview: string;
  prerequisites: string[];
  stages: LearningStage[];
  bestPracticeTips: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  tab: ActiveTab;
  title: string;
  summary: string;
  data: any;
}
