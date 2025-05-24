import { useState, useEffect, useRef } from 'react';
import { Form, Question } from '@/types/form';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { FormResponse } from '@/types/response';

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
