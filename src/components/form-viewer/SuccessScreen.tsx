
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, RefreshCw } from 'lucide-react';

interface SuccessScreenProps {
  onReset: () => void;
}

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-green-100 p-5 mb-6">
        <CheckCircle2 className="w-16 h-16 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Formulário Enviado!</h2>
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        Obrigado por dedicar seu tempo para responder nosso formulário. 
        Suas respostas foram registradas com sucesso.
      </p>
      <Button 
        className="bg-blue-600 hover:bg-blue-700 flex items-center" 
        onClick={onReset}
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Enviar novo formulário
      </Button>
    </div>
  );
};
