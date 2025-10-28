import QRCode from 'qrcode';

// Generar QR real y escaneable CON DATOS DEL EMPLEADO REAL
export const generateRealQRCode = async (employee) => {
  try {
    console.log('🔧 Generando QR personalizado para:', employee.name);
    
    // Estructurar datos específicos del empleado para el QR
    const qrData = {
      employeeId: employee.qrCode || employee.codigo_empleado,
      name: employee.name,
      position: employee.position,
      department: employee.department,
      email: employee.email,
      timestamp: new Date().toISOString(),
      type: 'attendance',
      system: 'ControlIngresoQR'
    };
    
    const qrString = JSON.stringify(qrData);
    
    // Generar QR real
    const qrDataURL = await QRCode.toDataURL(qrString, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });
    
    console.log('✅ QR personalizado generado exitosamente para:', employee.name);
    console.log('📱 Datos en QR:', qrData);
    
    return qrDataURL;
    
  } catch (error) {
    console.error('❌ Error generando QR personalizado:', error);
    return null;
  }
};

// Generar credencial con QR personalizado
export const generateRealCredential = async (employee) => {
  try {
    console.log('🔧 Generando credencial personalizada para:', employee.name);
    
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 280;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('No se pudo obtener el contexto del canvas');
    }
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#4f46e5');
    gradient.addColorStop(1, '#7c3aed');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // White content area
    ctx.fillStyle = 'white';
    ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);
    
    // Company header
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(20, 20, canvas.width - 40, 50);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EMPRESA TECNOLOGÍA S.A.', canvas.width / 2, 50);
    
    // Employee info
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('CREDENCIAL DE EMPLEADO', 30, 90);
    
    ctx.font = '14px Arial';
    ctx.fillText(`Nombre: ${employee.name}`, 30, 120);
    ctx.fillText(`Puesto: ${employee.position}`, 30, 145);
    ctx.fillText(`Departamento: ${employee.department}`, 30, 170);
    ctx.fillText(`Código: ${employee.qrCode || employee.codigo_empleado}`, 30, 195);
    ctx.fillText(`Email: ${employee.email}`, 30, 220);
    
    // Generar QR personalizado para la credencial
    const qrImage = await generateRealQRCode(employee);
    
    if (qrImage) {
      // Crear imagen del QR
      const qrImg = new Image();
      qrImg.src = qrImage;
      
      // Esperar a que cargue la imagen
      await new Promise((resolve) => {
        qrImg.onload = resolve;
      });
      
      // Dibujar QR en la credencial
      ctx.drawImage(qrImg, 260, 90, 110, 110);
      
      // Texto debajo del QR
      ctx.fillStyle = '#4f46e5';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CÓDIGO PERSONAL', 315, 210);
    } else {
      // Fallback si no se puede generar el QR
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(260, 90, 110, 110);
      ctx.fillStyle = '#4f46e5';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('QR NO DISPONIBLE', 315, 155);
    }
    
    console.log('✅ Credencial personalizada generada exitosamente');
    return canvas.toDataURL('image/png');
    
  } catch (error) {
    console.error('❌ Error generando credencial personalizada:', error);
    return null;
  }
};

// Función para simular el escaneo del QR CON DATOS REALES
export const simulateQRScan = (employeeData) => {
  return new Promise((resolve) => {
    console.log('📱 Simulando escaneo de QR para:', employeeData.name);
    
    setTimeout(() => {
      // Usar los datos REALES del empleado en lugar de datos fijos
      const scanResult = {
        success: true,
        data: {
          employeeId: employeeData.qrCode || employeeData.codigo_empleado,
          name: employeeData.name,
          position: employeeData.position,
          department: employeeData.department,
          email: employeeData.email,
          timestamp: new Date().toISOString(),
          type: 'attendance'
        },
        message: `QR de ${employeeData.name} escaneado exitosamente`
      };
      
      console.log('✅ Escaneo simulado con datos reales:', scanResult);
      resolve(scanResult);
    }, 1000);
  });
};

export default {
  generateRealQRCode,
  generateRealCredential,
  simulateQRScan
};