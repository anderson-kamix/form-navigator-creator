
import { FormSection, Question } from '@/types/form';

/**
 * Utility functions for section management in the form viewer
 */

export interface QuestionWithSection extends Question {
  sectionId: string;
}

/**
 * Flattens all questions from all sections into a single array with section IDs
 */
export const flattenSectionQuestions = (sections: FormSection[]): QuestionWithSection[] => {
  return sections.flatMap(section => 
    section.questions.map(q => ({...q, sectionId: section.id}))
  );
};

/**
 * Checks if a section is complete (all required questions answered)
 */
export const isSectionComplete = (
  sectionIndex: number, 
  sections: FormSection[], 
  answers: Record<string, any>
): boolean => {
  if (sectionIndex < 0 || sectionIndex >= sections.length) return false;
  
  const sectionQuestions = sections[sectionIndex].questions;
  const requiredQuestions = sectionQuestions.filter(q => q.required);
  
  if (requiredQuestions.length === 0) return true;
  
  return requiredQuestions.every(q => !!answers[q.id]);
};

/**
 * Checks if a section is accessible (all previous sections complete)
 */
export const isSectionAccessible = (
  sectionIndex: number, 
  currentSection: number, 
  sections: FormSection[], 
  answers: Record<string, any>
): boolean => {
  if (sectionIndex <= currentSection) return true;
  
  for (let i = 0; i < sectionIndex; i++) {
    if (!isSectionComplete(i, sections, answers)) return false;
  }
  
  return true;
};

/**
 * Calculate overall progress across all sections
 */
export const calculateOverallProgress = (
  currentSection: number, 
  currentQuestion: number, 
  sections: FormSection[], 
  allQuestions: QuestionWithSection[]
): number => {
  if (sections.length === 0) return 0;
  
  // Count total questions
  const totalQuestionsAll = allQuestions.length;
  if (totalQuestionsAll === 0) return 0;
  
  // Calculate completed sections (all prior sections)
  const completedSectionsQuestions = sections
    .slice(0, currentSection)
    .flatMap(s => s.questions)
    .length;
  
  // Add current section progress
  const currentSectionProgress = 
    sections[currentSection]?.questions.length > 0 
      ? (currentQuestion / sections[currentSection].questions.length) * sections[currentSection].questions.length
      : 0;
  
  return ((completedSectionsQuestions + currentSectionProgress) / totalQuestionsAll) * 100;
};
