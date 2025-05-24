
import { Question } from '@/types/form';
import { QuestionWithSection } from './sectionUtils';
import { toast } from '@/hooks/use-toast';

/**
 * Utility functions for form validation
 */

/**
 * Validates all required questions in the form
 * @returns true if all required questions are answered, false otherwise
 */
export const validateAllRequiredQuestions = (
  allQuestions: QuestionWithSection[], 
  answers: Record<string, any>
): { 
  isValid: boolean; 
  errors: string[]; 
  firstErrorQuestion?: QuestionWithSection;
} => {
  const errors: string[] = [];
  
  // Check all required questions
  allQuestions.forEach(question => {
    if (question.required && !answers[question.id]) {
      errors.push(question.id);
    }
  });
  
  if (errors.length > 0) {
    // Find the first error question
    const firstErrorQuestion = allQuestions.find(q => errors.includes(q.id));
    
    return { 
      isValid: false, 
      errors, 
      firstErrorQuestion 
    };
  }
  
  return { isValid: true, errors: [] };
};

/**
 * Validates a current question before moving to the next
 */
export const validateCurrentQuestion = (
  currentQuestion: Question,
  answers: Record<string, any>,
  validationErrors: string[]
): {
  isValid: boolean;
  errors: string[];
} => {
  if (currentQuestion?.required && !answers[currentQuestion.id]) {
    toast({
      title: "Campo obrigatório",
      description: "Por favor, responda esta questão antes de continuar.",
      variant: "destructive",
    });
    
    if (!validationErrors.includes(currentQuestion.id)) {
      return { 
        isValid: false, 
        errors: [...validationErrors, currentQuestion.id] 
      };
    }
    return { isValid: false, errors: validationErrors };
  }
  
  return { isValid: true, errors: validationErrors };
};
