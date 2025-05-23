
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight, Section } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  title: string;
  options?: string[];
  required: boolean;
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  isOpen: boolean;
}

const FormBuilder = () => {
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState<FormSection[]>([
    {
      id: Date.now().toString(),
      title: 'Seção padrão',
      description: '',
      questions: [],
      isOpen: true
    }
  ]);

  const addSection = () => {
    const newSection: FormSection = {
      id: Date.now().toString(),
      title: `Nova Seção`,
      description: '',
      questions: [],
      isOpen: true
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const removeSection = (sectionId: string) => {
    if (sections.length === 1) {
      toast({
        title: "Atenção",
        description: "É necessário ter pelo menos uma seção",
        variant: "destructive",
      });
      return;
    }
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const toggleSection = (sectionId: string) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, isOpen: !section.isOpen } : section
    ));
  };

  const addQuestion = (sectionId: string) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type: 'text',
      title: '',
      required: false,
    };
    
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: [...section.questions, newQuestion]
        };
      }
      return section;
    }));
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map(q => q.id === questionId ? { ...q, ...updates } : q)
        };
      }
      return section;
    }));
  };

  const removeQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        };
      }
      return section;
    }));
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

    const totalQuestions = sections.reduce((count, section) => count + section.questions.length, 0);
    if (totalQuestions === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma questão",
        variant: "destructive",
      });
      return;
    }

    // Aqui você salvaria no banco de dados
    console.log('Salvando formulário:', { formTitle, formDescription, sections });
    
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

        {/* Sections and Questions */}
        <div className="space-y-6 mb-6">
          {sections.map((section) => (
            <Card key={section.id} className="p-6 border-l-4 border-l-blue-500">
              {/* Section Header */}
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-8 w-8"
                      onClick={() => toggleSection(section.id)}
                    >
                      {section.isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </Button>
                    <h3 className="text-lg font-medium">
                      <Input
                        value={section.title}
                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                        placeholder="Título da Seção"
                        className="text-lg font-semibold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
                      />
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSection(section.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="pl-10 pr-8 mt-2">
                  <Textarea
                    value={section.description || ''}
                    onChange={(e) => updateSection(section.id, { description: e.target.value })}
                    placeholder="Descrição da seção (opcional)"
                    className="min-h-8 resize-none mt-1 text-sm"
                  />
                </div>
              </div>

              <Collapsible open={section.isOpen} onOpenChange={(isOpen) => updateSection(section.id, { isOpen })}>
                <CollapsibleContent>
                  {/* Questions */}
                  <div className="space-y-4 mb-4 pl-8">
                    {section.questions.map((question, index) => (
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
                                  onChange={(e) => updateQuestion(section.id, question.id, { title: e.target.value })}
                                  placeholder="Digite sua pergunta"
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label>Tipo de Resposta</Label>
                                <Select
                                  value={question.type}
                                  onValueChange={(value: Question['type']) => 
                                    updateQuestion(section.id, question.id, { type: value })
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
                                    updateQuestion(section.id, question.id, { 
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
                            onClick={() => removeQuestion(section.id, question.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Add Question Button */}
                  <div className="mt-4 pl-8">
                    <Button
                      variant="outline"
                      onClick={() => addQuestion(section.id)}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Questão
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={addSection}
              className="border-green-200 text-green-600 hover:bg-green-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Seção
            </Button>
          </div>

          <Button onClick={saveForm} className="bg-blue-600 hover:bg-blue-700">
            Salvar Formulário
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
