
import { Response } from '../useFormViewerState';
import { toast } from '@/hooks/use-toast';

/**
 * Updates a response in localStorage
 */
export const updateResponse = (
  formId: string, 
  responseId: string, 
  updatedAnswers: Record<string, any>
): boolean => {
  try {
    // Get all responses for the form
    const responsesKey = `responses_${formId}`;
    const responses = JSON.parse(localStorage.getItem(responsesKey) || '[]');
    
    // Find the response to update
    const responseIndex = responses.findIndex((r: Response) => 
      new Date(r.submittedAt).getTime() === new Date(responseId).getTime()
    );
    
    if (responseIndex === -1) {
      console.error("Response not found");
      return false;
    }
    
    // Update the response
    responses[responseIndex] = {
      ...responses[responseIndex],
      answers: updatedAnswers,
    };
    
    // Save back to localStorage
    localStorage.setItem(responsesKey, JSON.stringify(responses));
    return true;
  } catch (error) {
    console.error("Error updating response:", error);
    return false;
  }
};

/**
 * Deletes a response from localStorage
 */
export const deleteResponse = (
  formId: string, 
  responseId: string
): boolean => {
  try {
    // Get all responses for the form
    const responsesKey = `responses_${formId}`;
    const responses = JSON.parse(localStorage.getItem(responsesKey) || '[]');
    
    // Filter out the response to delete
    const updatedResponses = responses.filter((r: Response) => 
      new Date(r.submittedAt).getTime() !== new Date(responseId).getTime()
    );
    
    // Save back to localStorage
    localStorage.setItem(responsesKey, JSON.stringify(updatedResponses));
    return true;
  } catch (error) {
    console.error("Error deleting response:", error);
    return false;
  }
};
