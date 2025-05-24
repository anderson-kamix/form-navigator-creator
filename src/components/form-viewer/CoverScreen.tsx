
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { FormCover } from '@/types/form';

interface CoverScreenProps {
  title: string;
  description?: string;
  cover?: FormCover;
  onStart: () => void;
}

export const CoverScreen: React.FC<CoverScreenProps> = ({ title, description, cover, onStart }) => {
  const coverData = cover || {
    title: title || "Formulário",
    description: description || "",
    buttonText: "Iniciar",
    alignment: "center" as 'left' | 'center'
  };

  return (
    <div className={`flex flex-col ${
      coverData.alignment === 'center' ? 'items-center text-center' : 'items-start text-left'
    } p-8`}>
      {coverData.coverImage && (
        <div className="mb-8 w-full max-h-64 overflow-hidden rounded-lg">
          <img 
            src={coverData.coverImage} 
            alt="Capa do formulário" 
            className="w-full object-cover"
          />
        </div>
      )}
      <h1 className="text-3xl font-bold text-slate-800 mb-4">
        {coverData.title}
      </h1>
      {coverData.description && (
        <p className="text-lg text-slate-600 mb-8 max-w-2xl">
          {coverData.description}
        </p>
      )}
      <Button 
        onClick={onStart}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-lg"
      >
        {coverData.buttonText || "Iniciar"}
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
};
