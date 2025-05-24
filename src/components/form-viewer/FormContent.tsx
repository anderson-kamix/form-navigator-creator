
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Question } from '@/types/form';
import { QuestionRenderer } from './QuestionRenderer';
import { 
  FormNavigation, 
  SidebarNavigation, 
  ProgressBar, 
  BottomNavigation 
} from './FormNavigation';

interface FormContentProps {
  title: string;
  description?: string;
  questions: Question[];
  currentQuestion: number;
  answers: Record<string, any>;
  attachments: Record<string, File | null>;
  validationErrors: string[];
  progress: number;
  handleAnswerChange: (questionId: string, value: any) => void;
  handleFileChange: (questionId: string, file: File | null) => void;
  handleCapturePhoto: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  submitForm: () => void;
  isDesktop?: boolean;
}

export const FormContent: React.FC<FormContentProps> = ({
  title,
  description,
  questions,
  currentQuestion,
  answers,
  attachments,
  validationErrors,
  progress,
  handleAnswerChange,
  handleFileChange,
  handleCapturePhoto,
  goToQuestion,
  nextQuestion,
  prevQuestion,
  submitForm,
  isDesktop = false
}) => {
  if (questions.length === 0) {
    return (
      <Alert className="mt-4">
        <AlertTitle>Formulário vazio</AlertTitle>
        <AlertDescription>
          Este formulário não possui perguntas. Por favor, edite o formulário para adicionar questões.
        </AlertDescription>
      </Alert>
    );
  }

  const currentQ = questions[currentQuestion];
  
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">{title}</h1>
        {description && <p className="text-slate-600">{description}</p>}
      </div>

      {isDesktop ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation (Sidebar) - Desktop only */}
          <div className="lg:col-span-1">
            <div className="p-4 sticky top-8 space-y-6">
              <h3 className="font-semibold text-slate-800 mb-4">Navegação</h3>
              <SidebarNavigation 
                questions={questions}
                currentQuestion={currentQuestion}
                answers={answers}
                validationErrors={validationErrors}
                onNavigate={goToQuestion}
              />
              
              {/* Progress */}
              <div className="mt-6">
                <ProgressBar progress={progress} />
              </div>
            </div>
          </div>

          {/* Current Question */}
          <div className="lg:col-span-3">
            <div className="p-8 space-y-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-blue-600">
                    Questão {currentQuestion + 1} de {questions.length}
                  </span>
                  {currentQ?.required && (
                    <span className="text-sm text-red-600">* Obrigatório</span>
                  )}
                </div>
                <h2 className="text-2xl font-semibold text-slate-800 mb-6">
                  {currentQ?.title}
                </h2>
              </div>

              <div className="mb-8">
                {currentQ && (
                  <QuestionRenderer 
                    question={currentQ}
                    value={answers[currentQ.id]}
                    attachment={attachments[currentQ.id] || null}
                    hasError={validationErrors.includes(currentQ.id)}
                    onAnswerChange={(value) => handleAnswerChange(currentQ.id, value)}
                    onFileChange={(file) => handleFileChange(currentQ.id, file)}
                    onCapturePhoto={() => handleCapturePhoto(currentQ.id)}
                  />
                )}
              </div>

              {/* Navigation Buttons */}
              <div>
                <BottomNavigation
                  currentQuestion={currentQuestion}
                  questionsLength={questions.length}
                  onPrevious={prevQuestion}
                  onNext={nextQuestion}
                  onSubmit={submitForm}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Mobile layout
        <div className="space-y-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <ProgressBar progress={progress} />
          </div>

          {/* Current Question */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-blue-600">
                Questão {currentQuestion + 1} de {questions.length}
              </span>
              {currentQ?.required && (
                <span className="text-sm text-red-600">* Obrigatório</span>
              )}
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">
              {currentQ?.title}
            </h2>
          </div>

          <div className="mb-8">
            {currentQ && (
              <QuestionRenderer 
                question={currentQ}
                value={answers[currentQ.id]}
                attachment={attachments[currentQ.id] || null}
                hasError={validationErrors.includes(currentQ.id)}
                onAnswerChange={(value) => handleAnswerChange(currentQ.id, value)}
                onFileChange={(file) => handleFileChange(currentQ.id, file)}
                onCapturePhoto={() => handleCapturePhoto(currentQ.id)}
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div>
            <BottomNavigation
              currentQuestion={currentQuestion}
              questionsLength={questions.length}
              onPrevious={prevQuestion}
              onNext={nextQuestion}
              onSubmit={submitForm}
            />
          </div>
        </div>
      )}
    </>
  );
};
