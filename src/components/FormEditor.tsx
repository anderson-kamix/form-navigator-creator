
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import FormHeader from './form-builder/FormHeader';
import FormCoverComponent from './form-builder/FormCover';
import FormSectionComponent from './form-builder/FormSectionComponent';
import { useFormBuilder } from '@/hooks/useFormBuilder';
import { Link, useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const FormEditor = () => {
  const navigate = useNavigate();
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
    saveForm,
    loading,
    isEditing
  } = useFormBuilder(true);

  const handleSave = () => {
    const savedForm = saveForm();
    if (savedForm) {
      navigate('/forms');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          
          <Skeleton className="h-48 w-full mb-6" />
          
          <div className="space-y-6 mb-6">
            <Skeleton className="h-72 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/forms')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Editar Formulário</h1>
            <p className="text-slate-600">Atualize seu formulário conforme necessário</p>
          </div>
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

          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormEditor;
