
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useFormViewerState } from './form-viewer/useFormViewerState';
import { CoverScreen } from './form-viewer/CoverScreen';
import { FormContent } from './form-viewer/FormContent';
import { SectionNavigation } from './form-viewer/SectionNavigation';
import { SuccessScreen } from './form-viewer/SuccessScreen';

const FormViewer = () => {
  const { id } = useParams();
  const {
    loading,
    form,
    currentQuestion,
    currentSection,
    answers,
    attachments,
    isSubmitted,
    isEmbedded,
    currentSectionQuestions,
    sections,
    showCover,
    validationErrors,
    cameraInputRef,
    progress,
    overallProgress,
    totalQuestions,
    totalSections,
    handleAnswerChange,
    handleFileChange,
    handleCapturePhoto,
    handleCameraCapture,
    goToQuestion,
    goToSection,
    nextQuestion,
    prevQuestion,
    startForm,
    submitForm,
    resetForm,
    isSectionComplete,
    isSectionAccessible
  } = useFormViewerState(id);

  // Shared camera input that will be used across all questions
  const sharedCameraInput = (
    <input
      type="file"
      accept="image/*"
      capture="environment"
      ref={cameraInputRef}
      className="hidden"
      onChange={handleCameraCapture}
    />
  );

  // Loading state
  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-6 w-full max-w-md mb-8" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  // If form not found
  if (!form) {
    return (
      <div className="p-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTitle>Formulário não encontrado</AlertTitle>
          <AlertDescription>
            O formulário que você está tentando acessar não existe ou foi removido.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Current section
  const currentSectionData = sections[currentSection];

  // Embedded version with simplified layout
  if (isEmbedded) {
    if (isSubmitted) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-16 px-4 sm:px-6 lg:px-8 flex justify-center">
          <Card className="w-full max-w-2xl shadow-lg border-0">
            <div className="p-8">
              <SuccessScreen onReset={resetForm} />
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-16 px-4 sm:px-6 lg:px-8 flex justify-center">
        <Card className="w-full max-w-2xl shadow-lg border-0">
          <div className="p-8">
            {sharedCameraInput}
            {showCover ? (
              <CoverScreen 
                title={form.title}
                description={form.description}
                cover={form.cover}
                onStart={startForm}
              />
            ) : (
              <>
                {/* Section Navigation */}
                {sections.length > 1 && (
                  <SectionNavigation 
                    sections={sections}
                    currentSection={currentSection}
                    isSectionComplete={isSectionComplete}
                    isSectionAccessible={isSectionAccessible}
                    onSelectSection={goToSection}
                    overallProgress={overallProgress}
                  />
                )}
                
                {/* Form Content */}
                <FormContent 
                  title={currentSectionData?.title || form.title}
                  description={currentSectionData?.description || form.description}
                  questions={currentSectionQuestions}
                  currentQuestion={currentQuestion}
                  answers={answers}
                  attachments={attachments}
                  validationErrors={validationErrors}
                  progress={progress}
                  handleAnswerChange={handleAnswerChange}
                  handleFileChange={handleFileChange}
                  handleCapturePhoto={handleCapturePhoto}
                  goToQuestion={goToQuestion}
                  nextQuestion={nextQuestion}
                  prevQuestion={prevQuestion}
                  submitForm={submitForm}
                  isLastSection={currentSection === totalSections - 1}
                />
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Regular view inside the application
  return (
    <div className="p-8">
      {isSubmitted ? (
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <SuccessScreen onReset={resetForm} />
          </Card>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {sharedCameraInput}
          {showCover ? (
            <Card className="p-8">
              <CoverScreen 
                title={form.title}
                description={form.description}
                cover={form.cover}
                onStart={startForm}
              />
            </Card>
          ) : (
            <Card className="p-8">
              {/* Section Navigation */}
              {sections.length > 1 && (
                <SectionNavigation 
                  sections={sections}
                  currentSection={currentSection}
                  isSectionComplete={isSectionComplete}
                  isSectionAccessible={isSectionAccessible}
                  onSelectSection={goToSection}
                  overallProgress={overallProgress}
                />
              )}
              
              {/* Form Content */}
              <FormContent 
                title={currentSectionData?.title || form.title}
                description={currentSectionData?.description || form.description}
                questions={currentSectionQuestions}
                currentQuestion={currentQuestion}
                answers={answers}
                attachments={attachments}
                validationErrors={validationErrors}
                progress={progress}
                handleAnswerChange={handleAnswerChange}
                handleFileChange={handleFileChange}
                handleCapturePhoto={handleCapturePhoto}
                goToQuestion={goToQuestion}
                nextQuestion={nextQuestion}
                prevQuestion={prevQuestion}
                submitForm={submitForm}
                isDesktop={true}
                isLastSection={currentSection === totalSections - 1}
              />
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default FormViewer;
