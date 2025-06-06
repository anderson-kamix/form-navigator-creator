
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Plus, Users, Edit, Trash2, Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import CreateUserModal from './user-management/CreateUserModal';
import EditUserModal from './user-management/EditUserModal';
import DeleteUserDialog from './user-management/DeleteUserDialog';
import ChangePasswordModal from './user-management/ChangePasswordModal';

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
  created_at: string;
  updated_at: string;
}

const UserManagement = () => {
  const { isMasterAdmin, user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de usuários",
          variant: "destructive",
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar os usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  const getPermissionBadge = (user: UserProfile) => {
    if (user.user_type === 'master_admin') {
      return <Badge variant="destructive">Master Admin</Badge>;
    }

    switch (user.permission_level) {
      case 'admin':
        return <Badge variant="default">Admin</Badge>;
      case 'editor':
        return <Badge variant="secondary">Editor</Badge>;
      case 'viewer':
        return <Badge variant="outline">Visualizador</Badge>;
      default:
        return <Badge variant="outline">Visualizador</Badge>;
    }
  };

  const getPermissionDescription = (user: UserProfile) => {
    if (user.user_type === 'master_admin') {
      return 'Acesso total ao sistema';
    }

    const permissions = [];
    if (user.can_create_forms) permissions.push('Criar');
    if (user.can_edit_forms) permissions.push('Editar');
    if (user.can_delete_forms) permissions.push('Excluir');
    if (user.can_view_responses) permissions.push('Visualizar');

    return permissions.length > 0 ? permissions.join(', ') : 'Apenas visualização';
  };

  if (!isMasterAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Minha Conta</h1>
              <p className="text-gray-600">Gerencie suas informações pessoais</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Email</Label>
                <div className="mt-1 p-3 bg-gray-50 border rounded-md text-gray-900">
                  {currentUser?.email}
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button onClick={handleChangePassword} className="flex items-center space-x-2">
                  <Key className="w-4 h-4" />
                  <span>Alterar Senha</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        <ChangePasswordModal
          open={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-40 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
                  <p className="text-gray-600 mt-1">
                    Gerencie usuários e suas permissões no sistema
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={handleChangePassword} 
                  className="flex items-center space-x-2"
                >
                  <Key className="w-4 h-4" />
                  <span>Alterar Minha Senha</span>
                </Button>
                <Button onClick={handleCreateUser} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Novo Usuário</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Lista de Usuários</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Visualize e gerencie todos os usuários do sistema
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                  {users.length} {users.length === 1 ? 'usuário' : 'usuários'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
                <p className="text-gray-500 mb-6">Comece criando o primeiro usuário do sistema.</p>
                <Button onClick={handleCreateUser}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Usuário
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {users.map((user) => (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center">
                            <Users className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{user.email}</h3>
                              {getPermissionBadge(user)}
                              {!user.is_active && (
                                <Badge variant="outline" className="text-red-600 border-red-200">
                                  Inativo
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              Permissões: {getPermissionDescription(user)}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            disabled={user.user_type === 'master_admin'}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                            disabled={user.user_type === 'master_admin'}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <CreateUserModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={loadUsers}
        />

        <EditUserModal
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={loadUsers}
        />

        <DeleteUserDialog
          open={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={loadUsers}
        />

        <ChangePasswordModal
          open={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default UserManagement;
