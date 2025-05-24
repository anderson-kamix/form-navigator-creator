
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, Paperclip, Camera, Star, Heart, ThumbsUp, Circle, Square } from 'lucide-react';
import { Question } from '@/types/form';
import QuestionTypeSelector from './QuestionTypeSelector';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface QuestionItemProps {
  question: Question;
  index: number;
  sectionId: string;
  onUpdate: (sectionId: string, questionId: string, updates: Partial<Question>) => void;
  onRemove: (sectionId: string, questionId: string) => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ question, index, sectionId, onUpdate, onRemove }) => {
  // Configuração padrão para novas perguntas do tipo rating
  React.useEffect(() => {
    if (question.type === 'rating' && !question.ratingScale) {
      onUpdate(sectionId, question.id, { 
        ratingScale: 5,
        ratingIcon: 'star'
      });
    }
  }, [question.type, question.ratingScale, sectionId, question.id, onUpdate]);

  const renderRatingOptions = () => {
    if (question.type !== 'rating') return null;
    
    const ratingScales = [3, 4, 5, 6, 7, 8, 9, 10];
    const ratingIcons = [
      { value: 'star', label: 'Estrela', icon: <Star className="w-4 h-4" /> },
      { value: 'heart', label: 'Coração', icon: <Heart className="w-4 h-4" /> },
      { value: 'thumbsUp', label: 'Polegar', icon: <ThumbsUp className="w-4 h-4" /> },
      { value: 'circle', label: 'Círculo', icon: <Circle className="w-4 h-4" /> },
      { value: 'square', label: 'Quadrado', icon: <Square className="w-4 h-4" /> },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <Label>Escala de Classificação</Label>
          <Select
            value={question.ratingScale?.toString() || '5'}
            onValueChange={(value) => 
              onUpdate(sectionId, question.id, { ratingScale: Number(value) })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ratingScales.map((scale) => (
                <SelectItem key={scale} value={scale.toString()}>
                  {scale} pontos
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Ícone de Classificação</Label>
          <RadioGroup 
            className="flex gap-4 mt-2"
            value={question.ratingIcon || 'star'}
            onValueChange={(value) => 
              onUpdate(sectionId, question.id, { 
                ratingIcon: value as 'star' | 'heart' | 'thumbsUp' | 'circle' | 'square'
              })
            }
          >
            {ratingIcons.map((icon) => (
              <div key={icon.value} className="flex flex-col items-center">
                <div className="mb-1">
                  {icon.icon}
                </div>
                <RadioGroupItem 
                  value={icon.value} 
                  id={`icon-${icon.value}`}
                  className="sr-only"
                />
                <Label 
                  htmlFor={`icon-${icon.value}`}
                  className={`text-xs cursor-pointer p-1 rounded ${
                    question.ratingIcon === icon.value ? 'bg-blue-100 text-blue-800' : ''
                  }`}
                >
                  {icon.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="col-span-2">
          <Label>Pré-visualização</Label>
          <div className="flex mt-2 gap-1">
            {Array.from({ length: question.ratingScale || 5 }).map((_, i) => {
              const IconComponent = {
                'star': Star,
                'heart': Heart,
                'thumbsUp': ThumbsUp,
                'circle': Circle,
                'square': Square
              }[question.ratingIcon || 'star'];

              return (
                <IconComponent 
                  key={i} 
                  className={`w-6 h-6 ${i < 3 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

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
          
          {question.type === 'rating' && renderRatingOptions()}
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`required-${question.id}`}
                  checked={question.required}
                  onCheckedChange={(checked) => 
                    onUpdate(sectionId, question.id, { required: checked })
                  }
                />
                <Label htmlFor={`required-${question.id}`}>Obrigatório</Label>
              </div>
              
              {question.type !== 'rating' && (
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
              )}
            </div>
            
            {question.allowAttachments && question.type !== 'rating' && (
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
