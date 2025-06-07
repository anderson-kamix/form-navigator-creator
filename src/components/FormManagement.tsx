import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Share2, Copy, Eye, FileText, BarChart, List, Users } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import FormPermissionsModal from './FormPermissionsModal';

interface Form {
  id: string;
  title: string;
  description: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const FormManagement = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [responseCounts, setResponseCounts] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedFormForPermissions, setSelectedFormForPermissions] = useState<Form | null>(null);
  const { user, isMasterAdmin, isAdmin, canCreateForms, canEditForms, canDeleteForms } = useAuth();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      let query = supabase.from('forms').select('*');
      
      // Se não for master admin nem admin, carregar apenas formulários próprios
      if (!isMasterAdmin && !isAdmin) {
        query = query.eq('user_id', user?.id);
      }
      
      const { data: formsData, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setForms(formsData || []);
      
      // Carregar contagem de respostas para cada formulário do Supabase
      const counts: {[key: string]: number} = {};
      for (const form of formsData || []) {
        const { count, error: countError } = await supabase
          .from('form_responses')
          .select('*', { count: 'exact', head: true })
          .eq('form_id', form.id);

        if (!countError) {
          counts[form.id] = count || 0;
        } else {
          // Fallback para localStorage se Supabase falhar
          const localResponses = JSON.parse(localStorage.getItem(`responses_${form.id}`) || '[]');
          counts[form.id] = localResponses.length;
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

  const togglePublishStatus = async (formId: string) => {
    try {
      const form = forms.find(f => f.id === formId);
      if (!form) return;

      const newPublishedStatus = !form.published;
      
      const { error } = await supabase
        .from('forms')
        .update({ 
          published: newPublishedStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', formId);

      if (error) throw error;

      setForms(prev => prev.map(f => 
        f.id === formId 
          ? { ...f, published: newPublishedStatus, updated_at: new Date().toISOString() }
          : f
      ));

      toast({
        title: newPublishedStatus ? 'Formulário Publicado' : 'Formulário em Rascunho',
        description: newPublishedStatus
          ? 'O formulário agora está disponível para receber respostas.'
          : 'O formulário não está mais aceitando respostas.',
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do formulário",
        variant: "destructive",
      });
    }
  };

  const deleteForm = async (formId: string) => {
    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', formId);

      if (error) throw error;

      setForms(prev => prev.filter(f => f.id !== formId));
      toast({
        title: 'Formulário Excluído',
        description: 'O formulário foi removido permanentemente.',
      });
    } catch (error) {
      console.error('Erro ao excluir formulário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o formulário",
        variant: "destructive",
      });
    }
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getShareUrl = (formId: string) => {
    return `${window.location.origin}/forms/${formId}`;
  };

  const getEmbedCode = (formId: string) => {
    const shareUrl = getShareUrl(formId);
    const withLogo = "1";
    return `<iframe width="100%" height="850" 
src="${shareUrl}?with_logo=${withLogo}" frameborder="0" loading="lazy" sandbox="allow-scripts allow-top-navigation allow-forms allow-same-origin allow-popups" allowfullscreen>
</iframe>`;
  };

  const canEdit = (form: Form) => {
    return isMasterAdmin || (form.user_id === user?.id && canEditForms);
  };

  const canDelete = (form: Form) => {
    return isMasterAdmin || (form.user_id === user?.id && canDeleteForms);
  };

  const canManagePermissions = (form: Form) => {
    return form.user_id === user?.id;
  };

  const openPermissionsModal = (form: Form) => {
    setSelectedFormForPermissions(form);
    setPermissionsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Carregando formulários...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {isMasterAdmin || isAdmin ? 'Formulários' : 'Meus Formulários'}
          </h1>
          <p className="text-slate-600">
            {isMasterAdmin 
              ? 'Visualização completa de todos os formulários do sistema'
              : isAdmin
              ? 'Visualização de formulários como administrador'
              : 'Gerenciamento dos seus formulários e coleta de respostas'
            }
          </p>
        </div>
        {canCreateForms && (
          <Button asChild>
            <Link to="/forms/new">
              <FileText className="mr-2 h-4 w-4" />
              Criar Novo Formulário
            </Link>
          </Button>
        )}
      </div>

      {forms.length === 0 ? (
        <div className="text-center p-10 bg-slate-50 rounded-lg border border-slate-200">
          <FileText className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhum formulário encontrado</h3>
          <p className="text-slate-600 mb-6">
            {isMasterAdmin || isAdmin
              ? 'Ainda não há formulários criados no sistema.'
              : canCreateForms
              ? 'Você ainda não criou nenhum formulário. Crie seu primeiro formulário agora.'
              : 'Você não tem permissão para criar formulários ou ainda não há formulários disponíveis.'
            }
          </p>
          {canCreateForms && (
            <Button asChild>
              <Link to="/forms/new">Criar Novo Formulário</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Formulário</TableHead>
                <TableHead>Criador</TableHead>
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
                  <TableCell className="text-sm text-gray-600">
                    {isMasterAdmin || isAdmin ? (
                      form.user_id === user?.id ? 'Você' : 'Outro usuário'
                    ) : (
                      'Você'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={form.published}
                        onCheckedChange={() => togglePublishStatus(form.id)}
                        disabled={!canEdit(form)}
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
                  <TableCell>{formatDate(form.created_at)}</TableCell>
                  <TableCell>{formatDate(form.updated_at)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/forms/${form.id}`} title="Visualizar">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {canEdit(form) && (
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/forms/${form.id}/edit`} title="Editar">
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
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
                      {canManagePermissions(form) && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openPermissionsModal(form)}
                          title="Gerenciar Permissões"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                      )}
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
                              Compartilhe o link do formulário nas redes sociais ou copie o código para incorporar em seu site.
                            </SheetDescription>
                          </SheetHeader>
                          
                          <div className="mt-6">
                            <label className="text-sm font-medium">Link do Formulário</label>
                            <div className="flex mt-1.5">
                              <input 
                                type="text" 
                                readOnly 
                                value={selectedForm ? getShareUrl(selectedForm.id) : ""} 
                                className="flex-1 p-2 text-sm border rounded-l-md focus:outline-none"
                              />
                              <Button 
                                variant="default" 
                                className="rounded-l-none" 
                                onClick={() => copyToClipboard(selectedForm ? getShareUrl(selectedForm.id) : "")}
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
                                onClick={() => shareToSocialMedia('facebook', selectedForm ? getShareUrl(selectedForm.id) : "")}
                              >
                                <Facebook className="h-5 w-5 text-blue-600" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-full p-2" 
                                onClick={() => shareToSocialMedia('twitter', selectedForm ? getShareUrl(selectedForm.id) : "")}
                              >
                                <X className="h-5 w-5 text-black" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-full p-2" 
                                onClick={() => shareToSocialMedia('linkedin', selectedForm ? getShareUrl(selectedForm.id) : "")}
                              >
                                <Linkedin className="h-5 w-5 text-blue-700" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-full p-2" 
                                onClick={() => shareToSocialMedia('whatsapp', selectedForm ? getShareUrl(selectedForm.id) : "")}
                              >
                                <MessageCircleMore className="h-5 w-5 text-green-500" />
                              </Button>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                      {canDelete(form) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteForm(form.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedFormForPermissions && (
        <FormPermissionsModal
          open={permissionsModalOpen}
          onOpenChange={setPermissionsModalOpen}
          formId={selectedFormForPermissions.id}
          formTitle={selectedFormForPermissions.title}
        />
      )}
    </div>
  );
};

export default FormManagement;
