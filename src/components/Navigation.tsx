
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, BarChart3, Home, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';

const Navigation = () => {
  const location = useLocation();
  const { user, userProfile, signOut, isMasterAdmin } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-blue-600">
                Sistema de Formulários
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className={`${
                  isActive('/dashboard')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              <Link
                to="/forms"
                className={`${
                  isActive('/forms')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                <FileText className="w-4 h-4 mr-2" />
                Formulários
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Olá, {user?.email}
              </span>
              {isMasterAdmin && (
                <Badge variant="secondary" className="flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin Master
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
