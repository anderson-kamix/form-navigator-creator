
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Paperclip, Camera, AlertCircle, X, Star, Heart, ThumbsUp, Circle, Square } from 'lucide-react';
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
  // Create a URL for the attachment preview
  const previewUrl = attachment ? URL.createObjectURL(attachment) : null;
  
  // Clean up the object URL when the component unmounts or when the attachment changes
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const renderRadioOptions = () => {
    // Verificar se temos mais de 4 opções para decidir qual layout usar
    const useToggleGroup = question.options && question.options.length <= 4;

    if (useToggleGroup) {
      return (
        <ToggleGroup
          type="single"
          value={value || ''}
          onValueChange={(val) => {
            if (val) onAnswerChange(val);
          }}
          className="flex flex-col gap-2 w-full"
        >
          {question.options?.map((option, index) => (
            <ToggleGroupItem
              key={index}
              value={option}
              className="w-full justify-start rounded-lg bg-white border px-4 py-2 data-[state=on]:bg-primary data-[state=on]:text-white"
            >
              {option}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      );
    }

    return (
      <RadioGroup
        value={value || ''}
        onValueChange={(val) => onAnswerChange(val)}
        className={`space-y-3 ${hasError ? 'border-l-2 border-red-500 pl-2' : ''}`}
      >
        {question.options?.map((option, index) => (
          <RadioGroupItem
            key={index}
            value={option}
            card
            className="cursor-pointer"
          />
        ))}
      </RadioGroup>
    );
  };
  
  const renderRatingQuestion = () => {
    const ratingScale = question.ratingScale || 5;
    const ratingValue = typeof value === 'number' ? value : 0;
    const iconType = question.ratingIcon || 'star';
    
    // Map each icon type to its component
    const IconComponent = {
      'star': Star,
      'heart': Heart,
      'thumbsUp': ThumbsUp,
      'circle': Circle,
      'square': Square
    }[iconType];

    return (
      <div className={`mt-4 ${hasError ? 'border-l-4 border-red-500 pl-4' : ''}`}>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: ratingScale }).map((_, index) => {
            const isSelected = ratingValue >= index + 1;
            
            return (
              <button
                key={index}
                type="button"
                onClick={() => onAnswerChange(index + 1)}
                className={`p-1 rounded-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-300`}
                aria-label={`Classificação ${index + 1} de ${ratingScale}`}
              >
                <IconComponent 
                  className={`w-8 h-8 ${isSelected ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              </button>
            );
          })}
        </div>
        
        {ratingValue > 0 && (
          <div className="mt-2 text-sm text-slate-600">
            Sua classificação: {ratingValue} de {ratingScale}
          </div>
        )}
      </div>
    );
  };

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
              return renderRadioOptions();
              
            case 'rating':
              return renderRatingQuestion();

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
            
            {/* File/Photo Preview */}
            {attachment && previewUrl && (
              <div className="mb-4">
                <div className="relative">
                  {attachment.type.startsWith('image/') ? (
                    <div className="relative rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-64 w-auto object-contain mx-auto"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onFileChange(null)}
                        className="absolute top-2 right-2 bg-slate-800 bg-opacity-50 text-white rounded-full h-8 w-8 p-1 hover:bg-slate-900"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border rounded p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <Paperclip className="w-5 h-5 text-slate-500 mr-2" />
                        <span className="text-sm truncate max-w-[200px]">{attachment.name}</span>
                        <span className="text-xs text-slate-500 ml-2">
                          ({(attachment.size / 1024).toFixed(0)} KB)
                        </span>
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
                  )}
                </div>
              </div>
            )}
            
            {!attachment && (
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
            )}
            
            {attachment && (
              <div className="mt-2 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFileChange(null)}
                  className="text-red-500 flex items-center"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remover {attachment.type.startsWith('image/') ? 'imagem' : 'arquivo'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
