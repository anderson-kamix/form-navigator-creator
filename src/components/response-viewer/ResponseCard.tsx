
import React from 'react';
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2 } from 'lucide-react';
import { QuestionWithSection } from '../form-viewer/utils/sectionUtils';
import { Response } from '../form-viewer/useFormViewerState';
import AttachmentViewer from '../form-viewer/AttachmentViewer';

interface ResponseCardProps {
  response: Response;
  index: number;
  questions: QuestionWithSection[];
  onEdit: (response: Response) => void;
  onDelete: (response: Response) => void;
}

const ResponseCard: React.FC<ResponseCardProps> = ({ 
  response, 
  index, 
  questions, 
  onEdit, 
  onDelete 
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg">Resposta #{index + 1}</CardTitle>
            <CardDescription>
              Enviada em {new Date(response.submittedAt).toLocaleString()}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(response)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(response)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {questions.map((question, qIndex) => {
            const answer = response.answers[question.id];
            const hasAttachment = response.attachments && response.attachments[question.id];
            
            if (!answer && !hasAttachment) return null;
            
            return (
              <div key={qIndex} className="grid grid-cols-3 gap-4 py-2 border-b last:border-b-0">
                <div className="font-medium text-slate-700">
                  {question.title}
                  {question.required && (
                    <Badge variant="outline" className="ml-2 text-xs">Obrigatório</Badge>
                  )}
                </div>
                <div className="col-span-2 space-y-2">
                  {answer && (
                    <div>
                      {Array.isArray(answer) ? (
                        <ul className="list-disc pl-5">
                          {answer.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <span>{answer}</span>
                      )}
                    </div>
                  )}
                  
                  {hasAttachment && (
                    <AttachmentViewer
                      attachments={response.attachments}
                      questionId={question.id}
                      questionTitle={question.title}
                      showDownload={true}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResponseCard;
