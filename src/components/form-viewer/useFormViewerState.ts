import { useState, useEffect, useRef } from 'react';
import { Form, Question } from '@/types/form';
import { toast } from '@/hooks/use-toast';

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
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
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
        
        // Flatten all questions from all sections into a single array
        const questions = formData.sections.flatMap(section => 
          section.questions.map(q => ({...q, sectionId: section.id}))
        );
        setAllQuestions(questions);
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

  const totalQuestions = allQuestions.length;
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

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
    setCurrentQuestion(index);
  };

  const nextQuestion = () => {
    const currentQ = allQuestions[currentQuestion];
    
    if (currentQ.required && !answers[currentQ.id]) {
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
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
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
      
      // Navigate to the first unanswered required question
      const firstErrorIndex = allQuestions.findIndex(q => errors.includes(q.id));
      if (firstErrorIndex !== -1) {
        setCurrentQuestion(firstErrorIndex);
      }
      
      return false;
    }
    
    return true;
  };

  const submitForm = () => {
    // Validate required fields
    if (totalQuestions === 0) {
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

    // Save response to localStorage
    if (form) {
      const newResponse: Response = {
        formId: form.id,
        answers: answers,
        attachments: Object.fromEntries(
          Object.entries(attachments)
            .filter(([_, file]) => file !== null)
            .map(([key, file]) => [key, (file as File).name])
        ),
        submittedAt: new Date()
      };

      // Get existing responses
      const existingResponses = JSON.parse(localStorage.getItem('form_responses') || '[]');
      localStorage.setItem('form_responses', JSON.stringify([...existingResponses, newResponse]));
    }
    
    // Show success screen
    setIsSubmitted(true);
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

  return {
    loading,
    form,
    currentQuestion,
    answers,
    attachments,
    isSubmitted,
    isEmbedded,
    allQuestions,
    showCover,
    validationErrors,
    cameraInputRef,
    progress,
    totalQuestions,
    handleAnswerChange,
    handleFileChange,
    handleCapturePhoto,
    handleCameraCapture,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    startForm,
    submitForm,
    resetForm
  };
};
