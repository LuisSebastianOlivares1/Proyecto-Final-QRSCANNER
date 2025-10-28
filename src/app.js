import React, { useState, useEffect } from 'react';
import Login from './components/auth/Login';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import StatsCards from './components/dashboard/StatsCards';
import RecentActivity from './components/dashboard/RecentActivity';
import EmployeeForm from './components/employees/EmployeeForm';
import EmployeeList from './components/employees/EmployeeList';
import CredentialPreview from './components/employees/CredentialPreview';
import ReportsSection from './components/reports/ReportsSection';
import QRScanner from './components/qr/QRScanner';
import { apiService } from './services/api';
import { generateRealQRCode, generateRealCredential } from './utils/realQRGenerator';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmployee, setNewEmployee] = useState({ 
    name: '', 
    email: '', 
    position: '', 
    department: '', 
    phone: '', 
    address: '',
    dni: ''
  });
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [generatedCredential, setGeneratedCredential] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [scanMode, setScanMode] = useState('entrada'); // 'entrada' o 'salida'

  // Cargar datos iniciales
  useEffect(() => {
    if (currentUser) {
      loadInitialData();
    }
  }, [currentUser]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando datos iniciales...');
      
      const [employeesData, departmentsData, positionsData] = await Promise.all([
        apiService.getEmployees(),
        apiService.getDepartments(),
        apiService.getPositions()
      ]);
      
      console.log('✅ Empleados cargados:', employeesData.length);
      console.log('✅ Departamentos cargados:', departmentsData.length);
      console.log('✅ Puestos cargados:', positionsData.length);
      
      setEmployees(employeesData);
      setDepartments(departmentsData);
      setPositions(positionsData);
      
      if (departmentsData.length > 0 && !newEmployee.department) {
        setNewEmployee(prev => ({ ...prev, department: departmentsData[0].name }));
      }
      
      if (positionsData.length > 0 && !newEmployee.position) {
        setNewEmployee(prev => ({ ...prev, position: positionsData[0].name }));
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      alert('Error al cargar datos. Verifica que el servidor esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await apiService.login(loginForm.username, loginForm.password);
      console.log('✅ Login exitoso:', user);
      setCurrentUser(user);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('❌ Login error:', error);
      alert('Credenciales inválidas o error de conexión. Use: admin/admin123');
    }
  };

  const handleLogout = () => {
    console.log('🚪 Cerrando sesión...');
    apiService.logout();
    setCurrentUser(null);
    setCurrentPage('login');
    setLoginForm({ username: '', password: '' });
    setGeneratedCredential(null);
    setAttendanceRecords([]);
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (newEmployee.name && newEmployee.email && newEmployee.position && newEmployee.department && newEmployee.dni) {
      try {
        const createdEmployee = await apiService.createEmployee(newEmployee);
        const updatedEmployees = await apiService.getEmployees();
        setEmployees(updatedEmployees);
        
        const credentialImage = await generateRealCredential(createdEmployee);
        const qrImage = await generateRealQRCode({
          dni: createdEmployee.dni,
          name: createdEmployee.name,
          department: createdEmployee.department,
          type: 'attendance'
        });
        
        if (!credentialImage || !qrImage) {
          console.error('❌ Error: No se generaron las imágenes');
          alert('Error generando credenciales. Verifica la consola.');
          return;
        }
        
        setGeneratedCredential({
          employee: createdEmployee,
          credentialImage: credentialImage,
          qrImage: qrImage
        });
        
        setNewEmployee({ 
          name: '', 
          email: '', 
          position: positions[0]?.name || '', 
          department: departments[0]?.name || '', 
          phone: '', 
          address: '',
          dni: ''
        });
        
        console.log('🎉 Proceso completado exitosamente');
        
      } catch (error) {
        console.error('❌ Error creando empleado:', error);
        alert('Error al crear empleado. Verifica los datos e intenta nuevamente.');
      }
    } else {
      alert('Por favor, complete todos los campos obligatorios.');
    }
  };

  const handleScanSuccess = async (scanData) => {
    const dni = scanData.dni;
    const employee = employees.find(emp => emp.dni === dni);
    if (!employee) {
      alert('❌ Empleado no encontrado');
      return;
    }

    try {
      await apiService.registerAttendance({
        dni: dni,
        tipoRegistro: scanMode,
        latitud: null,
        longitud: null,
        direccionIp: 'web-app',
        dispositivo: navigator.userAgent.substring(0, 100)
      });

      alert(`✅ ${scanMode === 'entrada' ? 'Entrada' : 'Salida'} registrada para ${employee.name}`);
      
      const updated = await apiService.getEmployees();
      setEmployees(updated);
    } catch (error) {
      alert('❌ Error al registrar asistencia');
    }
  };

  const handleScanError = (error) => {
    console.error('❌ Error en escaneo:', error);
    alert(`Error en escaneo: ${error}`);
  };

  const downloadImage = (dataUrl, filename) => {
    if (!dataUrl) {
      console.error('❌ No hay data URL para descargar');
      alert('Error: No se puede descargar la imagen');
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('✅ Descarga iniciada');
    } catch (error) {
      console.error('❌ Error en descarga:', error);
      alert('Error al descargar la imagen');
    }
  };

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Cargando datos...</div>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <StatsCards employees={employees} attendanceRecords={attendanceRecords} />
            <RecentActivity employees={employees} />
          </div>
        );

      case 'scanner':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Registro de Asistencia por QR
              </h2>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setScanMode('entrada')}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    scanMode === 'entrada'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Registrar Entrada
                </button>
                <button
                  onClick={() => setScanMode('salida')}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    scanMode === 'salida'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Registrar Salida
                </button>
              </div>
              <QRScanner 
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
              />
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Registros de Hoy
                </h3>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {employees.filter(emp => emp.entryTime).length} registros
                </span>
              </div>
              
              {employees.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {employees.map((emp) => (
                    <div key={emp.id} className="flex justify-between items-center p-4 rounded-lg border bg-gray-50">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{emp.name}</p>
                        <p className="text-sm text-gray-600">{emp.dni} • {emp.department}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">
                          {emp.entryTime || '—'}
                        </p>
                        <p className="text-sm font-medium text-red-600">
                          {emp.exitTime || '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay registros de asistencia hoy</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'reports':
        return <ReportsSection employees={employees} attendanceRecords={attendanceRecords} />;

      case 'employees':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h2>
                <div className="text-sm text-gray-600">
                  Total: {employees.length} empleados registrados
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <EmployeeForm 
                  newEmployee={newEmployee}
                  setNewEmployee={setNewEmployee}
                  handleAddEmployee={handleAddEmployee}
                  departments={departments}
                  positions={positions}
                />
                
                {generatedCredential ? (
                  <CredentialPreview 
                    generatedCredential={generatedCredential}
                    downloadImage={downloadImage}
                  />
                ) : (
                  <EmployeeList employees={employees} />
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (currentPage === 'login') {
    return (
      <Login 
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        handleLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentUser={currentUser} handleLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 flex-shrink-0">
            <Sidebar 
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              employees={employees}
              setGeneratedCredential={setGeneratedCredential}
            />
          </div>

          <div className="flex-1">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
}