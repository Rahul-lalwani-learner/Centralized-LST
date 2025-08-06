import { NextResponse } from 'next/server';

export async function POST() {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`\n🧪 [${requestId}] Test webhook POST request initiated at ${new Date().toISOString()}`);
  
  try {
    // Static webhook data for testing - simulating someone sending SOL to our platform wallet
    const staticWebhookData = [
      {
        "accountData": [
          {
            "account": "dPAP9mm9EQz3qJWQ85vJ6QfuFZ27bGoE8W1S9p9pfkQ", // Sender wallet
            "nativeBalanceChange": -2080000, // Lost 2 SOL + fees
            "tokenBalanceChanges": []
          },
          {
            "account": "79sPp6QJ8JyFmu2aZbg2EcNXLAz2rdu6KLVm3bmoDeJD", // Our platform wallet
            "nativeBalanceChange": 2000000000, // Received 2 SOL
            "tokenBalanceChanges": []
          },
          {
            "account": "11111111111111111111111111111111",
            "nativeBalanceChange": 0,
            "tokenBalanceChanges": []
          },
          {
            "account": "ComputeBudget111111111111111111111111111111",
            "nativeBalanceChange": 0,
            "tokenBalanceChanges": []
          }
        ],
        "description": "dPAP9mm9EQz3qJWQ85vJ6QfuFZ27bGoE8W1S9p9pfkQ transferred 2 SOL to 79sPp6QJ8JyFmu2aZbg2EcNXLAz2rdu6KLVm3bmoDeJD.",
        "events": {},
        "fee": 80000,
        "feePayer": "dPAP9mm9EQz3qJWQ85vJ6QfuFZ27bGoE8W1S9p9pfkQ",
        "instructions": [
          {
            "accounts": [],
            "data": "3qi1MbrtkR83",
            "innerInstructions": [],
            "programId": "ComputeBudget111111111111111111111111111111"
          },
          {
            "accounts": [],
            "data": "Fj2Eoy",
            "innerInstructions": [],
            "programId": "ComputeBudget111111111111111111111111111111"
          },
          {
            "accounts": [
              "dPAP9mm9EQz3qJWQ85vJ6QfuFZ27bGoE8W1S9p9pfkQ",
              "79sPp6QJ8JyFmu2aZbg2EcNXLAz2rdu6KLVm3bmoDeJD"
            ],
            "data": "3Bxs3zxH1DZVrsVy",
            "innerInstructions": [],
            "programId": "11111111111111111111111111111111"
          }
        ],
        "nativeTransfers": [
          {
            "amount": 2000000000, // 2 SOL in lamports
            "fromUserAccount": "dPAP9mm9EQz3qJWQ85vJ6QfuFZ27bGoE8W1S9p9pfkQ", // Different sender
            "toUserAccount": "79sPp6QJ8JyFmu2aZbg2EcNXLAz2rdu6KLVm3bmoDeJD" // Our platform wallet
          }
        ],
        "signature": "5cUWTVgGFRRDHHXSp5ZAC6r5uwj9fXjmHxr1kVEesAZZDa6hAoTErB5uVZfdjNvtFKuVvRDwBt9wJqNckEzGEhTk",
        "slot": 399307596,
        "source": "SYSTEM_PROGRAM",
        "timestamp": 1754469306,
        "tokenTransfers": [],
        "transactionError": null,
        "type": "TRANSFER"
      }
    ];

    console.log(`📤 [${requestId}] Sending static webhook data to webhook endpoint...`);

    // Send the static data to your webhook endpoint
    const webhookUrl = process.env.NEXT_PUBLIC_BASE_URL?.includes('localhost') 
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook`
      : 'https://lst-sample.rahullalwani.com/api/webhook';
    
    console.log(`🎯 [${requestId}] Target webhook URL: ${webhookUrl}`);
    
    const webhookStartTime = Date.now();
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staticWebhookData),
    });
    const webhookEndTime = Date.now();
    const webhookProcessingTime = webhookEndTime - webhookStartTime;

    const result = await webhookResponse.json();
    const totalTime = Date.now() - startTime;

    console.log(`✅ [${requestId}] Test webhook completed in ${totalTime}ms`);
    console.log(`   Webhook processing time: ${webhookProcessingTime}ms`);
    console.log(`   Webhook response status: ${webhookResponse.status}`);
    console.log(`   Webhook response:`, result);

    return NextResponse.json({ 
      success: true, 
      message: 'Static webhook data sent successfully',
      testRequestId: requestId,
      webhookResponse: result,
      timings: {
        totalTime,
        webhookProcessingTime
      },
      webhookUrl,
      webhookStatus: webhookResponse.status
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`💥 [${requestId}] Error sending static webhook data after ${totalTime}ms:`, error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send static webhook data',
      testRequestId: requestId,
      timings: { totalTime }
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Test webhook endpoint - use POST to trigger static webhook data',
    usage: 'POST /api/test-webhook to simulate a Helius webhook'
  });
}
