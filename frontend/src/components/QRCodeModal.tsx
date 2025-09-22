import React from 'react';
import { QrCode, X, Copy, Download } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  salaryAmount: number;
  employeeName: string;
  campaignName: string;
  claimUrl: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  salaryAmount,
  employeeName,
  campaignName,
  claimUrl
}) => {
  if (!isOpen) return null;

  // Generate QR code data URL (in real implementation, use a QR library like qrcode.js)
  const qrCodeData = `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <rect x="10" y="10" width="20" height="20" fill="black"/>
      <rect x="40" y="10" width="20" height="20" fill="black"/>
      <rect x="70" y="10" width="20" height="20" fill="black"/>
      <rect x="10" y="40" width="20" height="20" fill="black"/>
      <rect x="70" y="40" width="20" height="20" fill="black"/>
      <rect x="10" y="70" width="20" height="20" fill="black"/>
      <rect x="40" y="70" width="20" height="20" fill="black"/>
      <rect x="70" y="70" width="20" height="20" fill="black"/>
      <text x="100" y="100" font-family="Arial" font-size="12" fill="black">
        Salary: ${salaryAmount} STX
      </text>
      <text x="100" y="120" font-family="Arial" font-size="10" fill="black">
        ${employeeName}
      </text>
      <text x="100" y="140" font-family="Arial" font-size="8" fill="black">
        ${campaignName}
      </text>
    </svg>
  `)}`;

  const copyClaimUrl = () => {
    navigator.clipboard.writeText(claimUrl);
    alert('Claim URL copied to clipboard!');
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = `salary-qr-${employeeName.replace(/\s+/g, '-')}.svg`;
    link.href = qrCodeData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex', zIndex: 1000 }}>
      <div className="qr-modal simple-glass-card" style={{ 
        maxWidth: '400px', 
        width: '90%',
        padding: '24px',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="modal-header" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={24} color="#10b981" />
            <h3 style={{ margin: 0, color: '#1f2937' }}>Salary Claim QR Code</h3>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              color: '#6b7280'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            marginBottom: '16px',
            display: 'inline-block'
          }}>
            <img 
              src={qrCodeData} 
              alt="Salary Claim QR Code"
              style={{ width: '200px', height: '200px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>{employeeName}</h4>
            <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '14px' }}>{campaignName}</p>
            <p style={{ margin: 0, color: '#10b981', fontSize: '18px', fontWeight: 'bold' }}>
              {salaryAmount} STX
            </p>
          </div>

          <div style={{
            background: '#f9fafb',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280' }}>
              Claim URL:
            </p>
            <p style={{ 
              margin: 0, 
              fontSize: '12px', 
              color: '#1f2937', 
              wordBreak: 'break-all',
              fontFamily: 'monospace'
            }}>
              {claimUrl}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={copyClaimUrl}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151'
              }}
            >
              <Copy size={16} />
              Copy URL
            </button>
            <button
              onClick={downloadQR}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#10b981',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'white'
              }}
            >
              <Download size={16} />
              Download QR
            </button>
          </div>
        </div>

        <div style={{
          padding: '12px',
          background: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #f59e0b',
          marginTop: '16px'
        }}>
          <p style={{ 
            margin: 0, 
            fontSize: '12px', 
            color: '#92400e',
            textAlign: 'center'
          }}>
            <strong>Note:</strong> Employees can scan this QR code or use the URL to claim their salary directly from the blockchain.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
