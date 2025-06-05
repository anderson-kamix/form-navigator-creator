
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Form } from '@/types/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { QuestionWithSection, flattenSectionQuestions } from './form-viewer/utils/sectionUtils';
import { loadFormResponses } from './form-viewer/utils/responseUtils';
import ResponseEditModal from './form-viewer/ResponseEditModal';
import ResponseDeleteDialog from './form-viewer/ResponseDeleteDialog';
import { updateResponse, deleteResponse } from './form-viewer/utils/responseManagement';
import { exportResponsesToExcel } from './response-viewer/utils/exportUtils';
import ResponseHeader from './response-viewer/ResponseHeader';
import ResponseList from './response-viewer/ResponseList';
import ResponseEmptyState from './response-viewer/ResponseEmptyState';

interface SupabaseResponse {
  id: string;
  submitted_at: string;
  ip_address?: string;
  user_agent?: string;
  question_answers: Array<{
    question_id: string;
    answer: any;
  }>;
  attachments: Array<{
    question_id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_data: string;
  }>;
}

// Interface para as respostas usadas neste componente
interface FormResponseData {
  id: string;
  submittedAt: Date;
  answers: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  formId: string;
  attachments: Record<string, string>;
}

const ResponseViewer = () => {
  const { id } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState<QuestionWithSection[]>([]);
  
  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<FormResponseData | null>(null);
  
  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState<FormResponseData | null>(null);

  useEffect(() => {
    if (id) {
      loadFormAndResponses();
    }
  }, [id]);

  const loadFormAndResponses = async () => {
    if (!id) return;

    try {
      // Load form from Supabase
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select(`
          *,
          form_sections (
            *,
            questions (*)
          )
        `)
        .eq('id', id)
        .single();

      if (formError) {
        console.error('Erro ao carregar formulário:', formError);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o formulário",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Convert to Form format with proper type casting
      const sectionsWithQuestions = formData.form_sections
        .sort((a, b) => a.order_index - b.order_index)
        .map(section => ({
          id: section.id,
          title: section.title,
          description: section.description || '',
          questions: section.questions
            .sort((a, b) => a.order_index - b.order_index)
            .map(q => ({
              id: q.id,
              type: q.type as any,
              title: q.title,
              options: q.options as string[],
              required: q.required || false,
              allowAttachments: q.allow_attachments || false,
              ratingScale: q.rating_scale,
              ratingIcon: q.rating_icon as any,
              scoreConfig: q.score_config as any,
              conditionalLogic: Array.isArray(q.conditional_logic) ? q.conditional_logic as any[] : []
            })),
          isOpen: true,
          conditionalLogic: Array.isArray(section.conditional_logic) ? section.conditional_logic as any[] : []
        }));

      const formObject: Form = {
        id: formData.id,
        title: formData.title,
        description: formData.description || '',
        cover: formData.cover as any,
        sections: sectionsWithQuestions,
        published: formData.published || false,
        createdAt: new Date(formData.created_at),
        updatedAt: new Date(formData.updated_at)
      };

      setForm(formObject);
      setAllQuestions(flattenSectionQuestions(sectionsWithQuestions));

      // Load responses
      const responsesData = await loadFormResponses(id);
      console.log('Dados de resposta carregados:', responsesData);

      // Convert responses to the expected format
      const formattedResponses: FormResponseData[] = responsesData.map((response: SupabaseResponse) => {
        // Convert question_answers array to answers object
        const answers: Record<string, any> = {};
        if (response.question_answers) {
          response.question_answers.forEach(qa => {
            answers[qa.question_id] = qa.answer;
          });
        }

        // Convert attachments to Record format
        const attachments: Record<string, string> = {};
        if (response.attachments) {
          response.attachments.forEach(attachment => {
            attachments[attachment.question_id] = attachment.file_data;
          });
        }

        return {
          id: response.id,
          submittedAt: new Date(response.submitted_at),
          answers,
          ipAddress: response.ip_address,
          userAgent: response.user_agent,
          formId: id,
          attachments
        };
      });

      setResponses(formattedResponses);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (form) {
      exportResponsesToCSV(form, responses, allQuestions);
    }
  };

  const handleExportExcel = () => {
    if (form) {
      exportResponsesToExcel(form, responses, allQuestions);
    }
  };

  const handleEditClick = (response: FormResponseData) => {
    console.log("Opening edit modal for response:", response);
    setSelectedResponse(response);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (response: FormResponseData) => {
    setResponseToDelete(response);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveResponse = async (
    formId: string, 
    updatedAnswers: Record<string, any>, 
    updatedAttachments?: Record<string, string>
  ) => {
    if (!selectedResponse) return;
    
    console.log("Saving response with updated answers:", updatedAnswers);
    console.log("Saving response with updated attachments:", updatedAttachments);
    
    const success = await updateResponse(formId, selectedResponse.id, updatedAnswers);
    
    if (success) {
      // Update the local state to reflect changes
      setResponses(prevResponses => 
        prevResponses.map(r => 
          r.id === selectedResponse.id
            ? { 
                ...r, 
                answers: updatedAnswers,
                attachments: updatedAttachments || r.attachments
              }
            : r
        )
      );
      
      // If we have updated attachments, also update them in Supabase
      if (updatedAttachments) {
        try {
          // Delete existing attachment records for this response
          await supabase
            .from('attachments')
            .delete()
            .eq('response_id', selectedResponse.id);
          
          // Insert new attachment records
          const attachmentRecords = Object.entries(updatedAttachments).map(([questionId, fileUrl]) => ({
            response_id: selectedResponse.id,
            question_id: questionId,
            file_name: 'updated_file',
            file_type: 'image/jpeg', // Default, could be improved
            file_size: 0, // Could be improved
            file_data: fileUrl
          }));
          
          if (attachmentRecords.length > 0) {
            await supabase
              .from('attachments')
              .insert(attachmentRecords);
          }
        } catch (error) {
          console.error('Error updating attachments in database:', error);
        }
      }
      
      toast({
        title: "Resposta atualizada",
        description: "A resposta foi atualizada com sucesso."
      });
      
      setIsEditModalOpen(false);
      setSelectedResponse(null);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a resposta.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteResponse = async () => {
    if (!responseToDelete || !id) return;
    
    const success = await deleteResponse(id, responseToDelete.id);
    
    if (success) {
      // Remove from local state
      setResponses(prevResponses => 
        prevResponses.filter(r => r.id !== responseToDelete.id)
      );
      
      toast({
        title: "Resposta excluída",
        description: "A resposta foi excluída com sucesso."
      });
      
      setIsDeleteDialogOpen(false);
      setResponseToDelete(null);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-40 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="h-10 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Formulário não encontrado</h1>
          <p className="text-gray-600">O formulário que você está procurando não existe ou foi removido.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <ResponseHeader 
          title={form?.title || ''}
          formId={id || ''}
          responseCount={responses.length}
          onExportExcel={handleExportExcel}
        />

        {responses.length === 0 ? (
          <ResponseEmptyState formId={id || ''} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Respostas do Formulário</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Visualize e gerencie todas as respostas recebidas
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                    {responses.length} {responses.length === 1 ? 'resposta' : 'respostas'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <ResponseList 
                responses={responses} 
                questions={allQuestions}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            </div>
          </div>
        )}

        {/* Edit Modal */}
        <ResponseEditModal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedResponse(null);
          }}
          response={selectedResponse}
          questions={allQuestions}
          onSave={handleSaveResponse}
        />

        {/* Delete Confirmation Dialog */}
        <ResponseDeleteDialog
          open={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setResponseToDelete(null);
          }}
          onConfirm={handleDeleteResponse}
        />
      </div>
    </div>
  );
};

export default ResponseViewer;
