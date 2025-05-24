
export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  title: string;
  options?: string[];
  required: boolean;
  allowAttachments?: boolean;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  isOpen: boolean;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  sections: FormSection[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  shareUrl?: string;
}

