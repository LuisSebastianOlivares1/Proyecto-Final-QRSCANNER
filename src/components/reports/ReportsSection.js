import React from 'react';
import { Download, FileText, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import { generateReport, getStatsSummary, generateDailyAttendanceReport } from '../../utils/reportGenerator';

const ReportsSection = ({ employees, attendanceRecords = [] }) => {
  const stats = getStatsSummary(employees, attendanceRecords);

  const handleDownloadReport = () => {
    generateReport(employees, attendanceRecords);
  };

  const handleDownloadDailyReport = () => {
    generateDailyAttendanceReport(attendanceRecords);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Generación de Informes</h2>
          <p className="text-gray-600 mt-2">Descargue informes personalizados de asistencia</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadDailyReport}
            className="flex items-center bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FileText className="h-5 w-5 mr-2" />
            Reporte Diario
          </button>
          <button
            onClick={handleDownloadReport}
            className="flex items-center bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Download className="h-5 w-5 mr-2" />
            Informe Completo
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
          <FileText className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Informe Completo</h3>
          <p className="text-gray-600 mb-4">
            Incluye todos los datos de empleados: nombres, puestos, departamentos, y estadísticas de asistencia.
          </p>
          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <Download className="h-4 w-4 mr-1" />
            Descargar ahora
          </button>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen Estadístico</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Total de empleados:
              </span>
              <span className="font-semibold text-gray-900">{stats.totalEmployees}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Empleados activos:
              </span>
              <span className="font-semibold text-green-600">{stats.activeEmployees}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                Escaneos hoy:
              </span>
              <span className="font-semibold text-blue-600">{stats.todayScans}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Escaneos exitosos:
              </span>
              <span className="font-semibold text-green-600">{stats.successfulScans}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center">
                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                Escaneos fallidos:
              </span>
              <span className="font-semibold text-red-600">{stats.failedScans}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Registros recientes */}
      {attendanceRecords.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Registros Recientes de Asistencia</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.slice(0, 10).map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{record.name}</div>
                      <div className="text-sm text-gray-500">{record.employeeId}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {record.department}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.status === 'success' ? 'EXITOSO' : 'FALLIDO'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsSection;