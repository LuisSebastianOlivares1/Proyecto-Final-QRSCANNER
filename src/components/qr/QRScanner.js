import React, { useState } from 'react';
import { Camera, Scan, UserCheck } from 'lucide-react';
import QrScanner from 'react-qr-scanner';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const [isScanning, setIsScanning] = useState(true); // ✅ Iniciar escaneo automáticamente
  const [scanResult, setScanResult] = useState(null);

  const handleScan = (data) => {
    if (data?.text) {
      const dni = data.text.trim();
      setScanResult({ success: true, data: dni });
      
      // ✅ No detener el escaneo
      onScanSuccess({ dni });
    }
  };

  const handleError = (err) => {
    console.error('Error en cámara:', err);
    onScanError('Error accediendo a la cámara');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center mb-4">
        <Camera className="h-6 w-6 text-indigo-600 mr-2" />
        <h3 className="text-xl font-bold text-gray-900">Escáner de QR Personal</h3>
      </div>

      <div className="space-y-4">
        <div className="relative bg-gray-100 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
          {isScanning ? (
            <>
              <QrScanner
                delay={300}
                onError={handleError}
                onScan={handleScan}
                style={{ width: '100%', height: '100%' }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-green-500 rounded-lg animate-pulse">
                  <Scan className="h-12 w-12 text-green-500 mx-auto mt-4" />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Cámara lista para escanear</p>
            </div>
          )}
        </div>

        {/* Botón para detener escaneo (opcional) */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsScanning(false)}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700"
          >
            Detener Escaneo
          </button>
        </div>

        {scanResult && (
          <div className={`p-4 rounded-lg ${scanResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center">
              {scanResult.success ? (
                <>
                  <UserCheck className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">QR escaneado: {scanResult.data}</span>
                </>
              ) : (
                <span className="text-red-800 font-medium">{scanResult.message}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;