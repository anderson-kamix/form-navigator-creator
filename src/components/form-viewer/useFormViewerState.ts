import { useState, useEffect, useRef } from 'react';
import { Form, Question, FormSection } from '@/types/form';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { FormResponse } from '@/types/response';

// Define a type that extends Question to include sectionId
interface QuestionWithSection extends Question {
  sectionId: string;
}

export interface Response {
  formId: string;
  answers: Record<string, any>;
  attachments: Record<string, string>;
  submittedAt: Date;
}

export const useFormViewerState = (formId: string | undefined) => {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [attachments, setAttachments] = useState<Record<string, File | null>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [allQuestions, setAllQuestions] = useState<QuestionWithSection[]>([]);
  const [sections, setSections] = useState<FormSection[]>([]);
  const [currentSectionQuestions, setCurrentSectionQuestions] = useState<Question[]>([]);
  const [showCover, setShowCover] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Load the form data from localStorage
  useEffect(() => {
    if (formId) {
      const existingForms = JSON.parse(localStorage.getItem('forms') || '[]');
      const formData = existingForms.find((f: Form) => f.id === formId);
      
      if (formData) {
        setForm(formData);
        
        // Set sections from form data
        setSections(formData.sections);
        
        // Initialize with first section's questions
        if (formData.sections.length > 0) {
          setCurrentSectionQuestions(formData.sections[0].questions);
        }
        
        // Flatten all questions from all sections into a single array (for reference)
        // Add the sectionId to each question
        const questions = formData.sections.flatMap(section => 
          section.questions.map(q => ({...q, sectionId: section.id}))
        );
        setAllQuestions(questions);
      }
      
      setLoading(false);
    }
  }, [formId]);

  // Update current section questions when section changes
  useEffect(() => {
    if (sections.length > 0 && currentSection < sections.length) {
      setCurrentSectionQuestions(sections[currentSection].questions);
      // Reset current question index when changing sections
      setCurrentQuestion(0);
    }
  }, [currentSection, sections]);

  // Check if the form is viewed embedded (standalone)
  useEffect(() => {
    // Check if the URL has an embedded query param or if the referrer is different
    const urlParams = new URLSearchParams(window.location.search);
    const embedded = urlParams.get('embedded') === 'true';
    setIsEmbedded(embedded || !window.location.pathname.includes('/forms/'));
  }, []);

  const totalQuestions = currentSectionQuestions.length;
  const totalSections = sections.length;
  
  // Calculate progress within the current section
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;
  
  // Calculate overall progress
  const calculateOverallProgress = (): number => {
    if (sections.length === 0) return 0;
    
    // Count total questions and answered questions
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

  const overallProgress = calculateOverallProgress();

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => {
      const updatedAnswers = { ...prev, [questionId]: value };
      // Remove from validation errors if answered
      if (value && validationErrors.includes(questionId)) {
        setValidationErrors(validationErrors.filter(id => id !== questionId));
      }
      return updatedAnswers;
    });
  };

  const handleFileChange = (questionId: string, file: File | null) => {
    setAttachments(prev => ({ ...prev, [questionId]: file }));
  };

  const handleCapturePhoto = (questionId: string) => {
    if (cameraInputRef.current) {
      // Set the current question ID as a data attribute to keep track of which question's photo we're capturing
      cameraInputRef.current.dataset.questionId = questionId;
      
      // Configure for camera capture and trigger camera
      cameraInputRef.current.accept = "image/*";
      cameraInputRef.current.capture = "environment";
      cameraInputRef.current.click();
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    const questionId = target.dataset.questionId || '';
    
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      handleFileChange(questionId, file);
      
      toast({
        title: "Foto capturada",
        description: "A foto foi anexada à sua resposta.",
      });
      
      // Reset the input value so the same file can be selected again if needed
      target.value = '';
    }
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < currentSectionQuestions.length) {
      setCurrentQuestion(index);
    }
  };

  const nextQuestion = () => {
    const currentQ = currentSectionQuestions[currentQuestion];
    
    if (currentQ?.required && !answers[currentQ.id]) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, responda esta questão antes de continuar.",
        variant: "destructive",
      });
      if (!validationErrors.includes(currentQ.id)) {
        setValidationErrors([...validationErrors, currentQ.id]);
      }
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
          const sectionQuestions = sections[i].questions;
          const unansweredRequired = sectionQuestions
            .filter(q => q.required && !answers[q.id])
            .map(q => q.id);
            
          if (unansweredRequired.length > 0) {
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

  const validateAllRequiredQuestions = (): boolean => {
    const errors: string[] = [];
    
    // Check all required questions
    allQuestions.forEach(question => {
      if (question.required && !answers[question.id]) {
        errors.push(question.id);
      }
    });
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      
      // Find the section of the first error
      const firstErrorQuestion = allQuestions.find(q => errors.includes(q.id));
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
      
      return false;
    }
    
    return true;
  };

  // Função para converter os anexos em Base64 para armazenamento
  const convertAttachmentsToBase64 = async (): Promise<Record<string, string>> => {
    const base64Attachments: Record<string, string> = {};
    
    const filePromises = Object.entries(attachments)
      .filter(([_, file]) => file !== null)
      .map(async ([questionId, file]) => {
        if (file) {
          const base64 = await convertFileToBase64(file);
          base64Attachments[questionId] = base64;
        }
      });
      
    await Promise.all(filePromises);
    return base64Attachments;
  };
  
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
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
    if (!validateAllRequiredQuestions()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, responda todas as questões obrigatórias antes de enviar o formulário.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Processar os anexos (converter para Base64)
      const base64Attachments = await convertAttachmentsToBase64();

      // Save response to localStorage
      if (form) {
        // Converter respostas para o formato esperado
        const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer
        }));

        const newResponse: FormResponse = {
          id: uuidv4(),
          formId: form.id,
          answers: formattedAnswers,
          submittedAt: new Date()
        };

        // Get existing responses
        const existingResponses = JSON.parse(localStorage.getItem(`responses_${form.id}`) || '[]');
        localStorage.setItem(`responses_${form.id}`, JSON.stringify([...existingResponses, newResponse]));

        // Salvar os anexos separadamente (um objeto por questionId)
        if (Object.keys(base64Attachments).length > 0) {
          const existingAttachments = JSON.parse(localStorage.getItem(`attachments_${form.id}`) || '{}');
          const updatedAttachments = {
            ...existingAttachments,
            [newResponse.id]: base64Attachments
          };
          
          localStorage.setItem(`attachments_${form.id}`, JSON.stringify(updatedAttachments));
        }

        toast({
          title: "Sucesso!",
          description: "Formulário enviado com sucesso.",
        });
      }
      
      // Show success screen
      setIsSubmitted(true);
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o formulário. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setAnswers({});
    setAttachments({});
    setCurrentQuestion(0);
    setCurrentSection(0);
    setIsSubmitted(false);
    setValidationErrors([]);
    setShowCover(true);
  };

  // Check if a section is complete (all required questions answered)
  const isSectionComplete = (sectionIndex: number): boolean => {
    if (sectionIndex < 0 || sectionIndex >= sections.length) return false;
    
    const sectionQuestions = sections[sectionIndex].questions;
    const requiredQuestions = sectionQuestions.filter(q => q.required);
    
    if (requiredQuestions.length === 0) return true;
    
    return requiredQuestions.every(q => !!answers[q.id]);
  };

  // Check if a section is accessible (all previous sections complete)
  const isSectionAccessible = (sectionIndex: number): boolean => {
    if (sectionIndex <= currentSection) return true;
    
    for (let i = 0; i < sectionIndex; i++) {
      if (!isSectionComplete(i)) return false;
    }
    
    return true;
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
    resetForm,
    isSectionComplete,
    isSectionAccessible
  };
};
