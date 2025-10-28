import React from 'react';
import { Download, Eye, QrCode } from 'lucide-react';

const CredentialPreview = ({ generatedCredential, downloadImage }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-green-800">
          <Eye className="h-5 w-5 mr-2" />
          Vista Previa de Credencial
        </h3>
        <div className="bg-white rounded-xl p-4 text-center shadow-md">
          <img 
            src={generatedCredential.credentialImage} 
            alt="Credencial" 
            className="mx-auto mb-4 border-2 border-gray-200 rounded-lg shadow-sm"
          />
          <button
            onClick={() => downloadImage(generatedCredential.credentialImage, `credencial_${generatedCredential.employee.qrCode}.png`)}
            className="flex items-center justify-center mx-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar Credencial (PNG)
          </button>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
          <QrCode className="h-5 w-5 mr-2" />
          Código QR Generado
        </h3>
        <div className="bg-white rounded-xl p-4 text-center shadow-md">
          <img 
            src={generatedCredential.qrImage} 
            alt="Código QR" 
            className="mx-auto mb-4 border-2 border-gray-200 rounded-lg shadow-sm"
          />
          <button
            onClick={() => downloadImage(generatedCredential.qrImage, `qr_${generatedCredential.employee.qrCode}.png`)}
            className="flex items-center justify-center mx-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar QR (PNG)
          </button>
        </div>
      </div>
    </div>
  );
};

export default CredentialPreview;