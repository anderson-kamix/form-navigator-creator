
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Paperclip, Camera, AlertCircle } from 'lucide-react';
import { Question } from '@/types/form';
import { toast } from '@/hooks/use-toast';

interface QuestionRendererProps {
  question: Question;
  value: any;
  attachment: File | null;
  hasError: boolean;
  onAnswerChange: (value: any) => void;
  onFileChange: (file: File | null) => void;
  onCapturePhoto: () => void;
}

export const QuestionRenderer = ({
  question,
  value,
  attachment,
  hasError,
  onAnswerChange,
  onFileChange,
  onCapturePhoto
}: QuestionRendererProps) => {
  return (
    <div className="space-y-6">
      {/* Main Question Input */}
      <div className={`space-y-4 ${hasError ? 'border-l-4 border-red-500 pl-4' : ''}`}>
        {(() => {
          switch (question.type) {
            case 'text':
              return (
                <Input
                  value={value || ''}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  placeholder="Digite sua resposta"
                  className={`text-lg ${hasError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                />
              );

            case 'textarea':
              return (
                <Textarea
                  value={value || ''}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  placeholder="Digite sua resposta"
                  rows={4}
                  className={`text-lg ${hasError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                />
              );

            case 'radio':
              return (
                <RadioGroup
                  value={value || ''}
                  onValueChange={(val) => onAnswerChange(val)}
                  className={hasError ? 'border-l-2 border-red-500 pl-2' : ''}
                >
                  {question.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                      <Label htmlFor={`${question.id}-${index}`} className="text-lg">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              );

            case 'checkbox':
              return (
                <div className={`space-y-3 ${hasError ? 'border-l-2 border-red-500 pl-2' : ''}`}>
                  {question.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${question.id}-${index}`}
                        checked={value?.includes(option) || false}
                        onCheckedChange={(checked) => {
                          const currentValues = value || [];
                          if (checked) {
                            onAnswerChange([...currentValues, option]);
                          } else {
                            onAnswerChange(currentValues.filter((v: string) => v !== option));
                          }
                        }}
                      />
                      <Label htmlFor={`${question.id}-${index}`} className="text-lg">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              );

            case 'select':
              return (
                <Select 
                  value={value || ''} 
                  onValueChange={(val) => onAnswerChange(val)}
                >
                  <SelectTrigger className={`text-lg ${hasError ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    {question.options?.map((option, index) => (
                      <SelectItem key={index} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );

            default:
              return null;
          }
        })()}
      </div>

      {/* Error message for required fields */}
      {hasError && (
        <div className="text-red-500 flex items-center text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>Este campo é obrigatório</span>
        </div>
      )}

      {/* Attachment Section */}
      {question.allowAttachments && (
        <div className="border-t pt-4 mt-4">
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-medium text-slate-700">Anexos</h3>
            
            <div className="flex flex-wrap gap-4">
              <div>
                <input
                  type="file"
                  id={`file-${question.id}`}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      onFileChange(e.target.files[0]);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById(`file-${question.id}`)?.click()}
                  className="flex items-center"
                >
                  <Paperclip className="w-4 h-4 mr-2" />
                  Anexar arquivo
                </Button>
              </div>
              
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCapturePhoto}
                  className="flex items-center"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capturar foto
                </Button>
              </div>
            </div>

            {attachment && (
              <div className="mt-2">
                <div className="bg-slate-50 border rounded p-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <Paperclip className="w-4 h-4 text-slate-500 mr-2" />
                    <span className="text-sm truncate max-w-[200px]">{attachment.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFileChange(null)}
                    className="text-red-500 h-auto py-1 px-2"
                  >
                    Remover
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
