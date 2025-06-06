
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { QuestionWithSection } from '../form-viewer/utils/sectionUtils';
import { toast } from "@/hooks/use-toast";
import AttachmentViewer from './AttachmentViewer';
import { QuestionRenderer } from './QuestionRenderer';
import { uploadFileToStorage, deleteFileFromStorage } from './utils/storageUtils';

// Interface local para as respostas
interface FormResponseData {
  id: string;
  submittedAt: Date;
  answers: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  formId: string;
  attachments: Record<string, string>;
}

interface ResponseEditModalProps {
  open: boolean;
  onClose: () => void;
  response: FormResponseData | null;
  questions: QuestionWithSection[];
  onSave: (formId: string, updatedAnswers: Record<string, any>, updatedAttachments?: Record<string, string>) => void;
}

const ResponseEditModal = ({ open, onClose, response, questions, onSave }: ResponseEditModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [attachments, setAttachments] = useState<Record<string, string>>({});
  const [newFiles, setNewFiles] = useState<Record<string, File | null>>({});

  // Initialize answers and attachments when response changes
  useEffect(() => {
    if (response) {
      console.log("Loading response answers:", response.answers);
      console.log("Loading response attachments:", response.attachments);
      setAnswers({ ...response.answers });
      setAttachments({ ...response.attachments });
      setNewFiles({});
    }
  }, [response]);

  const handleAnswerChange = (questionId: string, value: any) => {
    console.log("Updating answer for question", questionId, "with value:", value);
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleFileChange = (questionId: string, file: File | null) => {
    console.log("File changed for question", questionId, ":", file?.name);
    setNewFiles(prev => ({
      ...prev,
      [questionId]: file
    }));
  };

  const handleRemoveAttachment = async (questionId: string) => {
    console.log("Removing attachment for question", questionId);
    
    // Remove from current attachments
    setAttachments(prev => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
    
    // Also remove any new file for this question
    setNewFiles(prev => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  const handleCapturePhoto = (questionId: string) => {
    // Create a file input for camera capture
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileChange(questionId, file);
      }
    };
    
    input.click();
  };

  const uploadNewAttachments = async (): Promise<Record<string, string>> => {
    const uploadedAttachments: Record<string, string> = {};
    
    for (const [questionId, file] of Object.entries(newFiles)) {
      if (file && response) {
        try {
          console.log('Uploading new attachment for question:', questionId);
          const fileUrl = await uploadFileToStorage(file, response.formId, response.id, questionId);
          uploadedAttachments[questionId] = fileUrl;
        } catch (error) {
          console.error('Error uploading file:', error);
          toast({
            title: "Erro no upload",
            description: `Não foi possível fazer upload do arquivo para a pergunta ${questionId}`,
            variant: "destructive"
          });
        }
      }
    }
    
    return uploadedAttachments;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!response) return;
    
    setIsSubmitting(true);
    try {
      // Upload new attachments
      const uploadedAttachments = await uploadNewAttachments();
      
      // Merge existing attachments with new ones
      const finalAttachments = {
        ...attachments,
        ...uploadedAttachments
      };
      
      console.log("Saving updated answers:", answers);
      console.log("Saving updated attachments:", finalAttachments);
      
      onSave(response.formId, answers, finalAttachments);
      onClose();
    } catch (error) {
      console.error("Error updating response:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a resposta.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!response) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Resposta</DialogTitle>
          <DialogDescription>
            Modifique as respostas e anexos do formulário conforme necessário.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question) => {
            const questionId = question.id;
            const currentValue = answers[questionId] || '';
            const hasExistingAttachment = attachments[questionId];
            const hasNewFile = newFiles[questionId];
            
            return (
              <div key={questionId} className="space-y-2">
                <Label className="font-medium text-slate-700">
                  {question.title}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                
                {/* Regular question input */}
                {question.type === 'textarea' ? (
                  <Textarea
                    value={currentValue}
                    onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                    placeholder="Digite sua resposta aqui..."
                    className="min-h-[100px]"
                  />
                ) : question.type === 'select' || question.type === 'radio' ? (
                  <select 
                    className="w-full border rounded-md px-3 py-2 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                    value={currentValue}
                    onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                  >
                    <option value="">Selecione uma opção</option>
                    {question.options?.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : question.type === 'checkbox' ? (
                  <div className="space-y-2">
                    {question.options?.map((option, index) => {
                      const isChecked = Array.isArray(currentValue) 
                        ? currentValue.includes(option) 
                        : false;
                      
                      return (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`${questionId}-${index}`}
                            checked={isChecked}
                            onChange={(e) => {
                              const currentValues = Array.isArray(currentValue) ? [...currentValue] : [];
                              if (e.target.checked) {
                                handleAnswerChange(questionId, [...currentValues, option]);
                              } else {
                                handleAnswerChange(questionId, currentValues.filter(val => val !== option));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor={`${questionId}-${index}`} className="text-sm text-slate-700">
                            {option}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                ) : question.type === 'rating' ? (
                  <div className="space-y-2">
                    <div className="flex space-x-1">
                      {Array.from({ length: question.ratingScale || 5 }, (_, i) => i + 1).map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleAnswerChange(questionId, value)}
                          className={`w-8 h-8 rounded ${
                            currentValue === value
                              ? 'bg-yellow-400 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      Avaliação atual: {currentValue || 'Não avaliado'}
                    </p>
                  </div>
                ) : question.type === 'score' ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{question.scoreConfig?.leftLabel || 'Mínimo'}</span>
                      <span>{question.scoreConfig?.rightLabel || 'Máximo'}</span>
                    </div>
                    <div className="flex space-x-1">
                      {Array.from({ length: question.scoreConfig?.maxScore || 10 }, (_, i) => i + 1).map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleAnswerChange(questionId, value)}
                          className={`w-8 h-8 rounded text-sm font-medium ${
                            currentValue === value
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">
                      Pontuação atual: {currentValue || 'Não pontuado'}
                    </p>
                  </div>
                ) : (
                  <Input
                    type="text"
                    value={currentValue}
                    onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                    placeholder="Digite sua resposta aqui..."
                  />
                )}
                
                {/* Attachment section for questions that allow attachments */}
                {question.allowAttachments && (
                  <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Anexos</h4>
                    
                    {/* Show existing attachment */}
                    {hasExistingAttachment && !hasNewFile && (
                      <div className="mb-3">
                        <p className="text-sm text-slate-600 mb-2">Anexo atual:</p>
                        <AttachmentViewer
                          attachments={attachments}
                          questionId={questionId}
                          questionTitle={question.title}
                          showDownload={true}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveAttachment(questionId)}
                          className="mt-2 text-red-500 hover:text-red-700"
                        >
                          Remover anexo atual
                        </Button>
                      </div>
                    )}
                    
                    {/* Show new file preview */}
                    {hasNewFile && (
                      <div className="mb-3">
                        <p className="text-sm text-slate-600 mb-2">Novo anexo:</p>
                        <div className="bg-white border rounded p-3">
                          {hasNewFile.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(hasNewFile)}
                              alt="Preview"
                              className="max-h-32 w-auto object-contain mx-auto rounded"
                            />
                          ) : (
                            <div className="flex items-center">
                              <span className="text-sm truncate">{hasNewFile.name}</span>
                              <span className="text-xs text-slate-500 ml-2">
                                ({(hasNewFile.size / 1024).toFixed(0)} KB)
                              </span>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleFileChange(questionId, null)}
                          className="mt-2 text-red-500 hover:text-red-700"
                        >
                          Remover novo anexo
                        </Button>
                      </div>
                    )}
                    
                    {/* File upload controls */}
                    {!hasNewFile && (
                      <div className="flex flex-wrap gap-2">
                        <div>
                          <input
                            type="file"
                            id={`file-${questionId}`}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileChange(questionId, file);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`file-${questionId}`)?.click()}
                          >
                            {hasExistingAttachment ? 'Substituir arquivo' : 'Anexar arquivo'}
                          </Button>
                        </div>
                        
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleCapturePhoto(questionId)}
                        >
                          {hasExistingAttachment ? 'Substituir foto' : 'Capturar foto'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <DialogFooter className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResponseEditModal;
