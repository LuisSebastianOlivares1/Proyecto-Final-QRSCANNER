import React from 'react';
import { LogOut, QrCode } from 'lucide-react';

const Header = ({ currentUser, handleLogout }) => {
  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
              <QrCode className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Control de Ingreso QR</h1>
              <p className="text-sm text-gray-600">Sistema de asistencia inteligente</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="font-semibold text-gray-900 capitalize">{currentUser?.fullName}</p>
              <p className="text-sm text-gray-600">
                {currentUser?.role === 'administrativo' ? 'Administrativo' : 'Recursos Humanos'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <LogOut className="h-5 w-5 mr-1" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;