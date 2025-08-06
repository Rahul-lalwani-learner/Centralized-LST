import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Static webhook data for testing
    const staticWebhookData = [
      [{"accountData":[{"account":"79sPp6QJ8JyFmu2aZbg2EcNXLAz2rdu6KLVm3bmoDeJD","nativeBalanceChange":-80000,"tokenBalanceChanges":[]},{"account":"11111111111111111111111111111111","nativeBalanceChange":0,"tokenBalanceChanges":[]},{"account":"ComputeBudget111111111111111111111111111111","nativeBalanceChange":0,"tokenBalanceChanges":[]}],"description":"79sPp6QJ8JyFmu2aZbg2EcNXLAz2rdu6KLVm3bmoDeJD transferred 2 SOL to 79sPp6QJ8JyFmu2aZbg2EcNXLAz2rdu6KLVm3bmoDeJD.","events":{},"fee":80000,"feePayer":"79sPp6QJ8JyFmu2aZbg2EcNXLAz2rdu6KLVm3bmoDeJD","instructions":[{"accounts":[],"data":"3qi1MbrtkR83","innerInstructions":[],"programId":"ComputeBudget111111111111111111111111111111"},{"accounts":[],"data":"Fj2Eoy","innerInstructions":[],"programId":"ComputeBudget111111111111111111111111111111"},{"accounts":["79sPp6QJ8JyFmu2aZbg2EcNXLAz2rdu6KLVm3bmoDeJD","79sPp6QJ8JyFmu2aZbg2EcNXLAz2rdu6KLVm3bmoDeJD"],"data":"3Bxs3zxH1DZVrsVy","innerInstructions":[],"programId":"11111111111111111111111111111111"}],"nativeTransfers":[{"amount":2000000000,"fromUserAccount":"79sPp6QJ8JyFmu2aZbg2EcNXLAz2rdu6KLVm3bmoDeJD","toUserAccount":"79sPp6QJ8JyFmu2aZbg2EcNXLAz2rdu6KLVm3bmoDeJD"}],"signature":"5cUWTVgGFRRDHHXSp5ZAC6r5uwj9fXjmHxr1kVEesAZZDa6hAoTErB5uVZfdjNvtFKuVvRDwBt9wJqNckEzGEhTk","slot":399307596,"source":"SYSTEM_PROGRAM","timestamp":1754469306,"tokenTransfers":[],"transactionError":null,"type":"TRANSFER"}]
    ];

    console.log('Sending static webhook data to webhook endpoint...');

    // Send the static data to your webhook endpoint
    const webhookResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staticWebhookData),
    });

    const result = await webhookResponse.json();

    return NextResponse.json({ 
      success: true, 
      message: 'Static webhook data sent successfully',
      webhookResponse: result
    });

  } catch (error) {
    console.error('Error sending static webhook data:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send static webhook data' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Test webhook endpoint - use POST to trigger static webhook data',
    usage: 'POST /api/test-webhook to simulate a Helius webhook'
  });
}
