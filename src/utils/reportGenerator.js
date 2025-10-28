export const generateReport = (employees, attendanceRecords = []) => {
  const reportData = employees.map(emp => {
    // Contar registros de asistencia para este empleado
    const employeeRecords = attendanceRecords.filter(record => 
      record.employeeId === emp.qrCode || record.employeeId === emp.codigo_empleado
    );
    
    const successfulRecords = employeeRecords.filter(record => record.status === 'success');
    
    return {
      'Código Empleado': emp.qrCode || emp.codigo_empleado,
      'Nombre': emp.name,
      'Puesto': emp.position,
      'Departamento': emp.department,
      'Email': emp.email,
      'Estado': emp.status || 'activo',
      'Registros Exitosos': successfulRecords.length,
      'Registros Fallidos': employeeRecords.length - successfulRecords.length,
      'Total Registros': employeeRecords.length,
      'Último Registro': employeeRecords.length > 0 
        ? new Date(employeeRecords[0].timestamp).toLocaleString() 
        : 'Sin registros'
    };
  });
  
  const csvContent = "data:text/csv;charset=utf-8," 
    + "Código Empleado,Nombre,Puesto,Departamento,Email,Estado,Registros Exitosos,Registros Fallidos,Total Registros,Último Registro\n"
    + reportData.map(e => Object.values(e).join(",")).join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "reporte_asistencia_completo.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getStatsSummary = (employees, attendanceRecords = []) => {
  const today = new Date().toDateString();
  const todayRecords = attendanceRecords.filter(record => 
    new Date(record.timestamp).toDateString() === today
  );
  
  return {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(emp => emp.status === 'activo').length,
    punctualEmployees: employees.filter(emp => emp.tardiness === 0).length,
    lateEmployees: employees.filter(emp => emp.tardiness > 0).length,
    todayScans: todayRecords.length,
    successfulScans: todayRecords.filter(record => record.status === 'success').length,
    failedScans: todayRecords.filter(record => record.status === 'error').length,
    averageTardiness: employees.length > 0 
      ? Math.round(employees.reduce((acc, emp) => acc + (emp.tardiness || 0), 0) / employees.length)
      : 0
  };
};

// Generar reporte de asistencia diaria
export const generateDailyAttendanceReport = (attendanceRecords) => {
  const today = new Date().toDateString();
  const todayRecords = attendanceRecords.filter(record => 
    new Date(record.timestamp).toDateString() === today
  );
  
  const reportData = todayRecords.map(record => ({
    'Hora': new Date(record.timestamp).toLocaleTimeString(),
    'Empleado': record.name,
    'Código': record.employeeId,
    'Departamento': record.department,
    'Estado': record.status === 'success' ? 'EXITOSO' : 'FALLIDO',
    'Tipo': record.type || 'entrada',
    'Error': record.error || 'N/A'
  }));
  
  const csvContent = "data:text/csv;charset=utf-8," 
    + "Hora,Empleado,Código,Departamento,Estado,Tipo,Error\n"
    + reportData.map(e => Object.values(e).join(",")).join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `reporte_asistencia_${today.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default {
  generateReport,
  getStatsSummary,
  generateDailyAttendanceReport
};