
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { QuestionWithSection } from '../form-viewer/utils/sectionUtils';
import { Response } from '../form-viewer/useFormViewerState';
import AttachmentViewer from '../form-viewer/AttachmentViewer';

interface ResponseCardProps {
  response: Response;
  index: number;
  questions: QuestionWithSection[];
  onEdit: (response: Response) => void;
  onDelete: (response: Response) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const ResponseCard: React.FC<ResponseCardProps> = ({ 
  response, 
  index, 
  questions, 
  onEdit, 
  onDelete,
  isExpanded = false,
  onToggleExpand
}) => {
  const answeredQuestions = questions.filter(question => {
    const answer = response.answers[question.id];
    const hasAttachment = response.attachments && response.attachments[question.id];
    return answer || hasAttachment;
  });

  const answerCount = answeredQuestions.length;

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg">Resposta #{index + 1}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {answerCount} {answerCount === 1 ? 'resposta' : 'respostas'}
              </Badge>
            </div>
            <CardDescription className="mt-1">
              Enviada em {new Date(response.submittedAt).toLocaleString()}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onToggleExpand}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
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
      
      {isExpanded && (
        <CardContent className="pt-0">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="responses" className="border-none">
              <AccordionTrigger className="text-sm font-medium text-gray-700 hover:no-underline py-2">
                Ver respostas detalhadas
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <div className="space-y-3 mt-2">
                  {answeredQuestions.map((question, qIndex) => {
                    const answer = response.answers[question.id];
                    const hasAttachment = response.attachments && response.attachments[question.id];
                    
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      )}
    </Card>
  );
};

export default ResponseCard;
