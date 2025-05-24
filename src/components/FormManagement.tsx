
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Share2, Copy, Eye, FileText, BarChart, List } from 'lucide-react';
import { Form } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Badge
} from '@/components/ui/badge';
import { Facebook, Linkedin, X, Share, MessageCircleMore } from 'lucide-react';

const FormManagement = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [responseCounts, setResponseCounts] = useState<{[key: string]: number}>({});

  useEffect(() => {
    // Carregar formulários do localStorage
    const storedForms = JSON.parse(localStorage.getItem('forms') || '[]');
    setForms(storedForms);
    
    // Carregar contagem de respostas para cada formulário
    const counts: {[key: string]: number} = {};
    storedForms.forEach((form: Form) => {
      const responses = JSON.parse(localStorage.getItem(`responses_${form.id}`) || '[]');
      counts[form.id] = responses.length;
    });
    setResponseCounts(counts);
  }, []);

  const togglePublishStatus = (formId: string) => {
    const updatedForms = forms.map(form => {
      if (form.id === formId) {
        return {
          ...form,
          published: !form.published,
          updatedAt: new Date()
        };
      }
      return form;
    });

    setForms(updatedForms);
    localStorage.setItem('forms', JSON.stringify(updatedForms));

    const form = updatedForms.find(f => f.id === formId);
    toast({
      title: form?.published ? 'Formulário Publicado' : 'Formulário em Rascunho',
      description: form?.published
        ? 'O formulário agora está disponível para receber respostas.'
        : 'O formulário não está mais aceitando respostas.',
    });
  };

  const deleteForm = (formId: string) => {
    const updatedForms = forms.filter(form => form.id !== formId);
    setForms(updatedForms);
    localStorage.setItem('forms', JSON.stringify(updatedForms));
    toast({
      title: 'Formulário Excluído',
      description: 'O formulário foi removido permanentemente.',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Link Copiado',
      description: 'O link do formulário foi copiado para a área de transferência.',
    });
  };

  const shareToSocialMedia = (platform: string, url: string) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`;
        break;
      default:
        break;
    }
    
    window.open(shareUrl, '_blank');
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getEmbedCode = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    if (!form) return '';
    
    const withLogo = "1"; // Opção para mostrar logo
    return `<iframe width="100%" height="850" 
src="${form.shareUrl}?with_logo=${withLogo}" frameborder="0" loading="lazy" sandbox="allow-scripts allow-top-navigation allow-forms allow-same-origin allow-popups" allowfullscreen>
</iframe>`;
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Meus Formulários</h1>
          <p className="text-slate-600">Gerenciamento dos seus formulários e coleta de respostas</p>
        </div>
        <Button asChild>
          <Link to="/forms/new">
            <FileText className="mr-2 h-4 w-4" />
            Criar Novo Formulário
          </Link>
        </Button>
      </div>

      {forms.length === 0 ? (
        <div className="text-center p-10 bg-slate-50 rounded-lg border border-slate-200">
          <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhum formulário encontrado</h3>
          <p className="text-slate-600 mb-6">Você ainda não criou nenhum formulário. Crie seu primeiro formulário agora.</p>
          <Button asChild>
            <Link to="/forms/new">Criar Novo Formulário</Link>
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Formulário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Respostas</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell className="font-medium">{form.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={form.published}
                        onCheckedChange={() => togglePublishStatus(form.id)}
                      />
                      <span className={form.published ? "text-green-600" : "text-amber-600"}>
                        {form.published ? "Publicado" : "Rascunho"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-semibold">
                      {responseCounts[form.id] || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(form.createdAt)}</TableCell>
                  <TableCell>{formatDate(form.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/forms/${form.id}`} title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/forms/${form.id}/edit`} title="Editar">
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/responses/${form.id}`} title="Ver Respostas">
                          <List className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/statistics/${form.id}`} title="Ver Estatísticas">
                          <BarChart className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedForm(form)}
                            disabled={!form.published}
                            title="Compartilhar"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Compartilhar</SheetTitle>
                            <SheetDescription>
                              Compartilhe o link do seu formulário nas redes sociais ou copie o código para incorporar em seu site.
                            </SheetDescription>
                          </SheetHeader>
                          
                          <div className="mt-6">
                            <label className="text-sm font-medium">Link do Formulário</label>
                            <div className="flex mt-1.5">
                              <input 
                                type="text" 
                                readOnly 
                                value={selectedForm?.shareUrl || ""} 
                                className="flex-1 p-2 text-sm border rounded-l-md focus:outline-none"
                              />
                              <Button 
                                variant="default" 
                                className="rounded-l-none" 
                                onClick={() => copyToClipboard(selectedForm?.shareUrl || "")}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copiar Link
                              </Button>
                            </div>
                          </div>

                          <div className="mt-6">
                            <h4 className="text-sm font-medium mb-2">Incorporar em seu site</h4>
                            <div className="bg-slate-900 text-slate-100 p-4 rounded-md">
                              <code className="text-xs break-all whitespace-pre-wrap">
                                {getEmbedCode(selectedForm?.id || "")}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => copyToClipboard(getEmbedCode(selectedForm?.id || ""))}
                                className="mt-2 text-white hover:text-white hover:bg-slate-800"
                              >
                                <Copy className="h-3.5 w-3.5 mr-1" />
                                Copiar código
                              </Button>
                            </div>
                          </div>

                          <div className="mt-6">
                            <h4 className="text-sm font-medium mb-3">Compartilhar nas Redes Sociais</h4>
                            <div className="flex space-x-3">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-full p-2" 
                                onClick={() => shareToSocialMedia('facebook', selectedForm?.shareUrl || "")}
                              >
                                <Facebook className="h-5 w-5 text-blue-600" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-full p-2" 
                                onClick={() => shareToSocialMedia('twitter', selectedForm?.shareUrl || "")}
                              >
                                <X className="h-5 w-5 text-black" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-full p-2" 
                                onClick={() => shareToSocialMedia('linkedin', selectedForm?.shareUrl || "")}
                              >
                                <Linkedin className="h-5 w-5 text-blue-700" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-full p-2" 
                                onClick={() => shareToSocialMedia('whatsapp', selectedForm?.shareUrl || "")}
                              >
                                <MessageCircleMore className="h-5 w-5 text-green-500" />
                              </Button>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteForm(form.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default FormManagement;
