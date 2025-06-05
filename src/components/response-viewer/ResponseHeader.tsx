
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileSpreadsheet, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ResponseHeaderProps {
  title: string;
  formId: string;
  responseCount: number;
  onExportExcel: () => void;
}

const ResponseHeader: React.FC<ResponseHeaderProps> = ({
  title,
  formId,
  responseCount,
  onExportExcel
}) => {
  const navigate = useNavigate();

  return (
    <Card className="mb-6 bg-white shadow-sm border-0 rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/forms')}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Formulários
            </Button>
            <div className="h-8 w-px bg-blue-200"></div>
            <div>
              <CardTitle className="text-2xl text-gray-900 font-bold">{title}</CardTitle>
              <div className="flex items-center space-x-3 mt-3">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-medium">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  {responseCount} {responseCount === 1 ? 'resposta' : 'respostas'}
                </Badge>
                <Badge variant="outline" className="border-blue-200 text-blue-700">
                  ID: {formId.slice(0, 8)}...
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {responseCount > 0 && (
              <Button 
                variant="default" 
                size="sm"
                onClick={onExportExcel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Exportar Excel
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default ResponseHeader;
