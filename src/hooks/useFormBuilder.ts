
import { useState } from 'react';
import { FormSection, Question } from '@/types/form';
import { toast } from '@/hooks/use-toast';

export const useFormBuilder = () => {
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
      allowAttachments: false,
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

  return {
    formTitle,
    setFormTitle,
    formDescription,
    setFormDescription,
    sections,
    addSection,
    updateSection,
    removeSection,
    toggleSection,
    addQuestion,
    updateQuestion,
    removeQuestion,
    saveForm
  };
};
