
import { ConditionalLogic, Question, FormSection } from '@/types/form';

export const evaluateCondition = (
  condition: ConditionalLogic['condition'],
  questionValue: any,
  conditionValue: string | number
): boolean => {
  const value = questionValue?.toString().toLowerCase() || '';
  const targetValue = conditionValue.toString().toLowerCase();

  switch (condition) {
    case 'equals':
      return value === targetValue;
    case 'not_equals':
      return value !== targetValue;
    case 'contains':
      return value.includes(targetValue);
    case 'not_contains':
      return !value.includes(targetValue);
    case 'greater_than':
      const numValue = parseFloat(value);
      const numTarget = parseFloat(targetValue);
      return !isNaN(numValue) && !isNaN(numTarget) && numValue > numTarget;
    case 'less_than':
      const numValue2 = parseFloat(value);
      const numTarget2 = parseFloat(targetValue);
      return !isNaN(numValue2) && !isNaN(numTarget2) && numValue2 < numTarget2;
    default:
      return false;
  }
};

export const shouldShowQuestion = (
  question: Question,
  answers: Record<string, any>
): boolean => {
  if (!question.conditionalLogic || question.conditionalLogic.length === 0) {
    return true;
  }

  // Evaluate each logic rule
  for (const logic of question.conditionalLogic) {
    const sourceAnswer = answers[logic.sourceQuestionId];
    const conditionMet = evaluateCondition(logic.condition, sourceAnswer, logic.value);

    if (logic.action === 'show' && conditionMet) {
      return true;
    }
    if (logic.action === 'hide' && conditionMet) {
      return false;
    }
  }

  // Default behavior: show the question if no hide conditions are met
  return true;
};

export const shouldShowSection = (
  section: FormSection,
  answers: Record<string, any>
): boolean => {
  if (!section.conditionalLogic || section.conditionalLogic.length === 0) {
    return true;
  }

  // Evaluate each logic rule for the section
  for (const logic of section.conditionalLogic) {
    const sourceAnswer = answers[logic.sourceQuestionId];
    const conditionMet = evaluateCondition(logic.condition, sourceAnswer, logic.value);

    if (logic.action === 'show' && conditionMet) {
      return true;
    }
    if (logic.action === 'hide' && conditionMet) {
      return false;
    }
  }

  return true;
};

export const isQuestionRequired = (
  question: Question,
  answers: Record<string, any>
): boolean => {
  // Check base required status
  if (question.required) {
    return true;
  }

  // Check conditional logic for required action
  if (!question.conditionalLogic) {
    return false;
  }

  for (const logic of question.conditionalLogic) {
    if (logic.action === 'required') {
      const sourceAnswer = answers[logic.sourceQuestionId];
      const conditionMet = evaluateCondition(logic.condition, sourceAnswer, logic.value);
      
      if (conditionMet) {
        return true;
      }
    }
  }

  return false;
};

export const getFilteredQuestions = (
  questions: Question[],
  answers: Record<string, any>
): Question[] => {
  return questions.filter(question => shouldShowQuestion(question, answers));
};

export const getFilteredSections = (
  sections: FormSection[],
  answers: Record<string, any>
): FormSection[] => {
  return sections.filter(section => shouldShowSection(section, answers));
};
