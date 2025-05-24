
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlignLeft, AlignCenter, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { FormCover } from '@/types/form';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface FormCoverProps {
  cover: FormCover;
  updateCover: (updates: Partial<FormCover>) => void;
}

const FormCoverComponent: React.FC<FormCoverProps> = ({ cover, updateCover }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateCover({ coverImage: event.target?.result as string });
        setImageError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="p-6 mb-6">
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="bg-green-100 text-green-600 p-1 rounded">
            <ImageIcon className="w-5 h-5" />
          </span>
          Capa do Formulário
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="coverTitle">Título</Label>
              <Input
                id="coverTitle"
                value={cover.title}
                onChange={(e) => updateCover({ title: e.target.value })}
                placeholder="Olá!"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="coverDescription">Descrição</Label>
              <Textarea
                id="coverDescription"
                value={cover.description || ''}
                onChange={(e) => updateCover({ description: e.target.value })}
                placeholder="Vamos começar um novo formulário..."
                className="mt-1"
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="buttonText">Texto do Botão</Label>
              <Input
                id="buttonText"
                value={cover.buttonText}
                onChange={(e) => updateCover({ buttonText: e.target.value })}
                placeholder="Vamos começar"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="block mb-2">Alinhar Texto</Label>
              <ToggleGroup 
                type="single" 
                value={cover.alignment} 
                onValueChange={(value) => {
                  if (value) updateCover({ alignment: value as 'left' | 'center' })
                }}
                className="border rounded-md p-1"
              >
                <ToggleGroupItem 
                  value="left" 
                  className={`${cover.alignment === 'left' ? 'bg-blue-100' : ''}`}
                >
                  <AlignLeft className="w-4 h-4 mr-1" />
                  <span className="sr-only">Alinhar à Esquerda</span>
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="center" 
                  className={`${cover.alignment === 'center' ? 'bg-blue-100' : ''}`}
                >
                  <AlignCenter className="w-4 h-4 mr-1" />
                  <span className="sr-only">Centralizar</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            
            <div>
              <Label htmlFor="coverImage" className="block mb-2">Imagem de Capa</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="coverImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-1"
                />
                {cover.coverImage && (
                  <Avatar className="h-12 w-12 rounded-md">
                    <AvatarImage 
                      src={cover.coverImage}
                      alt="Cover image" 
                      onError={() => setImageError(true)}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-md bg-slate-100 text-slate-400 text-xs">
                      Erro
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-sm uppercase text-slate-500 font-medium mb-4">Preview</h3>
            <div className={`p-4 bg-slate-50 rounded-lg min-h-[300px] flex flex-col ${
              cover.alignment === 'center' ? 'items-center text-center' : 'items-start text-left'
            }`}>
              {cover.coverImage && !imageError && (
                <div className="mb-6 w-full max-h-48 overflow-hidden rounded-lg">
                  <img 
                    src={cover.coverImage} 
                    alt="Cover" 
                    className="w-full object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              )}
              <h1 className="text-3xl font-bold text-slate-800 mb-3">
                {cover.title || 'Título do Formulário'}
              </h1>
              <p className="text-slate-600 mb-6">
                {cover.description || 'Descrição do seu formulário aparecerá aqui...'}
              </p>
              <Button className="bg-green-500 hover:bg-green-600">
                {cover.buttonText || 'Vamos começar'} 
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FormCoverComponent;
