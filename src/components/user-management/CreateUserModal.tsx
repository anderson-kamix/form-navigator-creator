import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    permissionLevel: 'viewer' as 'viewer' | 'editor' | 'admin',
    canCreateForms: false,
    canEditForms: false,
    canDeleteForms: false,
    canViewResponses: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create the user using sign up (they'll need to confirm email)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            created_by_admin: true
          }
        }
      });

      if (authError) {
        console.error('Erro ao criar usuário:', authError);
        toast({
          title: "Erro",
          description: authError.message || "Não foi possível criar o usuário",
          variant: "destructive",
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: "Erro",
          description: "Usuário não foi criado corretamente",
          variant: "destructive",
        });
        return;
      }

      // Wait a moment for the trigger to create the basic profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the user profile with the specific permissions
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          user_type: 'user',
          permission_level: formData.permissionLevel,
          can_create_forms: formData.canCreateForms,
          can_edit_forms: formData.canEditForms,
          can_delete_forms: formData.canDeleteForms,
          can_view_responses: formData.canViewResponses,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authData.user.id);

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
        toast({
          title: "Erro",
          description: "Usuário criado mas perfil não foi configurado corretamente",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Usuário criado",
        description: "O usuário foi criado com sucesso. Ele receberá um email de confirmação.",
      });

      // Reset form and close modal
      setFormData({
        email: '',
        password: '',
        permissionLevel: 'viewer',
        canCreateForms: false,
        canEditForms: false,
        canDeleteForms: false,
        canViewResponses: true,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao criar o usuário",
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                placeholder="usuario@exemplo.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                placeholder="••••••••"
                minLength={6}
              />
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
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserModal;
