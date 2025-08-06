'use client'

import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';

interface WebhookEvent {
  id: string;
  timestamp: string;
  type: 'incoming' | 'processing' | 'completed' | 'error';
  data: Record<string, unknown>;
  requestId?: string;
  signature?: string;
  amount?: number;
  recipient?: string;
  mintTx?: string;
  processingTime?: number;
  error?: string;
}

interface WebhookStatus {
  status: string;
  timestamp?: string;
  lastChecked: string;
  error?: string;
  environment?: Record<string, boolean>;
}

export default function Monitor() {
  const [realTimeEvents, setRealTimeEvents] = useState<WebhookEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<WebhookStatus | null>(null);

  // Real-time webhook monitoring
  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(async () => {
        // Check webhook health
        try {
          const response = await fetch('/api/webhook');
          const data = await response.json();
          setWebhookStatus({
            ...data,
            status: response.status,
            lastChecked: new Date().toISOString()
          });
        } catch (error) {
          setWebhookStatus({
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            lastChecked: new Date().toISOString()
          });
        }

        // Fetch real-time webhook events
        try {
          const eventsResponse = await fetch('/api/webhook-events');
          const eventsData = await eventsResponse.json();
          if (eventsData.success) {
            setRealTimeEvents(eventsData.events);
          }
        } catch (error) {
          console.error('Failed to fetch webhook events:', error);
        }
      }, 2000); // Check every 2 seconds

      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const clearRealTimeEvents = async () => {
    try {
      await fetch('/api/webhook-events', { method: 'DELETE' });
      setRealTimeEvents([]);
    } catch (error) {
      console.error('Failed to clear webhook events:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Live Transaction Monitor</h1>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Webhook Status</h3>
            {webhookStatus ? (
              <div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  webhookStatus.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {webhookStatus.status === 'error' ? 'Error' : 'Running'}
                </div>
                <p className="text-sm text-gray-800 mt-2">
                  Last checked: {new Date(webhookStatus.lastChecked).toLocaleTimeString()}
                </p>
                {webhookStatus.environment && (
                  <div className="mt-2 text-xs">
                    <p className="text-gray-800">Config: {Object.values(webhookStatus.environment).every(Boolean) ? '✅ Complete' : '⚠️ Missing'}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-800">Not monitoring</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Live Events</h3>
            <p className="text-3xl font-bold text-blue-600">{realTimeEvents.length}</p>
            <p className="text-sm text-gray-800">Real-time transactions</p>
            {realTimeEvents.length > 0 && (
              <div className="mt-2 text-xs">
                <p className="text-gray-800">Latest: {realTimeEvents[0]?.type} ({new Date(realTimeEvents[0]?.timestamp).toLocaleTimeString()})</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
            <p className="text-3xl font-bold text-green-600">
              {realTimeEvents.length > 0 
                ? Math.round((realTimeEvents.filter(event => event.type === 'completed').length / realTimeEvents.length) * 100)
                : 0
              }%
            </p>
            <p className="text-sm text-gray-800">Token minting success</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-4">Monitor Controls</h3>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={`px-4 py-2 rounded-lg font-medium ${
                isMonitoring 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </button>
            
            <button
              onClick={clearRealTimeEvents}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700"
            >
              Clear Events
            </button>

            <a
              href="/api/webhook"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Check Health
            </a>
          </div>
        </div>

        {/* Real-Time Events */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">🔴 Live Transaction Events</h3>
            <p className="text-sm text-gray-800 mt-1">Real-time events from staking transactions</p>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {realTimeEvents.length === 0 ? (
              <div className="p-6 text-center text-gray-800">
                {isMonitoring 
                  ? "Monitoring for real-time events... Try staking some SOL!" 
                  : "Start monitoring to see real-time events from staking transactions."
                }
              </div>
            ) : (
              <div className="divide-y">
                {realTimeEvents.map((event) => (
                  <div key={event.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          event.type === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : event.type === 'error'
                            ? 'bg-red-100 text-red-800'
                            : event.type === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {event.type.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-900">
                          {event.type === 'incoming' && '📥 Transaction Received'}
                          {event.type === 'processing' && '⚙️ Processing'}
                          {event.type === 'completed' && '✅ RSOL Minted'}
                          {event.type === 'error' && '❌ Failed'}
                        </span>
                        {event.amount && (
                          <span className="text-sm font-medium text-indigo-600">
                            {(event.amount / 1e9).toFixed(4)} SOL
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(event.timestamp).toLocaleTimeString()}
                        {event.processingTime && ` (${event.processingTime}ms)`}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-900 space-y-1">
                      {event.requestId && (
                        <div>Request ID: <span className="font-mono">{event.requestId}</span></div>
                      )}
                      {event.signature && (
                        <div>Transaction: <span className="font-mono">{event.signature.slice(0, 8)}...{event.signature.slice(-8)}</span></div>
                      )}
                      {event.recipient && (
                        <div>Recipient: <span className="font-mono">{event.recipient.slice(0, 8)}...{event.recipient.slice(-8)}</span></div>
                      )}
                      {event.mintTx && (
                        <div>Mint TX: <span className="font-mono text-green-600">{event.mintTx.slice(0, 8)}...{event.mintTx.slice(-8)}</span></div>
                      )}
                      {event.error && (
                        <div className="text-red-600">Error: {event.error}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
