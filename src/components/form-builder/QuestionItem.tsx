
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, Paperclip, Camera } from 'lucide-react';
import { Question } from '@/types/form';
import QuestionTypeSelector from './QuestionTypeSelector';
import { Switch } from '@/components/ui/switch';

interface QuestionItemProps {
  question: Question;
  index: number;
  sectionId: string;
  onUpdate: (sectionId: string, questionId: string, updates: Partial<Question>) => void;
  onRemove: (sectionId: string, questionId: string) => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ question, index, sectionId, onUpdate, onRemove }) => {
  return (
    <Card className="p-6">
      <div className="flex items-start space-x-4">
        <div className="flex items-center mt-2">
          <GripVertical className="w-5 h-5 text-slate-400" />
          <span className="ml-2 text-sm font-medium text-slate-500">
            {index + 1}
          </span>
        </div>

        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Pergunta</Label>
              <Input
                value={question.title}
                onChange={(e) => onUpdate(sectionId, question.id, { title: e.target.value })}
                placeholder="Digite sua pergunta"
                className="mt-1"
              />
            </div>
            <QuestionTypeSelector 
              value={question.type} 
              onValueChange={(value) => 
                onUpdate(sectionId, question.id, { type: value as Question['type'] })
              } 
            />
          </div>

          {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
            <div>
              <Label>Opções (uma por linha)</Label>
              <Textarea
                value={question.options?.join('\n') || ''}
                onChange={(e) => 
                  onUpdate(sectionId, question.id, { 
                    options: e.target.value.split('\n').filter(opt => opt.trim()) 
                  })
                }
                placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                className="mt-1"
              />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id={`attachment-${question.id}`}
                checked={question.allowAttachments || false}
                onCheckedChange={(checked) => 
                  onUpdate(sectionId, question.id, { allowAttachments: checked })
                }
              />
              <Label htmlFor={`attachment-${question.id}`}>Permitir anexos</Label>
            </div>
            
            {question.allowAttachments && (
              <div className="flex items-center space-x-2 text-slate-600">
                <div className="flex items-center">
                  <Paperclip className="w-4 h-4 mr-1" />
                  <span className="text-sm">Arquivo</span>
                </div>
                <div className="flex items-center">
                  <Camera className="w-4 h-4 mr-1" />
                  <span className="text-sm">Foto</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(sectionId, question.id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default QuestionItem;
