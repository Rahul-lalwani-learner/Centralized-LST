// Simple in-memory store for webhook events
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

let webhookEvents: WebhookEvent[] = [];

export function addWebhookEvent(event: WebhookEvent) {
  webhookEvents.unshift(event); // Add to beginning
  // Keep only last 100 events to prevent memory issues
  if (webhookEvents.length > 100) {
    webhookEvents = webhookEvents.slice(0, 100);
  }
}

export function getWebhookEvents() {
  return webhookEvents;
}

export function clearWebhookEvents() {
  webhookEvents = [];
}
