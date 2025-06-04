
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Updates a response in Supabase
 */
export const updateResponse = async (
  formId: string, 
  responseId: string, 
  updatedAnswers: Record<string, any>,
  updatedAttachments?: Record<string, string>
): Promise<boolean> => {
  try {
    console.log('Updating response in Supabase:', responseId, updatedAnswers);

    // First, delete existing question answers for this response
    const { error: deleteError } = await supabase
      .from('question_answers')
      .delete()
      .eq('response_id', responseId);

    if (deleteError) {
      console.error('Error deleting existing answers:', deleteError);
      throw deleteError;
    }

    // Insert new question answers
    const questionAnswers = [];
    for (const [questionId, answer] of Object.entries(updatedAnswers)) {
      if (answer !== undefined && answer !== null && answer !== '') {
        questionAnswers.push({
          response_id: responseId,
          question_id: questionId,
          answer: answer
        });
      }
    }

    if (questionAnswers.length > 0) {
      const { error: insertError } = await supabase
        .from('question_answers')
        .insert(questionAnswers);

      if (insertError) {
        console.error('Error inserting updated answers:', insertError);
        throw insertError;
      }
    }

    // Update attachments if provided
    if (updatedAttachments) {
      console.log('Updating attachments:', updatedAttachments);
      
      // Delete existing attachments for this response
      const { error: deleteAttachmentsError } = await supabase
        .from('attachments')
        .delete()
        .eq('response_id', responseId);

      if (deleteAttachmentsError) {
        console.error('Error deleting existing attachments:', deleteAttachmentsError);
        // Don't throw here, continue with the update
      }

      // Insert new attachments
      const attachmentRecords = [];
      for (const [questionId, fileUrl] of Object.entries(updatedAttachments)) {
        if (fileUrl) {
          attachmentRecords.push({
            response_id: responseId,
            question_id: questionId,
            file_name: 'attachment',
            file_type: 'image/jpeg', // Default type
            file_size: 0,
            file_data: fileUrl
          });
        }
      }

      if (attachmentRecords.length > 0) {
        const { error: insertAttachmentsError } = await supabase
          .from('attachments')
          .insert(attachmentRecords);

        if (insertAttachmentsError) {
          console.error('Error inserting updated attachments:', insertAttachmentsError);
          // Don't throw here, the main response is already updated
        }
      }
    }

    console.log('Response updated successfully in Supabase');
    return true;
  } catch (error) {
    console.error("Error updating response in Supabase:", error);
    
    // Fallback to localStorage if Supabase fails
    try {
      console.log('Trying localStorage fallback...');
      return updateResponseLocalStorage(formId, responseId, updatedAnswers);
    } catch (fallbackError) {
      console.error("Error in localStorage fallback:", fallbackError);
      return false;
    }
  }
};

/**
 * Deletes a response from Supabase
 */
export const deleteResponse = async (
  formId: string, 
  responseId: string
): Promise<boolean> => {
  try {
    console.log('Deleting response from Supabase:', responseId);

    // Delete attachments first (due to foreign key constraints)
    const { error: attachmentsError } = await supabase
      .from('attachments')
      .delete()
      .eq('response_id', responseId);

    if (attachmentsError) {
      console.error('Error deleting attachments:', attachmentsError);
      // Continue anyway, as attachments might not exist
    }

    // Delete question answers
    const { error: answersError } = await supabase
      .from('question_answers')
      .delete()
      .eq('response_id', responseId);

    if (answersError) {
      console.error('Error deleting question answers:', answersError);
      throw answersError;
    }

    // Delete the main response
    const { error: responseError } = await supabase
      .from('form_responses')
      .delete()
      .eq('id', responseId);

    if (responseError) {
      console.error('Error deleting form response:', responseError);
      throw responseError;
    }

    console.log('Response deleted successfully from Supabase');
    return true;
  } catch (error) {
    console.error("Error deleting response from Supabase:", error);
    
    // Fallback to localStorage if Supabase fails
    try {
      console.log('Trying localStorage fallback...');
      return deleteResponseLocalStorage(formId, responseId);
    } catch (fallbackError) {
      console.error("Error in localStorage fallback:", fallbackError);
      return false;
    }
  }
};

/**
 * LocalStorage fallback functions
 */
const updateResponseLocalStorage = (
  formId: string, 
  responseId: string, 
  updatedAnswers: Record<string, any>
): boolean => {
  try {
    // Get all responses for the form
    const responsesKey = `responses_${formId}`;
    const responses = JSON.parse(localStorage.getItem(responsesKey) || '[]');
    
    // Find the response to update
    const responseIndex = responses.findIndex((r: any) => r.id === responseId);
    
    if (responseIndex === -1) {
      console.error("Response not found in localStorage");
      return false;
    }
    
    console.log("Updating response in localStorage at index", responseIndex, "with answers:", updatedAnswers);
    
    // Update the response
    responses[responseIndex] = {
      ...responses[responseIndex],
      answers: updatedAnswers,
    };
    
    // Save back to localStorage
    localStorage.setItem(responsesKey, JSON.stringify(responses));
    return true;
  } catch (error) {
    console.error("Error updating response in localStorage:", error);
    return false;
  }
};

const deleteResponseLocalStorage = (
  formId: string, 
  responseId: string
): boolean => {
  try {
    // Get all responses for the form
    const responsesKey = `responses_${formId}`;
    const responses = JSON.parse(localStorage.getItem(responsesKey) || '[]');
    
    // Filter out the response to delete
    const updatedResponses = responses.filter((r: any) => r.id !== responseId);
    
    // Save back to localStorage
    localStorage.setItem(responsesKey, JSON.stringify(updatedResponses));
    return true;
  } catch (error) {
    console.error("Error deleting response from localStorage:", error);
    return false;
  }
};
