
export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  title: string;
  options?: string[];
  required: boolean;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  isOpen: boolean;
}
