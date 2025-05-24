
import { v4 as uuidv4 } from 'uuid';
import { FormResponse } from '@/types/response';
import { Form } from '@/types/form';
import { toast } from '@/hooks/use-toast';
import { convertAttachmentsToBase64 } from './fileUtils';

/**
 * Utility functions for form response handling
 */

/**
 * Saves a form response to localStorage
 */
export const saveFormResponse = async (
  form: Form,
  answers: Record<string, any>,
  attachments: Record<string, File | null>
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
    const responseId = uuidv4();
    const newResponse: FormResponse = {
      id: responseId,
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
        [responseId]: base64Attachments
      };
      
      localStorage.setItem(`attachments_${form.id}`, JSON.stringify(updatedAttachments));
    }

    return responseId;
  } catch (error) {
    console.error("Error saving form response:", error);
    throw new Error("Failed to save form response");
  }
};
