
import React from 'react';
import { QuestionWithSection } from '../form-viewer/utils/sectionUtils';
import ResponseCard from './ResponseCard';

// Interface local para as respostas
interface FormResponseData {
  id: string;
  submittedAt: Date;
  answers: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  formId: string;
  attachments: Record<string, string>;
}

interface ResponseListProps {
  responses: FormResponseData[];
  questions: QuestionWithSection[];
  onEdit: (response: FormResponseData) => void;
  onDelete: (response: FormResponseData) => void;
}

const ResponseList: React.FC<ResponseListProps> = ({
  responses,
  questions,
  onEdit,
  onDelete
}) => {
  return (
    <div className="space-y-4">
      {responses.map((response, index) => (
        <ResponseCard
          key={response.id}
          response={response}
          index={index}
          questions={questions}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default ResponseList;
