
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { QuestionWithSection } from '../form-viewer/utils/sectionUtils';
import { Response } from '../form-viewer/useFormViewerState';
import { toast } from "@/hooks/use-toast";

interface ResponseEditModalProps {
  open: boolean;
  onClose: () => void;
  response: Response | null;
  questions: QuestionWithSection[];
  onSave: (formId: string, updatedAnswers: Record<string, any>) => void;
}

const ResponseEditModal = ({ open, onClose, response, questions, onSave }: ResponseEditModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm({
    defaultValues: {
      answers: response?.answers || {}
    }
  });

  // Update form values when response changes
  React.useEffect(() => {
    if (response) {
      console.log("Setting form values from response:", response.answers);
      form.reset({ answers: response.answers });
    }
  }, [response, form]);

  const handleSubmit = async (data: { answers: Record<string, any> }) => {
    if (!response) return;
    
    setIsSubmitting(true);
    try {
      onSave(response.formId, data.answers);
      toast({
        title: "Resposta atualizada",
        description: "A resposta foi atualizada com sucesso.",
      });
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
            Modifique as respostas do formulário conforme necessário.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {questions.map((question) => {
              const questionId = question.id;
              const value = form.watch(`answers.${questionId}`);
              
              return (
                <FormField
                  key={questionId}
                  control={form.control}
                  name={`answers.${questionId}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        {question.title}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </FormLabel>
                      <FormControl>
                        {question.type === 'textarea' ? (
                          <Textarea 
                            {...field} 
                            value={field.value || ''}
                          />
                        ) : question.type === 'select' || question.type === 'radio' ? (
                          <select 
                            className="w-full border rounded-md px-3 py-2" 
                            {...field}
                            value={field.value || ''}
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
                              const isChecked = Array.isArray(field.value) 
                                ? field.value.includes(option) 
                                : false;
                              
                              return (
                                <div key={index} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`${questionId}-${index}`}
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const currentValues = Array.isArray(field.value) ? [...field.value] : [];
                                      if (e.target.checked) {
                                        field.onChange([...currentValues, option]);
                                      } else {
                                        field.onChange(currentValues.filter(val => val !== option));
                                      }
                                    }}
                                    className="mr-2"
                                  />
                                  <label htmlFor={`${questionId}-${index}`}>{option}</label>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <Input 
                            {...field} 
                            value={field.value || ''}
                          />
                        )}
                      </FormControl>
                    </FormItem>
                  )}
                />
              );
            })}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ResponseEditModal;
