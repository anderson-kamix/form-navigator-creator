
export interface ConditionalLogic {
  id: string;
  sourceQuestionId: string;
  condition: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: string | number;
  action: 'show' | 'hide' | 'jump_to' | 'required';
  targetQuestionId?: string;
  targetSectionId?: string;
}

export interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'rating' | 'score';
  title: string;
  options?: string[];
  required: boolean;
  allowAttachments?: boolean;
  ratingScale?: number;
  ratingIcon?: 'star' | 'heart' | 'thumbsUp' | 'circle' | 'square';
  scoreConfig?: {
    leftLabel: string;
    rightLabel: string;
    maxScore: number;
    style: 'numbered' | 'circles' | 'squares' | 'pills';
    colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'gray';
  };
  conditionalLogic?: ConditionalLogic[];
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  isOpen: boolean;
  conditionalLogic?: ConditionalLogic[];
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
