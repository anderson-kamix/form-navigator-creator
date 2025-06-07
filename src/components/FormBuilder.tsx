
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import FormHeader from './form-builder/FormHeader';
import FormCoverComponent from './form-builder/FormCover';
import FormSectionComponent from './form-builder/FormSectionComponent';
import { useFormBuilder } from '@/hooks/useFormBuilder';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const FormBuilder = () => {
  const navigate = useNavigate();
  const { canCreateForms } = useAuth();
  const {
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
    saveForm
  } = useFormBuilder();

  // Verificar permissões ao carregar o componente
  useEffect(() => {
    if (!canCreateForms) {
      navigate('/forms');
    }
  }, [canCreateForms, navigate]);

  const handleSaveForm = async () => {
    console.log('Botão salvar clicado');
    const result = await saveForm();
    if (result) {
      console.log('Formulário salvo, redirecionando para /forms');
      navigate('/forms');
    }
  };

  // Se não tem permissão, não renderizar nada (será redirecionado)
  if (!canCreateForms) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Criar Novo Formulário</h1>
          <p className="text-slate-600">Configure seu formulário e adicione as questões</p>
        </div>

        {/* Form Header */}
        <FormHeader 
          formTitle={formTitle}
          setFormTitle={setFormTitle}
          formDescription={formDescription}
          setFormDescription={setFormDescription}
        />

        {/* Form Cover */}
        <FormCoverComponent
          cover={formCover}
          updateCover={updateCover}
        />

        {/* Sections and Questions */}
        <div className="space-y-6 mb-6">
          {sections.map((section) => (
            <FormSectionComponent
              key={section.id}
              section={section}
              allSections={sections}
              updateSection={updateSection}
              removeSection={removeSection}
              toggleSection={toggleSection}
              addQuestion={addQuestion}
              updateQuestion={updateQuestion}
              removeQuestion={removeQuestion}
            />
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

          <Button onClick={handleSaveForm} className="bg-blue-600 hover:bg-blue-700">
            Salvar Formulário
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
