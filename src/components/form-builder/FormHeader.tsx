
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FormHeaderProps {
  formTitle: string;
  setFormTitle: (title: string) => void;
  formDescription: string;
  setFormDescription: (description: string) => void;
}

const FormHeader: React.FC<FormHeaderProps> = ({ 
  formTitle, 
  setFormTitle, 
  formDescription, 
  setFormDescription 
}) => {
  return (
    <Card className="p-6 mb-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Título do Formulário</Label>
          <Input
            id="title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Ex: Pesquisa de Satisfação"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Descreva o objetivo deste formulário"
            className="mt-1"
          />
        </div>
      </div>
    </Card>
  );
};

export default FormHeader;
