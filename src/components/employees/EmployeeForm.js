import React from 'react';
import { Plus } from 'lucide-react';

const EmployeeForm = ({ newEmployee, setNewEmployee, handleAddEmployee, departments, positions }) => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Plus className="h-5 w-5 mr-2 text-indigo-600" />
        Agregar Nuevo Empleado
      </h3>
      <form onSubmit={handleAddEmployee} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
          <input
            type="text"
            value={newEmployee.name}
            onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            placeholder="Ingrese el nombre completo"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
          <input
            type="email"
            value={newEmployee.email}
            onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            placeholder="Ingrese el correo electrónico"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento *</label>
            <select
              value={newEmployee.department}
              onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              required
            >
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Puesto *</label>
            <select
              value={newEmployee.position}
              onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              required
            >
              {positions.map(position => (
                <option key={position.id} value={position.name}>{position.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              value={newEmployee.phone}
              onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="Ingrese el teléfono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input
              type="text"
              value={newEmployee.address}
              onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              placeholder="Ingrese la dirección"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
        >
          Generar Código QR y Credencial
        </button>
      </form>
    </div>
  );
};

export default EmployeeForm;