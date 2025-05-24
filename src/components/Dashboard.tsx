
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, BarChart3, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/types/form';

const Dashboard = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [stats, setStats] = useState({
    totalForms: 0,
    totalResponses: 0,
    completionRate: 0
  });

  useEffect(() => {
    // Carrega os formulários do localStorage
    const storedForms = JSON.parse(localStorage.getItem('forms') || '[]');
    setForms(storedForms);
    
    // Calcula estatísticas
    let totalResponses = 0;
    let formsWithResponses = 0;
    
    storedForms.forEach((form: Form) => {
      const responses = JSON.parse(localStorage.getItem(`responses_${form.id}`) || '[]');
      totalResponses += responses.length;
      if (responses.length > 0) formsWithResponses++;
    });
    
    const completionRate = storedForms.length > 0 
      ? Math.round((formsWithResponses / storedForms.length) * 100) 
      : 0;
      
    setStats({
      totalForms: storedForms.length,
      totalResponses,
      completionRate
    });
  }, []);

  // Ordena formulários por data de criação (mais recentes primeiro)
  const recentForms = [...forms]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);

  const statsItems = [
    { icon: FileText, label: 'Total de Formulários', value: stats.totalForms.toString(), color: 'bg-blue-500' },
    { icon: Users, label: 'Respostas Coletadas', value: stats.totalResponses.toString(), color: 'bg-green-500' },
    { icon: BarChart3, label: 'Taxa de Conclusão', value: `${stats.completionRate}%`, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h1>
        <p className="text-slate-600">Gerencie seus formulários e acompanhe as estatísticas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statsItems.map((stat, index) => {
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
        {recentForms.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-slate-600">Nenhum formulário encontrado. Crie seu primeiro formulário!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentForms.map((form) => {
              const responses = JSON.parse(localStorage.getItem(`responses_${form.id}`) || '[]');
              const questionCount = form.sections.reduce((total, section) => total + section.questions.length, 0);
              const formattedDate = new Date(form.createdAt).toLocaleDateString('pt-BR');
              
              return (
                <Card key={form.id} className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <Link to={`/forms/${form.id}`}>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {form.title}
                    </h3>
                    <div className="space-y-2 text-sm text-slate-600">
                      <p>{questionCount} questões</p>
                      <p>{responses.length} respostas</p>
                      <p>Criado em {formattedDate}</p>
                    </div>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
