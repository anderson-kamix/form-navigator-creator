
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormResponse } from '@/types/response';
import { Form } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, FileBarChart } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const ResponseViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [currentResponseIndex, setCurrentResponseIndex] = useState(0);

  useEffect(() => {
    // Load form
    const storedForms = JSON.parse(localStorage.getItem('forms') || '[]');
    const currentForm = storedForms.find((f: Form) => f.id === id);
    setForm(currentForm || null);

    // Load responses
    const storedResponses = JSON.parse(localStorage.getItem(`responses_${id}`) || '[]');
    setResponses(storedResponses);
  }, [id]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewStatistics = () => {
    navigate(`/statistics/${id}`);
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentResponseIndex > 0) {
      setCurrentResponseIndex(currentResponseIndex - 1);
    } else if (direction === 'next' && currentResponseIndex < responses.length - 1) {
      setCurrentResponseIndex(currentResponseIndex + 1);
    }
  };

  const currentResponse = responses[currentResponseIndex];

  if (!form) return <div className="p-8">Formulário não encontrado</div>;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate(`/forms/${id}`)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{form.title}</h1>
              <p className="text-slate-600">Visualização de respostas</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleViewStatistics}>
            <FileBarChart className="h-4 w-4 mr-2" />
            Ver Estatísticas
          </Button>
        </div>

        {responses.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-600">Nenhuma resposta recebida ainda.</p>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-slate-600">
                Visualizando resposta {currentResponseIndex + 1} de {responses.length}
              </p>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleNavigation('prev')}
                  disabled={currentResponseIndex === 0}
                >
                  Anterior
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleNavigation('next')}
                  disabled={currentResponseIndex === responses.length - 1}
                >
                  Próxima
                </Button>
              </div>
            </div>

            <Card className="mb-6">
              <div className="p-4 border-b">
                <p className="text-sm text-slate-600">
                  Enviado em: {formatDate(currentResponse.submittedAt)}
                </p>
              </div>
              <div className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pergunta</TableHead>
                      <TableHead>Resposta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {form.sections.flatMap(section => 
                      section.questions.map(question => {
                        const answer = currentResponse.answers.find(
                          a => a.questionId === question.id
                        );
                        return (
                          <TableRow key={question.id}>
                            <TableCell className="font-medium">{question.title}</TableCell>
                            <TableCell>
                              {answer ? (
                                Array.isArray(answer.answer) 
                                  ? answer.answer.join(', ') 
                                  : answer.answer
                              ) : (
                                <span className="text-slate-400">Não respondido</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ResponseViewer;
