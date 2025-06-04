
import { supabase } from '@/integrations/supabase/client';

/**
 * Uploads a file to Supabase Storage and returns the public URL
 */
export const uploadFileToStorage = async (
  file: File,
  formId: string,
  responseId: string,
  questionId: string
): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${responseId}/${questionId}.${fileExt}`;
    const filePath = `${formId}/${fileName}`;

    console.log('Uploading file to storage:', filePath);

    const { data, error } = await supabase.storage
      .from('form-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('form-attachments')
      .getPublicUrl(filePath);

    console.log('File uploaded successfully:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadFileToStorage:', error);
    throw error;
  }
};

/**
 * Gets the public URL for a file from storage
 */
export const getFileUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from('form-attachments')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

/**
 * Deletes a file from storage
 */
export const deleteFileFromStorage = async (filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from('form-attachments')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteFileFromStorage:', error);
    return false;
  }
};

/**
 * Converts file data URL to actual file URL if it's base64
 */
export const processAttachmentUrl = (attachmentData: string, fileName?: string): string => {
  // If it's already a URL (starts with http), return as is
  if (attachmentData.startsWith('http')) {
    return attachmentData;
  }
  
  // If it's base64 data, create a blob URL
  if (attachmentData.startsWith('data:')) {
    return attachmentData;
  }
  
  // If it's just base64 without data prefix, add it
  return `data:image/jpeg;base64,${attachmentData}`;
};
