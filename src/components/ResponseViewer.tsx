
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Form } from '@/types/form';
import { ArrowLeft, Edit2, Trash2, Download, FileText, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Response } from './form-viewer/useFormViewerState';
import { QuestionWithSection, flattenSectionQuestions } from './form-viewer/utils/sectionUtils';
import ResponseEditModal from './form-viewer/ResponseEditModal';
import ResponseDeleteDialog from './form-viewer/ResponseDeleteDialog';
import { updateResponse, deleteResponse } from './form-viewer/utils/responseManagement';

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
      // Carregar o formulário
      const storedForms = JSON.parse(localStorage.getItem('forms') || '[]');
      const foundForm = storedForms.find((f: Form) => f.id === id);
      
      if (foundForm) {
        setForm(foundForm);
        setAllQuestions(flattenSectionQuestions(foundForm.sections));
      }
      
      // Carregar as respostas
      const storedResponses = JSON.parse(localStorage.getItem(`responses_${id}`) || '[]');
      setResponses(storedResponses);
      
      setLoading(false);
    }
  }, [id]);

  const handleExportCSV = () => {
    if (!form || responses.length === 0) return;
    
    // Criar cabeçalhos CSV com todas as perguntas
    const questions = allQuestions.map(q => q.title);
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Data,";
    csvContent += questions.join(",");
    csvContent += "\n";
    
    // Adicionar cada resposta ao CSV
    responses.forEach(response => {
      const date = new Date(response.submittedAt).toLocaleDateString();
      csvContent += `"${date}",`;
      
      // Adicionar respostas para cada pergunta
      allQuestions.forEach(question => {
        const answer = response.answers[question.id];
        let formattedAnswer = "";
        
        if (Array.isArray(answer)) {
          formattedAnswer = `"${answer.join('; ')}"`;
        } else if (answer !== undefined && answer !== null) {
          formattedAnswer = `"${String(answer).replace(/"/g, '""')}"`;
        }
        
        csvContent += formattedAnswer + ",";
      });
      
      csvContent = csvContent.slice(0, -1); // remover última vírgula
      csvContent += "\n";
    });
    
    // Download do arquivo CSV
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${form.title}_respostas.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Exportado",
      description: "As respostas foram exportadas com sucesso.",
    });
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
        <Button asChild>
          <Link to="/forms">Voltar para a lista de formulários</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link to="/forms">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{form.title}</h1>
            <p className="text-slate-600">
              {responses.length} {responses.length === 1 ? 'resposta recebida' : 'respostas recebidas'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={responses.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/forms/${id}`}>
              <FileText className="w-4 h-4 mr-2" />
              Ver Formulário
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/statistics/${id}`}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Estatísticas
            </Link>
          </Button>
        </div>
      </div>

      {responses.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-10 text-center">
            <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhuma resposta ainda</h3>
            <p className="text-slate-600 mb-6">Compartilhe seu formulário para começar a receber respostas.</p>
            <Button asChild>
              <Link to={`/forms/${id}`}>Ver Formulário</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">Lista de Respostas</TabsTrigger>
              <TabsTrigger value="individual">Respostas Individuais</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="mt-4">
              <div className="space-y-4">
                {responses.map((response, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div>
                          <CardTitle className="text-lg">Resposta #{index + 1}</CardTitle>
                          <CardDescription>
                            Enviada em {new Date(response.submittedAt).toLocaleString()}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditClick(response)}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteClick(response)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {allQuestions.map((question, qIndex) => {
                          const answer = response.answers[question.id];
                          if (!answer) return null;
                          
                          return (
                            <div key={qIndex} className="grid grid-cols-3 gap-4 py-2 border-b last:border-b-0">
                              <div className="font-medium text-slate-700">
                                {question.title}
                                {question.required && (
                                  <Badge variant="outline" className="ml-2 text-xs">Obrigatório</Badge>
                                )}
                              </div>
                              <div className="col-span-2">
                                {Array.isArray(answer) ? (
                                  <ul className="list-disc pl-5">
                                    {answer.map((item, i) => (
                                      <li key={i}>{item}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span>{answer}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="individual">
              {/* Individual response content - can be implemented in future */}
              <Card>
                <CardContent className="pt-6">
                  <p>Visualização individual de respostas em desenvolvimento.</p>
                </CardContent>
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
