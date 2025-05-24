
export interface FormResponse {
  id: string;
  formId: string;
  answers: {
    questionId: string;
    answer: string | string[];
  }[];
  submittedAt: Date;
}
