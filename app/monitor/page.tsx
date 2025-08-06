'use client'

import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';

interface WebhookLog {
  timestamp: string;
  requestId: string;
  method: string;
  url: string;
  status: number;
  response: Record<string, unknown> | null;
  processingTime?: number;
}

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
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [realTimeEvents, setRealTimeEvents] = useState<WebhookEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<WebhookStatus | null>(null);

  // Simulate webhook monitoring (in production, you'd connect to actual logs)
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
      }, 2000); // Check every 2 seconds for more responsive monitoring

      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  const testWebhook = async () => {
    const testLog: WebhookLog = {
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).substring(7),
      method: 'POST',
      url: '/api/test-webhook',
      status: 0,
      response: null
    };

    setLogs(prev => [testLog, ...prev]);

    try {
      const startTime = Date.now();
      const response = await fetch('/api/test-webhook', { method: 'POST' });
      const data = await response.json();
      const endTime = Date.now();

      const updatedLog = {
        ...testLog,
        status: response.status,
        response: data,
        processingTime: endTime - startTime
      };

      setLogs(prev => prev.map(log => 
        log.requestId === testLog.requestId ? updatedLog : log
      ));
    } catch (error) {
      const updatedLog = {
        ...testLog,
        status: 500,
        response: { error: error instanceof Error ? error.message : 'Unknown error' }
      };

      setLogs(prev => prev.map(log => 
        log.requestId === testLog.requestId ? updatedLog : log
      ));
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Webhook Monitoring Dashboard</h1>

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
                <p className="text-sm text-gray-600 mt-2">
                  Last checked: {new Date(webhookStatus.lastChecked).toLocaleTimeString()}
                </p>
                {webhookStatus.environment && (
                  <div className="mt-2 text-xs">
                    <p>Config: {Object.values(webhookStatus.environment).every(Boolean) ? '✅ Complete' : '⚠️ Missing'}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Not monitoring</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Real-Time Events</h3>
            <p className="text-3xl font-bold text-blue-600">{realTimeEvents.length}</p>
            <p className="text-sm text-gray-600">Live webhook events</p>
            {realTimeEvents.length > 0 && (
              <div className="mt-2 text-xs">
                <p>Latest: {realTimeEvents[0]?.type} ({new Date(realTimeEvents[0]?.timestamp).toLocaleTimeString()})</p>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Test Requests</h3>
            <p className="text-3xl font-bold text-indigo-600">{logs.length}</p>
            <p className="text-sm text-gray-600">Manual test requests</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
            <p className="text-3xl font-bold text-green-600">
              {realTimeEvents.length > 0 
                ? Math.round((realTimeEvents.filter(event => event.type === 'completed').length / realTimeEvents.length) * 100)
                : 0
              }%
            </p>
            <p className="text-sm text-gray-600">Real webhook success rate</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-4">Controls</h3>
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
              onClick={testWebhook}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Test Webhook
            </button>
            
            <button
              onClick={clearRealTimeEvents}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700"
            >
              Clear Real-Time Events
            </button>

            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
            >
              Clear Test Logs
            </button>

            <a
              href="/api/webhook"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Check Webhook Health
            </a>
          </div>
        </div>

        {/* Real-Time Webhook Events */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">🔴 Live Webhook Events</h3>
            <p className="text-sm text-gray-600 mt-1">Real-time events from actual staking transactions</p>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {realTimeEvents.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {isMonitoring 
                  ? "Monitoring for real-time webhook events... Try staking some SOL!" 
                  : "Start monitoring to see real-time webhook events from actual transactions."
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
                        <span className="text-sm text-gray-600">
                          {event.type === 'incoming' && '📥 Webhook Received'}
                          {event.type === 'processing' && '⚙️ Processing Transaction'}
                          {event.type === 'completed' && '✅ RSOL Minted'}
                          {event.type === 'error' && '❌ Processing Failed'}
                        </span>
                        {event.amount && (
                          <span className="text-sm font-medium text-indigo-600">
                            {(event.amount / 1e9).toFixed(4)} SOL
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                        {event.processingTime && ` (${event.processingTime}ms)`}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
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
                    
                    {event.data && Object.keys(event.data).length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-800">
                          View Event Data
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Test Request Logs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">🧪 Manual Test Logs</h3>
            <p className="text-sm text-gray-600 mt-1">Logs from manual webhook testing</p>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No test requests logged yet. Click &quot;Test Webhook&quot; to simulate a request.
              </div>
            ) : (
              <div className="divide-y">
                {logs.map((log, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.status >= 200 && log.status < 300 
                            ? 'bg-green-100 text-green-800' 
                            : log.status >= 400 
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {log.status || 'Pending'}
                        </span>
                        <span className="font-mono text-sm text-gray-600">{log.method}</span>
                        <span className="text-sm text-gray-600">{log.url}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                        {log.processingTime && ` (${log.processingTime}ms)`}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      Request ID: <span className="font-mono">{log.requestId}</span>
                    </div>
                    
                    {log.response && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-indigo-600 hover:text-indigo-800">
                          View Response
                        </summary>
                        <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.response, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Endpoints Information */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Available Endpoints</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <span className="font-mono text-sm">GET /api/webhook</span>
                <p className="text-xs text-gray-600">Health check endpoint</p>
              </div>
              <a
                href="/api/webhook"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Test →
              </a>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <span className="font-mono text-sm">POST /api/webhook</span>
                <p className="text-xs text-gray-600">Main webhook handler (receives Helius data)</p>
              </div>
              <span className="text-xs text-gray-500">External only</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <span className="font-mono text-sm">POST /api/test-webhook</span>
                <p className="text-xs text-gray-600">Test webhook with static data</p>
              </div>
              <button
                onClick={testWebhook}
                className="text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Test →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
