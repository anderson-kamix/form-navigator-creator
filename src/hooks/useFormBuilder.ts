
import { useState, useEffect } from 'react';
import { FormSection, Question, Form, FormCover } from '@/types/form';
import { toast } from '@/hooks/use-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useFormBuilder = (isEditing = false) => {
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCover, setFormCover] = useState<FormCover>({
    title: 'Olá!',
    description: '',
    buttonText: 'Vamos começar',
    alignment: 'left'
  });
  const [sections, setSections] = useState<FormSection[]>([
    {
      id: Date.now().toString(),
      title: formTitle || 'Nova seção',
      description: '',
      questions: [],
      isOpen: true
    }
  ]);
  const [loading, setLoading] = useState(isEditing);
  const [formOwnerId, setFormOwnerId] = useState<string | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, canCreateForms, canEditForms, isMasterAdmin } = useAuth();

  useEffect(() => {
    if (isEditing && id) {
      loadFormFromSupabase();
    }
  }, [isEditing, id]);

  const loadFormFromSupabase = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Load form data
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', id)
        .single();

      if (formError) throw formError;

      // Verificar se o usuário tem permissão para editar este formulário
      const canEdit = isMasterAdmin || 
                     (form.user_id === user?.id && canEditForms);

      if (!canEdit) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para editar este formulário",
          variant: "destructive",
        });
        navigate('/forms');
        return;
      }

      setFormOwnerId(form.user_id);

      // Load sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('form_sections')
        .select('*')
        .eq('form_id', id)
        .order('order_index');

      if (sectionsError) throw sectionsError;

      // Load questions for each section
      const sectionsWithQuestions = await Promise.all(
        sectionsData.map(async (section) => {
          const { data: questions, error: questionsError } = await supabase
            .from('questions')
            .select('*')
            .eq('section_id', section.id)
            .order('order_index');

          if (questionsError) throw questionsError;

          return {
            id: section.id,
            title: section.title,
            description: section.description || '',
            questions: questions.map(q => ({
              id: q.id,
              type: q.type as Question['type'],
              title: q.title,
              options: q.options as string[] || undefined,
              required: q.required || false,
              allowAttachments: q.allow_attachments || false,
              ratingScale: q.rating_scale || undefined,
              ratingIcon: q.rating_icon as Question['ratingIcon'] || undefined,
              scoreConfig: q.score_config as Question['scoreConfig'] || undefined,
              conditionalLogic: (q.conditional_logic as unknown as Question['conditionalLogic']) || undefined,
            })),
            isOpen: true,
            conditionalLogic: (section.conditional_logic as unknown as FormSection['conditionalLogic']) || undefined,
          };
        })
      );

      setFormTitle(form.title);
      setFormDescription(form.description || '');
      if (form.cover) {
        setFormCover(form.cover as unknown as FormCover);
      }
      setSections(sectionsWithQuestions);
    } catch (error) {
      console.error('Erro ao carregar formulário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o formulário",
        variant: "destructive",
      });
      navigate('/forms');
    } finally {
      setLoading(false);
    }
  };

  const updateCover = (updates: Partial<FormCover>) => {
    setFormCover(prev => ({ ...prev, ...updates }));
  };

  const addSection = () => {
    const newSection: FormSection = {
      id: Date.now().toString(),
      title: `Seção ${sections.length + 1}`,
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

  const saveForm = async () => {
    console.log('Iniciando salvamento do formulário...');
    console.log('Usuário atual:', user);
    console.log('Título do formulário:', formTitle);
    console.log('Seções:', sections);

    if (!formTitle.trim()) {
      console.log('Erro: Título vazio');
      toast({
        title: "Erro",
        description: "O título do formulário é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      console.log('Erro: Usuário não autenticado');
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar o formulário",
        variant: "destructive",
      });
      return;
    }

    // Verificar permissões
    if (isEditing) {
      const canEdit = isMasterAdmin || 
                     (formOwnerId === user.id && canEditForms);
      if (!canEdit) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para editar este formulário",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!canCreateForms) {
        toast({
          title: "Acesso negado",
          description: "Você não tem permissão para criar formulários",
          variant: "destructive",
        });
        return;
      }
    }

    const totalQuestions = sections.reduce((count, section) => count + section.questions.length, 0);
    console.log('Total de questões:', totalQuestions);
    
    if (totalQuestions === 0) {
      console.log('Erro: Nenhuma questão adicionada');
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma questão",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Tentando salvar no Supabase...');
      
      if (isEditing && id) {
        console.log('Modo edição - atualizando formulário existente');
        // Update existing form
        const { error: formError } = await supabase
          .from('forms')
          .update({
            title: formTitle,
            description: formDescription,
            cover: formCover as any,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (formError) {
          console.error('Erro ao atualizar formulário:', formError);
          throw formError;
        }

        // Delete existing sections and questions
        const { error: deleteSectionsError } = await supabase
          .from('form_sections')
          .delete()
          .eq('form_id', id);

        if (deleteSectionsError) {
          console.error('Erro ao deletar seções:', deleteSectionsError);
          throw deleteSectionsError;
        }

        // Create new sections and questions
        await createSectionsAndQuestions(id);

        console.log('Formulário atualizado com sucesso');
        toast({
          title: "Sucesso!",
          description: "Formulário atualizado com sucesso",
        });

        return { id };
      } else {
        console.log('Modo criação - criando novo formulário');
        
        // Create new form
        const formData = {
          title: formTitle,
          description: formDescription,
          cover: formCover as any,
          user_id: user.id,
          published: false,
        };
        
        console.log('Dados do formulário a serem inseridos:', formData);
        
        const { data: newForm, error: formError } = await supabase
          .from('forms')
          .insert(formData)
          .select()
          .single();

        if (formError) {
          console.error('Erro ao criar formulário:', formError);
          throw formError;
        }

        console.log('Formulário criado com sucesso:', newForm);

        // Create sections and questions
        await createSectionsAndQuestions(newForm.id);

        console.log('Seções e questões criadas com sucesso');
        
        toast({
          title: "Sucesso!",
          description: "Formulário criado com sucesso",
        });

        return newForm;
      }
    } catch (error) {
      console.error('Erro detalhado ao salvar formulário:', error);
      
      // Mostrar erro mais específico
      let errorMessage = "Não foi possível salvar o formulário";
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const createSectionsAndQuestions = async (formId: string) => {
    console.log('Criando seções e questões para o formulário:', formId);
    
    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
      const section = sections[sectionIndex];
      console.log(`Criando seção ${sectionIndex + 1}:`, section.title);
      
      // Create section
      const sectionData = {
        form_id: formId,
        title: section.title,
        description: section.description,
        order_index: sectionIndex,
        conditional_logic: section.conditionalLogic as any,
      };
      
      console.log('Dados da seção a serem inseridos:', sectionData);
      
      const { data: newSection, error: sectionError } = await supabase
        .from('form_sections')
        .insert(sectionData)
        .select()
        .single();

      if (sectionError) {
        console.error('Erro ao criar seção:', sectionError);
        throw sectionError;
      }

      console.log('Seção criada com sucesso:', newSection);

      // Create questions for this section
      for (let questionIndex = 0; questionIndex < section.questions.length; questionIndex++) {
        const question = section.questions[questionIndex];
        console.log(`Criando questão ${questionIndex + 1}:`, question.title);
        
        const questionData = {
          section_id: newSection.id,
          type: question.type,
          title: question.title,
          options: question.options as any,
          required: question.required,
          allow_attachments: question.allowAttachments,
          rating_scale: question.ratingScale,
          rating_icon: question.ratingIcon,
          score_config: question.scoreConfig as any,
          conditional_logic: question.conditionalLogic as any,
          order_index: questionIndex,
        };
        
        console.log('Dados da questão a serem inseridos:', questionData);
        
        const { error: questionError } = await supabase
          .from('questions')
          .insert(questionData);

        if (questionError) {
          console.error('Erro ao criar questão:', questionError);
          throw questionError;
        }

        console.log('Questão criada com sucesso');
      }
    }
    
    console.log('Todas as seções e questões foram criadas com sucesso');
  };

  return {
    formTitle,
    setFormTitle,
    formDescription,
    setFormDescription,
    formCover,
    updateCover,
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
