
import { useState, useEffect } from 'react';
import { FormSection } from '@/types/form';
import { toast } from '@/hooks/use-toast';
import { isSectionComplete } from '../utils/sectionUtils';

/**
 * Hook for managing form navigation
 */
export const useFormNavigation = (sections: FormSection[], answers: Record<string, any>) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentSectionQuestions, setCurrentSectionQuestions] = useState<any[]>([]);
  const [showCover, setShowCover] = useState(true);

  // Update current section questions when section changes
  useEffect(() => {
    if (sections.length > 0 && currentSection < sections.length) {
      setCurrentSectionQuestions(sections[currentSection].questions);
      // Reset current question index when changing sections
      setCurrentQuestion(0);
    }
  }, [currentSection, sections]);

  const totalQuestions = currentSectionQuestions.length;
  const totalSections = sections.length;
  
  // Calculate progress within the current section
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < currentSectionQuestions.length) {
      setCurrentQuestion(index);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      // Move to the previous question in the current section
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      // Move to the previous section, and set the question to the last in that section
      setCurrentSection(currentSection - 1);
      // This will trigger the useEffect that sets currentSectionQuestions
      // Then we'll set current question to the last one in the section
      const prevSectionQuestions = sections[currentSection - 1].questions;
      setCurrentQuestion(prevSectionQuestions.length - 1);
    }
  };

  const goToSection = (sectionIndex: number) => {
    if (sectionIndex >= 0 && sectionIndex < sections.length) {
      // Check if we can move forward to this section
      // Can only move forward if all previous sections' required questions are answered
      if (sectionIndex > currentSection) {
        // Check all previous sections
        for (let i = 0; i <= currentSection; i++) {
          const unansweredRequired = !isSectionComplete(i, sections, answers);
            
          if (unansweredRequired) {
            // Cannot move forward, there are unanswered required questions
            toast({
              title: "Complete a seção atual",
              description: "Por favor, complete todas as perguntas obrigatórias antes de avançar para a próxima seção.",
              variant: "destructive",
            });
            return;
          }
        }
      }
      
      // We can move to the requested section
      setCurrentSection(sectionIndex);
    }
  };

  const startForm = () => {
    setShowCover(false);
  };

  const resetForm = () => {
    setCurrentQuestion(0);
    setCurrentSection(0);
    setShowCover(true);
  };

  return {
    currentQuestion,
    currentSection,
    currentSectionQuestions,
    showCover,
    progress,
    totalQuestions,
    totalSections,
    goToQuestion,
    goToSection,
    prevQuestion,
    startForm,
    resetForm,
    setCurrentQuestion,
    setCurrentSection
  };
};
