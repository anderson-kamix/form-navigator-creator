
/**
 * Utility functions for file operations in the form viewer
 */

/**
 * Converts a File object to base64 string for storage
 */
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

/**
 * Converts all file attachments to base64 format for storage
 */
export const convertAttachmentsToBase64 = async (attachments: Record<string, File | null>): Promise<Record<string, string>> => {
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
