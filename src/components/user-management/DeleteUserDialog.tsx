
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  user_type: 'master_admin' | 'user';
}

interface DeleteUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSuccess: () => void;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ open, onClose, user, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // First delete the user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        console.error('Erro ao deletar perfil:', profileError);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o perfil do usuário",
          variant: "destructive",
        });
        return;
      }

      // Then delete the user from Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);

      if (authError) {
        console.error('Erro ao deletar usuário:', authError);
        toast({
          title: "Aviso",
          description: "Perfil excluído, mas o usuário ainda existe no sistema de autenticação",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Usuário excluído",
          description: "O usuário foi excluído com sucesso",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao excluir o usuário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o usuário <strong>{user.email}</strong>? 
            Esta ação não pode ser desfeita e o usuário perderá acesso ao sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserDialog;
