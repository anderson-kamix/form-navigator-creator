import { v4 as uuidv4 } from 'uuid';
import { FormResponse } from '@/types/response';
import { Form } from '@/types/form';
import { toast } from '@/hooks/use-toast';
import { convertAttachmentsToBase64 } from './fileUtils';
import { supabase } from '@/integrations/supabase/client';

/**
 * Utility functions for form response handling
 */

/**
 * Saves a form response to Supabase
 */
export const saveFormResponse = async (
  form: Form,
  answers: Record<string, any>,
  attachments: Record<string, File | null>
): Promise<string> => {
  try {
    console.log('Salvando resposta no Supabase para o formulário:', form.id);
    console.log('Respostas:', answers);

    // Get client IP and user agent
    const userAgent = navigator.userAgent;
    
    // Create main form response
    const { data: responseData, error: responseError } = await supabase
      .from('form_responses')
      .insert({
        form_id: form.id,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (responseError) {
      console.error('Erro ao criar resposta principal:', responseError);
      throw responseError;
    }

    console.log('Resposta principal criada:', responseData);

    // Save individual question answers
    const questionAnswers = [];
    for (const [questionId, answer] of Object.entries(answers)) {
      if (answer !== undefined && answer !== null && answer !== '') {
        questionAnswers.push({
          response_id: responseData.id,
          question_id: questionId,
          answer: answer
        });
      }
    }

    if (questionAnswers.length > 0) {
      const { error: answersError } = await supabase
        .from('question_answers')
        .insert(questionAnswers);

      if (answersError) {
        console.error('Erro ao salvar respostas das questões:', answersError);
        throw answersError;
      }

      console.log('Respostas das questões salvas:', questionAnswers.length);
    }

    // Save attachments if any exist
    const attachmentRecords = [];
    for (const [questionId, file] of Object.entries(attachments)) {
      if (file) {
        try {
          // Convert file to base64
          const base64Data = await convertFileToBase64(file);
          
          attachmentRecords.push({
            response_id: responseData.id,
            question_id: questionId,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            file_data: base64Data
          });
        } catch (error) {
          console.error('Erro ao processar anexo:', error);
        }
      }
    }

    if (attachmentRecords.length > 0) {
      const { error: attachmentsError } = await supabase
        .from('attachments')
        .insert(attachmentRecords);

      if (attachmentsError) {
        console.error('Erro ao salvar anexos:', attachmentsError);
        // Don't throw here, as the main response is already saved
      } else {
        console.log('Anexos salvos:', attachmentRecords.length);
      }
    }

    // Optionally create optimized table for this form (for future queries)
    try {
      await createOptimizedFormTable(form.id);
      console.log('Tabela otimizada criada/atualizada para o formulário');
    } catch (error) {
      console.log('Aviso: Não foi possível criar tabela otimizada:', error);
      // This is not critical, so we don't throw
    }

    // Also save to localStorage as backup (keeping existing functionality)
    await saveToLocalStorageBackup(form, answers, attachments, responseData.id);

    return responseData.id;
  } catch (error) {
    console.error("Erro ao salvar resposta do formulário:", error);
    
    // Fallback to localStorage if Supabase fails
    try {
      console.log('Tentando salvar no localStorage como fallback...');
      return await saveToLocalStorageBackup(form, answers, attachments);
    } catch (fallbackError) {
      console.error("Erro no fallback para localStorage:", fallbackError);
      throw new Error("Falha ao salvar resposta do formulário");
    }
  }
};

/**
 * Creates an optimized table for a specific form (for faster queries)
 */
const createOptimizedFormTable = async (formId: string): Promise<void> => {
  try {
    const { data, error } = await supabase.rpc('create_form_responses_table', {
      form_id: formId
    });

    if (error) {
      throw error;
    }

    console.log('Tabela otimizada criada:', data);
  } catch (error) {
    console.error('Erro ao criar tabela otimizada:', error);
    throw error;
  }
};

/**
 * Converts a File to base64 string
 */
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:mime/type;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Saves to localStorage as backup (keeping existing functionality)
 */
const saveToLocalStorageBackup = async (
  form: Form,
  answers: Record<string, any>,
  attachments: Record<string, File | null>,
  responseId?: string
): Promise<string> => {
  try {
    // Process attachments (convert to Base64)
    const base64Attachments = await convertAttachmentsToBase64(attachments);

    // Format answers for storage
    const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer
    }));

    // Create new response object
    const backupResponseId = responseId || uuidv4();
    const newResponse: FormResponse = {
      id: backupResponseId,
      formId: form.id,
      answers: formattedAnswers,
      submittedAt: new Date()
    };

    // Save response to localStorage
    const existingResponses = JSON.parse(localStorage.getItem(`responses_${form.id}`) || '[]');
    localStorage.setItem(`responses_${form.id}`, JSON.stringify([...existingResponses, newResponse]));

    // Save attachments separately if any exist
    if (Object.keys(base64Attachments).length > 0) {
      const existingAttachments = JSON.parse(localStorage.getItem(`attachments_${form.id}`) || '{}');
      const updatedAttachments = {
        ...existingAttachments,
        [backupResponseId]: base64Attachments
      };
      
      localStorage.setItem(`attachments_${form.id}`, JSON.stringify(updatedAttachments));
    }

    return backupResponseId;
  } catch (error) {
    console.error("Erro ao salvar backup no localStorage:", error);
    throw new Error("Falha ao salvar backup da resposta");
  }
};

/**
 * Loads form responses from Supabase
 */
export const loadFormResponses = async (formId: string) => {
  try {
    console.log('Carregando respostas do Supabase para o formulário:', formId);

    // Load main responses
    const { data: responses, error: responsesError } = await supabase
      .from('form_responses')
      .select(`
        id,
        submitted_at,
        ip_address,
        user_agent,
        question_answers (
          question_id,
          answer
        ),
        attachments (
          question_id,
          file_name,
          file_type,
          file_size,
          file_data
        )
      `)
      .eq('form_id', formId)
      .order('submitted_at', { ascending: false });

    if (responsesError) {
      console.error('Erro ao carregar respostas:', responsesError);
      throw responsesError;
    }

    console.log('Respostas carregadas do Supabase:', responses?.length || 0);
    return responses || [];
  } catch (error) {
    console.error('Erro ao carregar respostas do Supabase:', error);
    
    // Fallback to localStorage
    console.log('Tentando carregar do localStorage como fallback...');
    const localResponses = JSON.parse(localStorage.getItem(`responses_${formId}`) || '[]');
    console.log('Respostas carregadas do localStorage:', localResponses.length);
    return localResponses;
  }
};
