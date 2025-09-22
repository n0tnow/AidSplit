import React, { useState, useEffect } from 'react';
import { Terminal, Copy, ExternalLink, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface MintRequest {
  contractAddress: string;
  contractName: string;
  functionName: string;
  args: {
    recipient: string;
    campaignId: number;
    receiptType: string;
    amount: number;
    campaignName: string;
    isSoulbound: boolean;
  };
  metadataUrl: string;
  network: string;
  timestamp: string;
  status: 'pending' | 'minted' | 'failed';
}

const ManualMintPage: React.FC = () => {
  const [mintRequests, setMintRequests] = useState<MintRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<MintRequest | null>(null);

  useEffect(() => {
    loadMintRequests();
  }, []);

  const loadMintRequests = () => {
    try {
      const requests = JSON.parse(localStorage.getItem('nft-mint-requests') || '[]');
      setMintRequests(requests);
    } catch (error) {
      console.error('Error loading mint requests:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateClarityCommand = (request: MintRequest) => {
    return `(contract-call? '${request.contractAddress}.${request.contractName} ${request.functionName}
  '${request.args.recipient}
  u${request.args.campaignId}
  "${request.args.receiptType}"
  u${request.args.amount}
  "${request.args.campaignName}"
  ${request.args.isSoulbound})`;
  };

  const generateStacksCliCommand = (request: MintRequest) => {
    return `stx call_contract_func ${request.contractAddress} ${request.contractName} ${request.functionName} \\
  --arg-type principal --arg-value ${request.args.recipient} \\
  --arg-type uint --arg-value ${request.args.campaignId} \\
  --arg-type string-ascii --arg-value "${request.args.receiptType}" \\
  --arg-type uint --arg-value ${request.args.amount} \\
  --arg-type string-ascii --arg-value "${request.args.campaignName}" \\
  --arg-type bool --arg-value ${request.args.isSoulbound} \\
  --testnet`;
  };

  const markAsCompleted = (index: number, txHash: string) => {
    const updatedRequests = [...mintRequests];
    updatedRequests[index] = { ...updatedRequests[index], status: 'minted' };
    localStorage.setItem('nft-mint-requests', JSON.stringify(updatedRequests));
    setMintRequests(updatedRequests);
  };

  return (
    <div className="manual-mint-page" style={{ padding: '2rem', background: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="header" style={{ marginBottom: '2rem' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
            <Terminal size={32} />
            Manual NFT Mint Requests
          </h1>
          <p style={{ color: '#888', marginTop: '0.5rem' }}>
            Generated mint requests that need to be processed manually via Stacks CLI or Clarinet
          </p>
        </div>

        <div className="stats" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem', 
          marginBottom: '2rem' 
        }}>
          <div style={{ background: '#2a2a2a', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {mintRequests.filter(r => r.status === 'pending').length}
            </div>
            <div style={{ color: '#888' }}>Pending</div>
          </div>
          <div style={{ background: '#2a2a2a', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {mintRequests.filter(r => r.status === 'minted').length}
            </div>
            <div style={{ color: '#888' }}>Minted</div>
          </div>
          <div style={{ background: '#2a2a2a', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {mintRequests.length}
            </div>
            <div style={{ color: '#888' }}>Total</div>
          </div>
        </div>

        <div className="requests-grid" style={{ display: 'grid', gap: '1rem' }}>
          {mintRequests.map((request, index) => (
            <div 
              key={index} 
              style={{ 
                background: '#2a2a2a', 
                padding: '1.5rem', 
                borderRadius: '8px',
                border: request.status === 'pending' ? '1px solid #f59e0b' : '1px solid #333'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {request.status === 'pending' && <Clock size={20} color="#f59e0b" />}
                  {request.status === 'minted' && <CheckCircle size={20} color="#10b981" />}
                  {request.status === 'failed' && <AlertTriangle size={20} color="#ef4444" />}
                  <h3 style={{ color: '#10b981' }}>
                    {request.args.receiptType.toUpperCase()} Receipt
                  </h3>
                </div>
                <div style={{ 
                  padding: '0.25rem 0.75rem', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem',
                  background: request.status === 'pending' ? '#f59e0b' : request.status === 'minted' ? '#10b981' : '#ef4444',
                  color: 'white'
                }}>
                  {request.status.toUpperCase()}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <strong>Recipient:</strong>
                  <div style={{ color: '#888', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                    {request.args.recipient}
                  </div>
                </div>
                <div>
                  <strong>Amount:</strong>
                  <div style={{ color: '#10b981' }}>
                    {(request.args.amount / 1000000).toLocaleString()} STX
                  </div>
                </div>
                <div>
                  <strong>Campaign:</strong>
                  <div style={{ color: '#888' }}>
                    {request.args.campaignName}
                  </div>
                </div>
                <div>
                  <strong>Created:</strong>
                  <div style={{ color: '#888' }}>
                    {new Date(request.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <strong>Metadata URL:</strong>
                  <button 
                    onClick={() => copyToClipboard(request.metadataUrl)}
                    style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}
                  >
                    <Copy size={16} />
                  </button>
                  <a 
                    href={request.metadataUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#10b981' }}
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
                <div style={{ 
                  background: '#1a1a1a', 
                  padding: '0.5rem', 
                  borderRadius: '4px', 
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  color: '#888',
                  wordBreak: 'break-all'
                }}>
                  {request.metadataUrl}
                </div>
              </div>

              <div className="commands">
                <details style={{ marginBottom: '1rem' }}>
                  <summary style={{ cursor: 'pointer', marginBottom: '0.5rem', color: '#10b981' }}>
                    🔧 Clarity Command
                  </summary>
                  <div style={{ 
                    background: '#1a1a1a', 
                    padding: '1rem', 
                    borderRadius: '4px', 
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                    position: 'relative'
                  }}>
                    <button 
                      onClick={() => copyToClipboard(generateClarityCommand(request))}
                      style={{ 
                        position: 'absolute', 
                        top: '0.5rem', 
                        right: '0.5rem',
                        background: '#10b981',
                        border: 'none',
                        color: 'white',
                        padding: '0.25rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Copy size={14} />
                    </button>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {generateClarityCommand(request)}
                    </pre>
                  </div>
                </details>

                <details>
                  <summary style={{ cursor: 'pointer', marginBottom: '0.5rem', color: '#10b981' }}>
                    💻 Stacks CLI Command
                  </summary>
                  <div style={{ 
                    background: '#1a1a1a', 
                    padding: '1rem', 
                    borderRadius: '4px', 
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                    position: 'relative'
                  }}>
                    <button 
                      onClick={() => copyToClipboard(generateStacksCliCommand(request))}
                      style={{ 
                        position: 'absolute', 
                        top: '0.5rem', 
                        right: '0.5rem',
                        background: '#10b981',
                        border: 'none',
                        color: 'white',
                        padding: '0.25rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Copy size={14} />
                    </button>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {generateStacksCliCommand(request)}
                    </pre>
                  </div>
                </details>
              </div>
            </div>
          ))}
        </div>

        {mintRequests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
            <Terminal size={64} />
            <h3>No mint requests yet</h3>
            <p>Make some donations to generate NFT mint requests</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualMintPage;
