
import React from 'react';
import { Response } from '../form-viewer/useFormViewerState';
import { QuestionWithSection } from '../form-viewer/utils/sectionUtils';
import ResponseCard from './ResponseCard';

interface ResponseListProps {
  responses: Response[];
  questions: QuestionWithSection[];
  onEdit: (response: Response) => void;
  onDelete: (response: Response) => void;
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
          key={index}
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
