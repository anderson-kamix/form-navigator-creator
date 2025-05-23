
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Users, TrendingUp } from 'lucide-react';

const Statistics = () => {
  const [selectedForm, setSelectedForm] = useState('1');

  // Mock data - in real app, fetch from database
  const forms = [
    { id: '1', title: 'Pesquisa de Satisfação' },
    { id: '2', title: 'Avaliação de Produto' },
    { id: '3', title: 'Feedback de Evento' },
  ];

  const stats = {
    totalResponses: 234,
    completionRate: 87,
    averageTime: '4:32',
  };

  const questionStats = [
    {
      question: 'Como você avalia nosso atendimento?',
      data: [
        { name: 'Excelente', value: 89, percentage: 38 },
        { name: 'Bom', value: 72, percentage: 31 },
        { name: 'Regular', value: 45, percentage: 19 },
        { name: 'Ruim', value: 20, percentage: 9 },
        { name: 'Péssimo', value: 8, percentage: 3 },
      ],
    },
    {
      question: 'Com que frequência você usa nossos serviços?',
      data: [
        { name: 'Diariamente', value: 67, percentage: 29 },
        { name: 'Semanalmente', value: 89, percentage: 38 },
        { name: 'Mensalmente', value: 56, percentage: 24 },
        { name: 'Raramente', value: 22, percentage: 9 },
      ],
    },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Estatísticas</h1>
          <p className="text-slate-600">Análise detalhada das respostas dos formulários</p>
        </div>

        {/* Form Selector */}
        <Card className="p-6 mb-8">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-slate-700">
              Selecionar Formulário:
            </label>
            <Select value={selectedForm} onValueChange={setSelectedForm}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {forms.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total de Respostas</p>
                <p className="text-2xl font-bold text-slate-800">{stats.totalResponses}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-slate-800">{stats.completionRate}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Tempo Médio</p>
                <p className="text-2xl font-bold text-slate-800">{stats.averageTime}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Question Statistics */}
        <div className="space-y-8">
          {questionStats.map((questionStat, index) => (
            <Card key={index} className="p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">
                {questionStat.question}
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bar Chart */}
                <div>
                  <h4 className="text-sm font-medium text-slate-600 mb-4">Distribuição das Respostas</h4>
                  <ResponsiveContainer width="100%" height={300}>
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

                {/* Pie Chart */}
                <div>
                  <h4 className="text-sm font-medium text-slate-600 mb-4">Proporção Percentual</h4>
                  <ResponsiveContainer width="100%" height={300}>
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
