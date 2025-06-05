
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  user_type: 'master_admin' | 'user';
  permission_level: 'viewer' | 'editor' | 'admin' | 'master_admin';
  can_create_forms: boolean;
  can_edit_forms: boolean;
  can_delete_forms: boolean;
  can_view_responses: boolean;
  is_active: boolean;
}

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSuccess: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ open, onClose, user, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    permissionLevel: 'viewer' as 'viewer' | 'editor' | 'admin',
    canCreateForms: false,
    canEditForms: false,
    canDeleteForms: false,
    canViewResponses: true,
    isActive: true,
  });

  useEffect(() => {
    if (user && open) {
      setFormData({
        permissionLevel: user.permission_level as 'viewer' | 'editor' | 'admin',
        canCreateForms: user.can_create_forms,
        canEditForms: user.can_edit_forms,
        canDeleteForms: user.can_delete_forms,
        canViewResponses: user.can_view_responses,
        isActive: user.is_active,
      });
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          permission_level: formData.permissionLevel,
          can_create_forms: formData.canCreateForms,
          can_edit_forms: formData.canEditForms,
          can_delete_forms: formData.canDeleteForms,
          can_view_responses: formData.canViewResponses,
          is_active: formData.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Erro ao atualizar usuário:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o usuário",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Usuário atualizado",
        description: "As permissões do usuário foram atualizadas com sucesso",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao atualizar o usuário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionLevelChange = (level: 'viewer' | 'editor' | 'admin') => {
    setFormData(prev => {
      const newData = { ...prev, permissionLevel: level };
      
      // Set default permissions based on level
      if (level === 'admin') {
        newData.canCreateForms = true;
        newData.canEditForms = true;
        newData.canDeleteForms = true;
        newData.canViewResponses = true;
      } else if (level === 'editor') {
        newData.canCreateForms = true;
        newData.canEditForms = true;
        newData.canDeleteForms = false;
        newData.canViewResponses = true;
      } else { // viewer
        newData.canCreateForms = false;
        newData.canEditForms = false;
        newData.canDeleteForms = false;
        newData.canViewResponses = true;
      }
      
      return newData;
    });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {user.email}
              </div>
            </div>

            <div>
              <Label>Nível de Permissão</Label>
              <Select
                value={formData.permissionLevel}
                onValueChange={handlePermissionLevelChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Permissões Específicas</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canCreateForms"
                  checked={formData.canCreateForms}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, canCreateForms: !!checked }))
                  }
                />
                <Label htmlFor="canCreateForms" className="text-sm">
                  Pode criar formulários
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canEditForms"
                  checked={formData.canEditForms}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, canEditForms: !!checked }))
                  }
                />
                <Label htmlFor="canEditForms" className="text-sm">
                  Pode editar formulários
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canDeleteForms"
                  checked={formData.canDeleteForms}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, canDeleteForms: !!checked }))
                  }
                />
                <Label htmlFor="canDeleteForms" className="text-sm">
                  Pode excluir formulários
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="canViewResponses"
                  checked={formData.canViewResponses}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, canViewResponses: !!checked }))
                  }
                />
                <Label htmlFor="canViewResponses" className="text-sm">
                  Pode visualizar respostas
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, isActive: !!checked }))
                  }
                />
                <Label htmlFor="isActive" className="text-sm">
                  Usuário ativo
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
