import { useState, useEffect } from 'react';
import { Form } from '@/types/form';
import { toast } from '@/hooks/use-toast';
import { useFormNavigation } from './useFormNavigation';
import { useFormAnswers } from './useFormAnswers';
import { 
  QuestionWithSection, 
  flattenSectionQuestions, 
  isSectionComplete, 
  isSectionAccessible,
  calculateOverallProgress 
} from '../utils/sectionUtils';
import { validateAllRequiredQuestions, validateCurrentQuestion } from '../utils/validationUtils';
import { saveFormResponse } from '../utils/responseUtils';

export const useFormViewer = (formId: string | undefined) => {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [allQuestions, setAllQuestions] = useState<QuestionWithSection[]>([]);
  const [sections, setSections] = useState([]); 

  // Use custom hooks
  const {
    answers,
    attachments,
    validationErrors,
    cameraInputRef,
    handleAnswerChange,
    handleFileChange,
    handleCapturePhoto,
    handleCameraCapture,
    setValidationErrors,
    resetAnswers
  } = useFormAnswers();

  const {
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
  } = useFormNavigation(sections, answers);

  // Calculate overall progress
  const overallProgress = calculateOverallProgress(
    currentSection, 
    currentQuestion, 
    sections, 
    allQuestions
  );

  // Load the form data from localStorage
  useEffect(() => {
    if (formId) {
      const existingForms = JSON.parse(localStorage.getItem('forms') || '[]');
      const formData = existingForms.find((f: Form) => f.id === formId);
      
      if (formData) {
        setForm(formData);
        
        // Set sections from form data
        setSections(formData.sections);
        
        // Flatten all questions from all sections into a single array (for reference)
        // Add the sectionId to each question
        setAllQuestions(flattenSectionQuestions(formData.sections));
      }
      
      setLoading(false);
    }
  }, [formId]);

  // Check if the form is viewed embedded (standalone)
  useEffect(() => {
    // Check if the URL has an embedded query param or if the referrer is different
    const urlParams = new URLSearchParams(window.location.search);
    const embedded = urlParams.get('embedded') === 'true';
    setIsEmbedded(embedded || !window.location.pathname.includes('/forms/'));
  }, []);

  const nextQuestion = () => {
    const currentQ = currentSectionQuestions[currentQuestion];
    
    // Validate current question
    const validation = validateCurrentQuestion(currentQ, answers, validationErrors);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    
    if (currentQuestion < totalQuestions - 1) {
      // Move to the next question in the current section
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // At the end of section, check if all required questions are answered
      const unansweredRequired = currentSectionQuestions
        .filter(q => q.required && !answers[q.id])
        .map(q => q.id);
      
      if (unansweredRequired.length > 0) {
        setValidationErrors([...validationErrors, ...unansweredRequired]);
        
        // Navigate to the first unanswered required question
        const firstErrorIndex = currentSectionQuestions.findIndex(q => unansweredRequired.includes(q.id));
        if (firstErrorIndex !== -1) {
          setCurrentQuestion(firstErrorIndex);
          
          toast({
            title: "Campos obrigatórios",
            description: "Por favor, preencha todos os campos obrigatórios antes de avançar.",
            variant: "destructive",
          });
        }
        return;
      }
      
      // If we're at the last section, keep the current question as is
      // Otherwise move to the next section
      if (currentSection < totalSections - 1) {
        setCurrentSection(currentSection + 1);
      }
    }
  };

  const submitForm = async () => {
    // Validate required fields
    if (allQuestions.length === 0) {
      toast({
        title: "Erro",
        description: "Este formulário não contém perguntas.",
        variant: "destructive"
      });
      return;
    }

    // Validate all required questions before submission
    const validation = validateAllRequiredQuestions(allQuestions, answers);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      
      // Find the section of the first error
      const firstErrorQuestion = validation.firstErrorQuestion;
      if (firstErrorQuestion) {
        const sectionIndex = sections.findIndex(s => s.id === firstErrorQuestion.sectionId);
        if (sectionIndex !== -1) {
          setCurrentSection(sectionIndex);
          
          // Find the question index within the section
          const questionIndex = sections[sectionIndex].questions.findIndex(q => q.id === firstErrorQuestion.id);
          if (questionIndex !== -1) {
            setCurrentQuestion(questionIndex);
          }
        }
      }
      
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, responda todas as questões obrigatórias antes de enviar o formulário.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (form) {
        // Save response to localStorage
        await saveFormResponse(form, answers, attachments);
        
        toast({
          title: "Sucesso!",
          description: "Formulário enviado com sucesso.",
        });
        
        // Show success screen
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o formulário. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Function to fully reset the form state
  const resetFormState = () => {
    resetAnswers();
    resetForm();
    setIsSubmitted(false);
  };

  // Check section status functions that use the utility functions
  const checkSectionComplete = (sectionIndex: number): boolean => {
    return isSectionComplete(sectionIndex, sections, answers);
  };
  
  const checkSectionAccessible = (sectionIndex: number): boolean => {
    return isSectionAccessible(sectionIndex, currentSection, sections, answers);
  };

  return {
    loading,
    form,
    currentQuestion,
    currentSection,
    answers,
    attachments,
    isSubmitted,
    isEmbedded,
    allQuestions,
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
    resetForm: resetFormState,
    isSectionComplete: checkSectionComplete,
    isSectionAccessible: checkSectionAccessible
  };
};
