
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form } from '@/types/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Response } from './form-viewer/useFormViewerState';
import { QuestionWithSection, flattenSectionQuestions } from './form-viewer/utils/sectionUtils';
import ResponseEditModal from './form-viewer/ResponseEditModal';
import ResponseDeleteDialog from './form-viewer/ResponseDeleteDialog';
import { updateResponse, deleteResponse } from './form-viewer/utils/responseManagement';
import { exportResponsesToCSV } from './response-viewer/utils/exportUtils';
import ResponseHeader from './response-viewer/ResponseHeader';
import ResponseList from './response-viewer/ResponseList';
import ResponseEmptyState from './response-viewer/ResponseEmptyState';

const ResponseViewer = () => {
  const { id } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState<QuestionWithSection[]>([]);
  
  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  
  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState<Response | null>(null);

  useEffect(() => {
    if (id) {
      // Load form
      const storedForms = JSON.parse(localStorage.getItem('forms') || '[]');
      const foundForm = storedForms.find((f: Form) => f.id === id);
      
      if (foundForm) {
        setForm(foundForm);
        setAllQuestions(flattenSectionQuestions(foundForm.sections));
      }
      
      // Load responses
      const storedResponses = JSON.parse(localStorage.getItem(`responses_${id}`) || '[]');
      setResponses(storedResponses);
      
      setLoading(false);
    }
  }, [id]);

  const handleExportCSV = () => {
    if (form) {
      exportResponsesToCSV(form, responses, allQuestions);
    }
  };

  const handleEditClick = (response: Response) => {
    setSelectedResponse(response);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (response: Response) => {
    setResponseToDelete(response);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveResponse = (formId: string, updatedAnswers: Record<string, any>) => {
    if (!selectedResponse) return;
    
    const responseId = selectedResponse.submittedAt.toString();
    const success = updateResponse(formId, responseId, updatedAnswers);
    
    if (success) {
      // Update the local state to reflect changes
      setResponses(prevResponses => 
        prevResponses.map(r => 
          new Date(r.submittedAt).getTime() === new Date(responseId).getTime()
            ? { ...r, answers: updatedAnswers }
            : r
        )
      );
      
      toast({
        title: "Resposta atualizada",
        description: "A resposta foi atualizada com sucesso."
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a resposta.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteResponse = () => {
    if (!responseToDelete || !id) return;
    
    const responseId = responseToDelete.submittedAt.toString();
    const success = deleteResponse(id, responseId);
    
    if (success) {
      // Remove from local state
      setResponses(prevResponses => 
        prevResponses.filter(r => 
          new Date(r.submittedAt).getTime() !== new Date(responseId).getTime()
        )
      );
      
      toast({
        title: "Resposta excluída",
        description: "A resposta foi excluída com sucesso."
      });
      
      setIsDeleteDialogOpen(false);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a resposta.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center mb-8">
          <Skeleton className="h-10 w-10 rounded-full mr-4" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        
        <div className="space-y-6">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Formulário não encontrado</h1>
        <p className="mb-6">O formulário que você está procurando não existe ou foi removido.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <ResponseHeader 
        title={form.title}
        formId={id || ''}
        responseCount={responses.length}
        onExportCSV={handleExportCSV}
      />

      {responses.length === 0 ? (
        <ResponseEmptyState formId={id || ''} />
      ) : (
        <div className="space-y-6">
          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">Lista de Respostas</TabsTrigger>
              <TabsTrigger value="individual">Respostas Individuais</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="mt-4">
              <ResponseList 
                responses={responses} 
                questions={allQuestions}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            </TabsContent>
            <TabsContent value="individual">
              <Card>
                <div className="p-6">
                  <p>Visualização individual de respostas em desenvolvimento.</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Edit Modal */}
      <ResponseEditModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        response={selectedResponse}
        questions={allQuestions}
        onSave={handleSaveResponse}
      />

      {/* Delete Confirmation Dialog */}
      <ResponseDeleteDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteResponse}
      />
    </div>
  );
};

export default ResponseViewer;
