
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText, BarChart3 } from 'lucide-react';

interface ResponseHeaderProps {
  title: string;
  formId: string;
  responseCount: number;
  onExportCSV: () => void;
}

const ResponseHeader: React.FC<ResponseHeaderProps> = ({
  title,
  formId,
  responseCount,
  onExportCSV
}) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link to="/forms">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
          <p className="text-slate-600">
            {responseCount} {responseCount === 1 ? 'resposta recebida' : 'respostas recebidas'}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={onExportCSV} disabled={responseCount === 0}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/forms/${formId}`}>
            <FileText className="w-4 h-4 mr-2" />
            Ver Formulário
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/statistics/${formId}`}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Estatísticas
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ResponseHeader;
