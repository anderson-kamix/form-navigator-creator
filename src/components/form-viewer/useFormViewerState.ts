
import { useFormViewer } from './hooks/useFormViewer';

// Re-export the hook with the original name for backward compatibility
export const useFormViewerState = useFormViewer;

// Also re-export the types for backward compatibility
export interface Response {
  formId: string;
  answers: Record<string, any>;
  attachments: Record<string, string>;
  submittedAt: Date;
}
