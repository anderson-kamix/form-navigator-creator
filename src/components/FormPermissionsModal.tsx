
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface User {
  id: string;
  email: string;
  user_type: 'master_admin' | 'user';
}

interface FormPermission {
  id: string;
  user_id: string;
  can_edit: boolean;
  can_view: boolean;
}

interface FormPermissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formId: string;
  formTitle: string;
}

const FormPermissionsModal: React.FC<FormPermissionsModalProps> = ({
  open,
  onOpenChange,
  formId,
  formTitle,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<FormPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();

  useEffect(() => {
    if (open) {
      loadUsersAndPermissions();
    }
  }, [open, formId]);

  const loadUsersAndPermissions = async () => {
    setLoading(true);
    try {
      // Carregar todos os usuários (exceto master admins)
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .neq('user_type', 'master_admin')
        .neq('id', userProfile?.id); // Excluir o próprio usuário

      if (usersError) throw usersError;

      // Carregar permissões existentes
      const { data: permissionsData, error: permissionsError } = await supabase
        .from('form_permissions')
        .select('*')
        .eq('form_id', formId);

      if (permissionsError) throw permissionsError;

      setUsers(usersData || []);
      setPermissions(permissionsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = async (userId: string, type: 'can_view' | 'can_edit', value: boolean) => {
    try {
      const existingPermission = permissions.find(p => p.user_id === userId);

      if (existingPermission) {
        // Atualizar permissão existente
        const { error } = await supabase
          .from('form_permissions')
          .update({ [type]: value })
          .eq('id', existingPermission.id);

        if (error) throw error;

        setPermissions(prev => prev.map(p => 
          p.id === existingPermission.id 
            ? { ...p, [type]: value }
            : p
        ));
      } else {
        // Criar nova permissão
        const { data, error } = await supabase
          .from('form_permissions')
          .insert({
            form_id: formId,
            user_id: userId,
            [type]: value,
            granted_by: userProfile?.id,
          })
          .select()
          .single();

        if (error) throw error;

        setPermissions(prev => [...prev, data]);
      }

      toast({
        title: "Sucesso",
        description: "Permissão atualizada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a permissão",
        variant: "destructive",
      });
    }
  };

  const getUserPermission = (userId: string, type: 'can_view' | 'can_edit') => {
    const permission = permissions.find(p => p.user_id === userId);
    return permission ? permission[type] : false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Permissões</DialogTitle>
          <DialogDescription>
            Configure quais usuários podem visualizar e editar o formulário "{formTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Nenhum usuário encontrado
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{user.email}</div>
                    <div className="text-sm text-gray-500">
                      Tipo: {user.user_type === 'user' ? 'Usuário' : 'Admin Master'}
                    </div>
                  </div>
                  <div className="flex space-x-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`view-${user.id}`}
                        checked={getUserPermission(user.id, 'can_view')}
                        onCheckedChange={(checked) => 
                          updatePermission(user.id, 'can_view', checked as boolean)
                        }
                      />
                      <label htmlFor={`view-${user.id}`} className="text-sm">
                        Visualizar
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${user.id}`}
                        checked={getUserPermission(user.id, 'can_edit')}
                        onCheckedChange={(checked) => 
                          updatePermission(user.id, 'can_edit', checked as boolean)
                        }
                      />
                      <label htmlFor={`edit-${user.id}`} className="text-sm">
                        Editar
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FormPermissionsModal;
