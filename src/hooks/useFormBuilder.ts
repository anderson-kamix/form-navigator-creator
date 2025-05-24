
import { useState, useEffect } from 'react';
import { FormSection, Question, Form } from '@/types/form';
import { toast } from '@/hooks/use-toast';
import { useParams, useNavigate } from 'react-router-dom';

export const useFormBuilder = (isEditing = false) => {
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
  const [loading, setLoading] = useState(isEditing);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditing && id) {
      setLoading(true);
      // Carregar dados do formulário do localStorage
      const existingForms = JSON.parse(localStorage.getItem('forms') || '[]');
      const formToEdit = existingForms.find((form: Form) => form.id === id);
      
      if (formToEdit) {
        setFormTitle(formToEdit.title);
        setFormDescription(formToEdit.description || '');
        setSections(formToEdit.sections.map((section: FormSection) => ({
          ...section,
          isOpen: true // Abrir todas as seções por padrão na edição
        })));
      } else {
        toast({
          title: "Erro",
          description: "Formulário não encontrado",
          variant: "destructive",
        });
        navigate('/forms');
      }
      setLoading(false);
    }
  }, [isEditing, id, navigate]);

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

    // Carregar formulários existentes
    const existingForms = JSON.parse(localStorage.getItem('forms') || '[]');

    if (isEditing && id) {
      // Atualizar formulário existente
      const formIndex = existingForms.findIndex((form: Form) => form.id === id);
      if (formIndex !== -1) {
        const originalForm = existingForms[formIndex];
        const updatedForm: Form = {
          ...originalForm,
          title: formTitle,
          description: formDescription,
          sections: sections,
          updatedAt: new Date()
        };
        
        existingForms[formIndex] = updatedForm;
        localStorage.setItem('forms', JSON.stringify(existingForms));
        
        toast({
          title: "Sucesso!",
          description: "Formulário atualizado com sucesso",
        });

        return updatedForm;
      }
    } else {
      // Criar novo formulário
      const newForm: Form = {
        id: Date.now().toString(),
        title: formTitle,
        description: formDescription,
        sections: sections,
        published: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        shareUrl: `${window.location.origin}/forms/${Date.now().toString()}`
      };

      localStorage.setItem('forms', JSON.stringify([...existingForms, newForm]));
      
      toast({
        title: "Sucesso!",
        description: "Formulário criado com sucesso",
      });

      return newForm;
    }
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
    saveForm,
    loading,
    isEditing
  };
};
