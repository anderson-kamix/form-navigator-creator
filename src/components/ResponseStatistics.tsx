
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormResponse } from '@/types/response';
import { Form, Question } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, List } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

const ResponseStatistics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [stats, setStats] = useState<{
    totalResponses: number;
    questionStats: {
      questionId: string;
      questionTitle: string;
      questionType: string;
      data: { name: string; value: number; percentage: number }[];
    }[];
  }>({
    totalResponses: 0,
    questionStats: [],
  });

  useEffect(() => {
    // Load form
    const storedForms = JSON.parse(localStorage.getItem('forms') || '[]');
    const currentForm = storedForms.find((f: Form) => f.id === id);
    setForm(currentForm || null);

    // Load responses
    const storedResponses = JSON.parse(localStorage.getItem(`responses_${id}`) || '[]');
    setResponses(storedResponses);

    if (currentForm && storedResponses.length > 0) {
      generateStatistics(currentForm, storedResponses);
    }
  }, [id]);

  const generateStatistics = (form: Form, responses: FormResponse[]) => {
    const questions: Question[] = form.sections.flatMap(section => section.questions);
    
    const questionStats = questions.map(question => {
      // Skip text fields for charts (use only select, radio, checkbox)
      if (question.type === 'text' || question.type === 'textarea') {
        return {
          questionId: question.id,
          questionTitle: question.title,
          questionType: question.type,
          data: [],
        };
      }

      // For options questions, count occurrences
      const answerCounts: Record<string, number> = {};
      
      // Initialize counts for all options
      if (question.options) {
        question.options.forEach(option => {
          answerCounts[option] = 0;
        });
      }

      // Count answers
      responses.forEach(response => {
        const answer = response.answers.find(a => a.questionId === question.id);
        if (answer) {
          if (Array.isArray(answer.answer)) {
            // For checkbox questions
            answer.answer.forEach(option => {
              answerCounts[option] = (answerCounts[option] || 0) + 1;
            });
          } else {
            // For radio or select questions
            answerCounts[answer.answer] = (answerCounts[answer.answer] || 0) + 1;
          }
        }
      });

      // Convert to chart data format
      const data = Object.entries(answerCounts).map(([name, value]) => {
        const percentage = Math.round((value / responses.length) * 100);
        return {
          name,
          value,
          percentage,
        };
      });

      return {
        questionId: question.id,
        questionTitle: question.title,
        questionType: question.type,
        data,
      };
    });

    setStats({
      totalResponses: responses.length,
      questionStats,
    });
  };

  if (!form) return <div className="p-8">Formulário não encontrado</div>;

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
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
              <p className="text-slate-600">Estatísticas de respostas</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate(`/responses/${id}`)}>
            <List className="h-4 w-4 mr-2" />
            Ver Respostas
          </Button>
        </div>

        <Card className="mb-6 p-6">
          <h2 className="text-xl font-semibold mb-4">Resumo</h2>
          <p className="text-3xl font-bold text-blue-600">{stats.totalResponses} respostas</p>
        </Card>

        {responses.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-600">Nenhuma resposta recebida ainda.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {stats.questionStats.map((questionStat) => {
              // Skip text questions from visualization
              if (questionStat.questionType === 'text' || questionStat.questionType === 'textarea') {
                return null;
              }
              
              if (questionStat.data.length === 0) {
                return null;
              }

              return (
                <Card key={questionStat.questionId} className="p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-6">
                    {questionStat.questionTitle}
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Bar Chart */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-600 mb-4">Distribuição das Respostas</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={questionStat.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Pie Chart */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-600 mb-4">Proporção Percentual</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={questionStat.data}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percentage }) => `${name}: ${percentage}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {questionStat.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-slate-600 mb-3">Dados Detalhados</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-2 text-slate-600">Opção</th>
                            <th className="text-right py-2 text-slate-600">Respostas</th>
                            <th className="text-right py-2 text-slate-600">Percentual</th>
                          </tr>
                        </thead>
                        <tbody>
                          {questionStat.data.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="py-2 text-slate-800">{item.name}</td>
                              <td className="text-right py-2 text-slate-800">{item.value}</td>
                              <td className="text-right py-2 text-slate-800">{item.percentage}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseStatistics;
