import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Check, Paperclip, Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  title: string;
  options?: string[];
  required: boolean;
  allowAttachments?: boolean;
}

const FormViewer = () => {
  const { id } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [attachments, setAttachments] = useState<Record<string, File | null>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock form data - in real app, fetch from database
  const form = {
    id: id,
    title: 'Pesquisa de Satisfação',
    description: 'Ajude-nos a melhorar nossos serviços respondendo algumas perguntas.',
    questions: [
      {
        id: '1',
        type: 'text' as const,
        title: 'Qual é o seu nome?',
        required: true,
        allowAttachments: true,
      },
      {
        id: '2',
        type: 'radio' as const,
        title: 'Como você avalia nosso atendimento?',
        options: ['Excelente', 'Bom', 'Regular', 'Ruim', 'Péssimo'],
        required: true,
        allowAttachments: false,
      },
      {
        id: '3',
        type: 'checkbox' as const,
        title: 'Quais serviços você utiliza? (múltiplas opções)',
        options: ['Suporte Técnico', 'Vendas', 'Consultoria', 'Treinamento'],
        required: false,
        allowAttachments: true,
      },
      {
        id: '4',
        type: 'select' as const,
        title: 'Com que frequência você usa nossos serviços?',
        options: ['Diariamente', 'Semanalmente', 'Mensalmente', 'Raramente'],
        required: true,
        allowAttachments: false,
      },
      {
        id: '5',
        type: 'textarea' as const,
        title: 'Deixe seus comentários e sugestões:',
        required: false,
        allowAttachments: false,
      },
    ] as Question[],
  };

  const totalQuestions = form.questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleFileChange = (questionId: string, file: File | null) => {
    setAttachments(prev => ({ ...prev, [questionId]: file }));
  };

  const handleCapturePhoto = (questionId: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      fileInputRef.current.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          handleFileChange(questionId, target.files[0]);
          toast({
            title: "Foto capturada",
            description: "A foto foi anexada à sua resposta.",
          });
        }
      };
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  const nextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitForm = () => {
    // Validate required fields
    const currentQ = form.questions[currentQuestion];
    if (currentQ.required && !answers[currentQ.id]) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, responda esta questão antes de continuar.",
        variant: "destructive",
      });
      return;
    }

    // Save to database
    console.log('Submitting answers:', answers);
    console.log('Submitting attachments:', attachments);
    toast({
      title: "Sucesso!",
      description: "Suas respostas foram enviadas com sucesso.",
    });
  };

  const renderQuestion = (question: Question) => {
    const value = answers[question.id];
    const attachment = attachments[question.id];

    return (
      <div className="space-y-6">
        {/* Main Question Input */}
        <div className="space-y-4">
          {(() => {
            switch (question.type) {
              case 'text':
                return (
                  <Input
                    value={value || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Digite sua resposta"
                    className="text-lg"
                  />
                );

              case 'textarea':
                return (
                  <Textarea
                    value={value || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Digite sua resposta"
                    rows={4}
                    className="text-lg"
                  />
                );

              case 'radio':
                return (
                  <RadioGroup
                    value={value || ''}
                    onValueChange={(val) => handleAnswerChange(question.id, val)}
                  >
                    {question.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                        <Label htmlFor={`${question.id}-${index}`} className="text-lg">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                );

              case 'checkbox':
                return (
                  <div className="space-y-3">
                    {question.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${question.id}-${index}`}
                          checked={value?.includes(option) || false}
                          onCheckedChange={(checked) => {
                            const currentValues = value || [];
                            if (checked) {
                              handleAnswerChange(question.id, [...currentValues, option]);
                            } else {
                              handleAnswerChange(question.id, currentValues.filter((v: string) => v !== option));
                            }
                          }}
                        />
                        <Label htmlFor={`${question.id}-${index}`} className="text-lg">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                );

              case 'select':
                return (
                  <Select value={value || ''} onValueChange={(val) => handleAnswerChange(question.id, val)}>
                    <SelectTrigger className="text-lg">
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options?.map((option, index) => (
                        <SelectItem key={index} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );

              default:
                return null;
            }
          })()}
        </div>

        {/* Attachment Section */}
        {question.allowAttachments && (
          <div className="border-t pt-4 mt-4">
            <div className="flex flex-col space-y-4">
              <h3 className="text-sm font-medium text-slate-700">Anexos</h3>
              
              <div className="flex flex-wrap gap-4">
                <div>
                  <input
                    type="file"
                    id={`file-${question.id}`}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileChange(question.id, e.target.files[0]);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById(`file-${question.id}`)?.click()}
                    className="flex items-center"
                  >
                    <Paperclip className="w-4 h-4 mr-2" />
                    Anexar arquivo
                  </Button>
                </div>
                
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCapturePhoto(question.id)}
                    className="flex items-center"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Capturar foto
                  </Button>
                </div>
              </div>

              {attachment && (
                <div className="mt-2">
                  <div className="bg-slate-50 border rounded p-2 flex items-center justify-between">
                    <div className="flex items-center">
                      <Paperclip className="w-4 h-4 text-slate-500 mr-2" />
                      <span className="text-sm truncate max-w-[200px]">{attachment.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFileChange(question.id, null)}
                      className="text-red-500 h-auto py-1 px-2"
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{form.title}</h1>
          <p className="text-slate-600">{form.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-8">
              <h3 className="font-semibold text-slate-800 mb-4">Navegação</h3>
              <div className="space-y-2">
                {form.questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => goToQuestion(index)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      index === currentQuestion
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : answers[question.id]
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Questão {index + 1}
                      </span>
                      {answers[question.id] && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div className="text-xs mt-1 truncate">
                      {question.title}
                    </div>
                  </button>
                ))}
              </div>

              {/* Progress */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                  <span>Progresso</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Current Question */}
          <div className="lg:col-span-3">
            <Card className="p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-blue-600">
                    Questão {currentQuestion + 1} de {totalQuestions}
                  </span>
                  {form.questions[currentQuestion].required && (
                    <span className="text-sm text-red-600">* Obrigatório</span>
                  )}
                </div>
                <h2 className="text-2xl font-semibold text-slate-800 mb-6">
                  {form.questions[currentQuestion].title}
                </h2>
              </div>

              <div className="mb-8">
                {renderQuestion(form.questions[currentQuestion])}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>

                {currentQuestion === totalQuestions - 1 ? (
                  <Button onClick={submitForm} className="bg-green-600 hover:bg-green-700">
                    <Check className="w-4 h-4 mr-2" />
                    Finalizar
                  </Button>
                ) : (
                  <Button onClick={nextQuestion}>
                    Próxima
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormViewer;
