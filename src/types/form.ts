
export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'rating';
  title: string;
  options?: string[];
  required: boolean;
  allowAttachments?: boolean;
  ratingScale?: number;
  ratingIcon?: 'star' | 'heart' | 'thumbsUp' | 'circle' | 'square';
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  isOpen: boolean;
}

export interface FormCover {
  title: string;
  description?: string;
  buttonText: string;
  alignment: 'left' | 'center';
  coverImage?: string;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  cover?: FormCover;
  sections: FormSection[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  shareUrl?: string;
}
