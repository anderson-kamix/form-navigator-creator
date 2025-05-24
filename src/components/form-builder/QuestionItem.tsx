
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
    
    // Configuração padrão para novas perguntas do tipo score
    if (question.type === 'score' && !question.scoreConfig) {
      onUpdate(sectionId, question.id, {
        scoreConfig: {
          leftLabel: 'Muito ruim',
          rightLabel: 'Muito bom',
          maxScore: 10,
          style: 'numbered',
          colorScheme: 'blue'
        }
      });
    }
  }, [question.type, question.ratingScale, question.scoreConfig, sectionId, question.id, onUpdate]);

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

  const renderScoreOptions = () => {
    if (question.type !== 'score') return null;
    
    const scoreConfig = question.scoreConfig || {
      leftLabel: 'Muito ruim',
      rightLabel: 'Muito bom',
      maxScore: 10,
      style: 'numbered',
      colorScheme: 'blue'
    };
    
    const maxScoreOptions = [5, 6, 7, 8, 9, 10];
    const styleOptions = [
      { value: 'numbered', label: 'Números' },
      { value: 'circles', label: 'Círculos' },
      { value: 'squares', label: 'Quadrados' },
      { value: 'pills', label: 'Botões' },
    ];
    const colorOptions = [
      { value: 'blue', label: 'Azul', class: 'bg-blue-500' },
      { value: 'green', label: 'Verde', class: 'bg-green-500' },
      { value: 'purple', label: 'Roxo', class: 'bg-purple-500' },
      { value: 'orange', label: 'Laranja', class: 'bg-orange-500' },
      { value: 'gray', label: 'Cinza', class: 'bg-gray-500' },
    ];
    
    const updateScoreConfig = (updates: Partial<Question['scoreConfig']>) => {
      onUpdate(sectionId, question.id, {
        scoreConfig: { ...scoreConfig, ...updates }
      });
    };
    
    const getStylePreview = (style: string, index: number, total: number) => {
      const colorClass = `bg-${scoreConfig.colorScheme}-${index < 3 ? '500' : '200'}`;
      const baseClass = `w-8 h-8 flex items-center justify-center text-white font-medium`;
      
      switch (style) {
        case 'circles':
          return <div className={`${baseClass} ${colorClass} rounded-full`}></div>;
        case 'squares':
          return <div className={`${baseClass} ${colorClass}`}></div>;
        case 'pills':
          return <div className={`${baseClass} ${colorClass} rounded-full px-3`}>{index + 1}</div>;
        default: // numbered
          return <div className={`${baseClass} ${colorClass} rounded`}>{index + 1}</div>;
      }
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <Label>Texto à Esquerda</Label>
          <Input 
            value={scoreConfig.leftLabel}
            onChange={(e) => updateScoreConfig({ leftLabel: e.target.value })}
            placeholder="Ex: Muito ruim"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label>Texto à Direita</Label>
          <Input 
            value={scoreConfig.rightLabel}
            onChange={(e) => updateScoreConfig({ rightLabel: e.target.value })}
            placeholder="Ex: Muito bom"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label>Nota Máxima</Label>
          <Select
            value={scoreConfig.maxScore.toString()}
            onValueChange={(value) => updateScoreConfig({ maxScore: Number(value) })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {maxScoreOptions.map((score) => (
                <SelectItem key={score} value={score.toString()}>
                  {score}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Estilo</Label>
          <Select
            value={scoreConfig.style}
            onValueChange={(value) => updateScoreConfig({ style: value as any })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {styleOptions.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Esquema de Cores</Label>
          <div className="flex space-x-2 mt-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => updateScoreConfig({ colorScheme: color.value as any })}
                className={`w-8 h-8 rounded-full ${color.class} ${
                  scoreConfig.colorScheme === color.value 
                    ? 'ring-2 ring-offset-2 ring-blue-500' 
                    : ''
                }`}
                aria-label={color.label}
              />
            ))}
          </div>
        </div>
        
        <div className="col-span-2">
          <Label>Pré-visualização</Label>
          <div className="mt-2">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">{scoreConfig.leftLabel}</span>
                <span className="text-sm text-slate-600">{scoreConfig.rightLabel}</span>
              </div>
              
              <div className="flex justify-between">
                <div className="flex space-x-2">
                  {Array.from({ length: Math.min(scoreConfig.maxScore, 10) }).map((_, i) => (
                    <div key={i}>
                      {getStylePreview(scoreConfig.style, i, scoreConfig.maxScore)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
          {question.type === 'score' && renderScoreOptions()}
          
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
              
              {question.type !== 'rating' && question.type !== 'score' && (
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
            
            {question.allowAttachments && question.type !== 'rating' && question.type !== 'score' && (
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
