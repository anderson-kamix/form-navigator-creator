
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface ResponseEmptyStateProps {
  formId: string;
}

const ResponseEmptyState: React.FC<ResponseEmptyStateProps> = ({ formId }) => {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="py-10 text-center">
        <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
        <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhuma resposta ainda</h3>
        <p className="text-slate-600 mb-6">Compartilhe seu formulário para começar a receber respostas.</p>
        <Button asChild>
          <Link to={`/forms/${formId}`}>Ver Formulário</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ResponseEmptyState;
