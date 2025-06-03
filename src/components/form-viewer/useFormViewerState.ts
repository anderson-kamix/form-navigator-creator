
import { useFormViewer } from './hooks/useFormViewer';

// Re-export the hook with the original name for backward compatibility
export const useFormViewerState = useFormViewer;

// Updated Response interface to match what's expected
export interface Response {
  id: string;
  formId: string;
  answers: Record<string, any>;
  attachments: Record<string, string>;
  submittedAt: Date;
}
