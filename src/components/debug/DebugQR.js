import React from 'react';
// Importar usando importación por defecto
import qrGenerator from '../../utils/qrGenerator';

const DebugQR = () => {
  const testQR = () => {
    console.log('🧪 Probando generación de QR...');
    
    const testEmployee = {
      name: 'Empleado de Prueba',
      position: 'Desarrollador',
      department: 'Tecnología',
      qrCode: 'TEST123'
    };
    
    // Usar las funciones del objeto importado
    const qr = qrGenerator.generateQRCodeDataURL('TEST123');
    const credential = qrGenerator.generateCredentialImage(testEmployee);
    
    console.log('QR Data URL:', qr);
    console.log('Credencial Data URL:', credential);
    
    // Mostrar en el DOM
    const qrImg = document.createElement('img');
    qrImg.src = qr;
    qrImg.style.width = '200px';
    qrImg.style.border = '2px solid red';
    qrImg.style.margin = '10px';
    
    const credImg = document.createElement('img');
    credImg.src = credential;
    credImg.style.width = '400px';
    credImg.style.border = '2px solid blue';
    credImg.style.margin = '10px';
    
    document.body.appendChild(qrImg);
    document.body.appendChild(credImg);
  };

  return (
    <div style={{ padding: '20px', background: '#f0f0f0' }}>
      <button onClick={testQR} style={{ padding: '10px', background: 'red', color: 'white' }}>
        PROBAR QR
      </button>
    </div>
  );
};

export default DebugQR;