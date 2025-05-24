import { useState, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

/**
 * Hook for managing form answers and attachments
 */
export const useFormAnswers = () => {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [attachments, setAttachments] = useState<Record<string, File | null>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

  const resetAnswers = () => {
    setAnswers({});
    setAttachments({});
    setValidationErrors([]);
  };

  return {
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
  };
};
