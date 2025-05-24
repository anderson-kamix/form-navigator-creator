
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface QuestionTypeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

const questionTypes = [
  { value: 'text', label: 'Texto Curto' },
  { value: 'textarea', label: 'Texto Longo' },
  { value: 'select', label: 'Seleção Única' },
  { value: 'radio', label: 'Múltipla Escolha' },
  { value: 'checkbox', label: 'Múltiplas Seleções' },
  { value: 'rating', label: 'Classificação (Estrelas)' },
  { value: 'score', label: 'Nota (Personalizada)' },
];

const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({ value, onValueChange }) => {
  return (
    <div>
      <Label>Tipo de Resposta</Label>
      <Select
        value={value}
        onValueChange={onValueChange}
      >
        <SelectTrigger className="mt-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {questionTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default QuestionTypeSelector;
