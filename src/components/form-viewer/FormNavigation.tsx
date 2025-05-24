
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { Question } from '@/types/form';

interface FormNavigationProps {
  questions: Question[];
  currentQuestion: number;
  answers: Record<string, any>;
  validationErrors: string[];
  onNavigate: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  progress: number;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  questions,
  currentQuestion,
  answers,
  validationErrors,
  onNavigate,
  onPrevious,
  onNext,
  onSubmit,
  progress
}) => {
  // Desktop/Sidebar navigation
  const renderSidebarNavigation = () => (
    <div className="space-y-2">
      {questions.map((question, index) => {
        const hasError = validationErrors.includes(question.id);
        const isAnswered = !!answers[question.id];
        
        return (
          <button
            key={question.id}
            onClick={() => onNavigate(index)}
            className={`w-full text-left p-3 rounded-lg transition-all ${
              hasError
                ? 'bg-red-100 text-red-700 border-2 border-red-300'
                : index === currentQuestion
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                : isAnswered
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Questão {index + 1}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </span>
              {hasError ? (
                <AlertCircle className="w-4 h-4 text-red-600" />
              ) : isAnswered ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : null}
            </div>
            <div className="text-xs mt-1 truncate">
              {question.title}
            </div>
          </button>
        );
      })}
    </div>
  );

  // Progress bar
  const renderProgressBar = () => (
    <div className="w-full">
      <div className="flex justify-between text-sm text-slate-600 mb-2">
        <span>Progresso</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );

  // Bottom navigation buttons
  const renderBottomNavigation = () => (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentQuestion === 0}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Anterior
      </Button>

      {currentQuestion === questions.length - 1 ? (
        <Button onClick={onSubmit} className="bg-green-600 hover:bg-green-700">
          <Check className="w-4 h-4 mr-2" />
          Finalizar
        </Button>
      ) : (
        <Button onClick={onNext}>
          Próxima
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );

  return {
    renderSidebarNavigation,
    renderProgressBar,
    renderBottomNavigation
  };
};
