
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ResponseHeaderProps {
  title: string;
  formId: string;
  responseCount: number;
  onExportCSV: () => void;
  onExportExcel: () => void;
}

const ResponseHeader: React.FC<ResponseHeaderProps> = ({
  title,
  formId,
  responseCount,
  onExportCSV,
  onExportExcel
}) => {
  const navigate = useNavigate();

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/forms')}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Formulários
            </Button>
            <div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary">
                  {responseCount} {responseCount === 1 ? 'resposta' : 'respostas'}
                </Badge>
                <Badge variant="outline">ID: {formId}</Badge>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {responseCount > 0 && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onExportCSV}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onExportExcel}
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Exportar Excel
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default ResponseHeader;
