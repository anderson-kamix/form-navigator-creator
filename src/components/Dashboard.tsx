
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, BarChart3, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [forms] = useState([
    {
      id: 1,
      title: 'Pesquisa de Satisfação',
      questions: 15,
      responses: 234,
      created: '2024-05-20',
    },
    {
      id: 2,
      title: 'Avaliação de Produto',
      questions: 8,
      responses: 67,
      created: '2024-05-18',
    },
    {
      id: 3,
      title: 'Feedback de Evento',
      questions: 12,
      responses: 145,
      created: '2024-05-15',
    },
  ]);

  const stats = [
    { icon: FileText, label: 'Total de Formulários', value: '12', color: 'bg-blue-500' },
    { icon: Users, label: 'Respostas Coletadas', value: '1,234', color: 'bg-green-500' },
    { icon: BarChart3, label: 'Taxa de Conclusão', value: '87%', color: 'bg-purple-500' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <p className="text-slate-600">Gerencie seus formulários e acompanhe as estatísticas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mr-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Ações Rápidas</h2>
        <div className="flex space-x-4">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link to="/forms/new">
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo Formulário
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/statistics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Ver Estatísticas
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Forms */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Formulários Recentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <Card key={form.id} className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <Link to={`/forms/${form.id}`}>
                <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {form.title}
                </h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>{form.questions} questões</p>
                  <p>{form.responses} respostas</p>
                  <p>Criado em {new Date(form.created).toLocaleDateString('pt-BR')}</p>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
