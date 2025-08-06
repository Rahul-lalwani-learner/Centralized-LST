import { NextResponse } from 'next/server';
import { getWebhookEvents, clearWebhookEvents } from '../../lib/webhookStore';

export async function GET() {
  try {
    const events = getWebhookEvents();
    return NextResponse.json({
      success: true,
      events,
      count: events.length
    });
  } catch (error) {
    console.error('Error fetching webhook events:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch webhook events'
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    clearWebhookEvents();
    return NextResponse.json({
      success: true,
      message: 'Webhook events cleared'
    });
  } catch (error) {
    console.error('Error clearing webhook events:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to clear webhook events'
    }, { status: 500 });
  }
}
