
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, BarChart3, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Form {
  id: string;
  title: string;
  description: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const Dashboard = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [responseCounts, setResponseCounts] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);
  const { user, isMasterAdmin } = useAuth();

  const loadForms = async () => {
    try {
      console.log('Carregando formulários do Supabase...');
      
      const { data: formsData, error } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar formulários:', error);
        throw error;
      }

      console.log('Formulários carregados:', formsData);
      setForms(formsData || []);
      
      // Carregar contagem de respostas para cada formulário
      const counts: {[key: string]: number} = {};
      if (formsData && formsData.length > 0) {
        for (const form of formsData) {
          const { count, error: countError } = await supabase
            .from('form_responses')
            .select('*', { count: 'exact', head: true })
            .eq('form_id', form.id);

          if (!countError) {
            counts[form.id] = count || 0;
          } else {
            console.error('Erro ao contar respostas para formulário', form.id, ':', countError);
            counts[form.id] = 0;
          }
        }
      }
      setResponseCounts(counts);
    } catch (error) {
      console.error('Erro ao carregar formulários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os formulários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadForms();
    }
  }, [user]);

  // Calcula estatísticas baseadas nos dados do Supabase
  const stats = {
    totalForms: forms.length,
    totalResponses: Object.values(responseCounts).reduce((sum, count) => sum + count, 0),
    completionRate: forms.length > 0 
      ? Math.round((Object.values(responseCounts).filter(count => count > 0).length / forms.length) * 100) 
      : 0
  };

  // Ordena formulários por data de criação (mais recentes primeiro) e pega os 3 primeiros
  const recentForms = [...forms]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  const statsItems = [
    { icon: FileText, label: 'Total de Formulários', value: stats.totalForms.toString(), color: 'bg-blue-500' },
    { icon: Users, label: 'Respostas Coletadas', value: stats.totalResponses.toString(), color: 'bg-green-500' },
    { icon: BarChart3, label: 'Taxa de Conclusão', value: `${stats.completionRate}%`, color: 'bg-purple-500' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Carregando dashboard...</div>
      </div>
    );
  }

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
            <Link to="/forms">
              <BarChart3 className="w-4 h-4 mr-2" />
              Ver Todos os Formulários
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Forms */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Formulários Recentes</h2>
        {recentForms.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-slate-600">
              {forms.length === 0 
                ? 'Nenhum formulário encontrado. Crie seu primeiro formulário!' 
                : 'Nenhum formulário recente encontrado.'
              }
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentForms.map((form) => {
              const responseCount = responseCounts[form.id] || 0;
              const formattedDate = formatDate(form.created_at);
              
              return (
                <Card key={form.id} className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <Link to={`/forms/${form.id}`}>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {form.title}
                    </h3>
                    <div className="space-y-2 text-sm text-slate-600">
                      <p>{form.description || 'Sem descrição'}</p>
                      <p>{responseCount} respostas</p>
                      <p>Criado em {formattedDate}</p>
                      <p className={`font-medium ${form.published ? 'text-green-600' : 'text-amber-600'}`}>
                        {form.published ? 'Publicado' : 'Rascunho'}
                      </p>
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
