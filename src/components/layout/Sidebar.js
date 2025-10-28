import React from 'react';
import { Clock, FileText, UserPlus, Building, QrCode } from 'lucide-react';

const Sidebar = ({ currentPage, setCurrentPage, employees, setGeneratedCredential }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Clock },
    { id: 'scanner', label: 'Escanear QR', icon: QrCode },
    { id: 'employees', label: 'Empleados', icon: UserPlus },
    { id: 'reports', label: 'Informes', icon: FileText }
  ];

  const handleMenuClick = (pageId) => {
    setCurrentPage(pageId);
    setGeneratedCredential(null);
  };

  return (
    <nav className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                currentPage === item.id 
                  ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-l-4 border-indigo-600 shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
            <Building className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">Total Empleados</p>
              <p className="text-lg font-bold text-blue-700">{employees.length}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
            <QrCode className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">Sistema QR Activo</p>
              <p className="text-sm text-green-700">Listo para escanear</p>
            </div>
          </div>
        </div>
        
        {/* Información adicional */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            Sistema de Control de Ingreso
          </p>
          <p className="text-xs text-gray-500 text-center mt-1">
            Versión 2.0 con QR
          </p>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;