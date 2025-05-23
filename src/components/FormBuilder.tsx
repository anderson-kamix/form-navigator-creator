
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  title: string;
  options?: string[];
  required: boolean;
}

const FormBuilder = () => {
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'text',
      title: '',
      required: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const saveForm = () => {
    if (!formTitle.trim()) {
      toast({
        title: "Erro",
        description: "O título do formulário é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (questions.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma questão",
        variant: "destructive",
      });
      return;
    }

    // Aqui você salvaria no banco de dados
    console.log('Salvando formulário:', { formTitle, formDescription, questions });
    
    toast({
      title: "Sucesso!",
      description: "Formulário criado com sucesso",
    });
  };

  const questionTypes = [
    { value: 'text', label: 'Texto Curto' },
    { value: 'textarea', label: 'Texto Longo' },
    { value: 'select', label: 'Seleção Única' },
    { value: 'radio', label: 'Múltipla Escolha' },
    { value: 'checkbox', label: 'Múltiplas Seleções' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Criar Novo Formulário</h1>
          <p className="text-slate-600">Configure seu formulário e adicione as questões</p>
        </div>

        {/* Form Header */}
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

        {/* Questions */}
        <div className="space-y-4 mb-6">
          {questions.map((question, index) => (
            <Card key={question.id} className="p-6">
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
                        onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                        placeholder="Digite sua pergunta"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Tipo de Resposta</Label>
                      <Select
                        value={question.type}
                        onValueChange={(value: Question['type']) => 
                          updateQuestion(question.id, { type: value })
                        }
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
                  </div>

                  {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
                    <div>
                      <Label>Opções (uma por linha)</Label>
                      <Textarea
                        value={question.options?.join('\n') || ''}
                        onChange={(e) => 
                          updateQuestion(question.id, { 
                            options: e.target.value.split('\n').filter(opt => opt.trim()) 
                          })
                        }
                        placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(question.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={addQuestion}
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Questão
          </Button>

          <Button onClick={saveForm} className="bg-blue-600 hover:bg-blue-700">
            Salvar Formulário
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
