# RSOL - Liquid Staking Platform

A centralized liquid staking token (LST) platform for Solana devnet that automatically mints RSOL tokens when SOL is staked.

## Features

- **Instant Liquidity**: Receive RSOL tokens immediately when staking SOL
- **Webhook Integration**: Automated token minting via Helius webhooks
- **1:1 Ratio**: RSOL tokens minted at 1:1 ratio with staked SOL
- **Devnet Only**: Built for testing and development on Solana devnet

## How It Works

1. **Connect Wallet**: User connects their Solana wallet
2. **Stake SOL**: User sends SOL to the platform's wallet
3. **Webhook Trigger**: Helius webhook detects the SOL transfer
4. **Mint RSOL**: Platform automatically mints RSOL tokens to user's wallet
5. **Earn Rewards**: Staked SOL earns rewards over time

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Blockchain**: Solana Web3.js, SPL Token
- **Wallet**: Solana Wallet Adapter
- **Styling**: Tailwind CSS
- **Webhooks**: Helius webhook integration

## Setup Instructions

### Prerequisites

- Node.js 18+
- A Solana wallet (Phantom, Solflare, etc.)
- Devnet SOL for testing

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_ALCHEMY_DEVNET_ENDPOINT=https://solana-devnet.g.alchemy.com/v2/YOUR_API_KEY
WALLET_PUBLIC_KEY=YOUR_PLATFORM_WALLET_PUBLIC_KEY
NEXT_PUBLIC_WALLET_PUBLIC_KEY=YOUR_PLATFORM_WALLET_PUBLIC_KEY
WALLET_PRIVATE_KEY=YOUR_PLATFORM_WALLET_PRIVATE_KEY_ARRAY
TOKEN_MINT_ADDRESS=YOUR_RSOL_TOKEN_MINT_ADDRESS
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to `http://localhost:3000`

## API Endpoints

### `/api/webhook` (POST)
- **Purpose**: Receives Helius webhook notifications
- **Function**: Processes SOL transfers and mints RSOL tokens
- **Authentication**: None (webhook endpoint)

### `/api/test-webhook` (POST)
- **Purpose**: Test webhook functionality with static data
- **Function**: Sends sample webhook data to the main webhook endpoint
- **Usage**: For development and testing

## Webhook Setup

To set up the Helius webhook:

1. **Create a Helius account** at [helius.dev](https://helius.dev)
2. **Create a webhook** pointing to your deployed URL: `https://yourdomain.com/api/webhook`
3. **Configure webhook** to monitor your platform wallet address
4. **Set transaction types** to include "TRANSFER" events

### Sample Webhook Data

The webhook expects data in this format:
```json
[{
  "accountData": [...],
  "nativeTransfers": [{
    "amount": 500000000,
    "fromUserAccount": "sender_wallet",
    "toUserAccount": "your_platform_wallet"
  }],
  "signature": "transaction_signature",
  "type": "TRANSFER"
}]
```

## Development Workflow

1. **Local Testing**:
   - Use the test webhook endpoint to simulate transactions
   - Test with devnet SOL and tokens

2. **Wallet Integration**:
   - Connect Phantom or Solflare wallet
   - Ensure you're on Solana devnet

3. **Token Minting**:
   - Create your RSOL token mint on devnet
   - Update the `TOKEN_MINT_ADDRESS` in your environment

## Production Deployment

1. **Deploy to Vercel/Netlify**:
   ```bash
   npm run build
   ```

2. **Set Environment Variables**:
   - Add all environment variables to your deployment platform
   - Ensure webhook URL points to your production domain

3. **Configure Helius Webhook**:
   - Update webhook URL to production endpoint
   - Test with small amounts first

## Security Considerations

- **Private Keys**: Never expose private keys in client-side code
- **Environment Variables**: Use proper environment variable management
- **Webhook Validation**: Consider adding webhook signature validation
- **Rate Limiting**: Implement rate limiting for API endpoints

## Testing

1. **Test Webhook**:
   ```bash
   curl -X POST http://localhost:3000/api/test-webhook
   ```

2. **Test Staking**:
   - Connect wallet on `/LST` page
   - Stake small amount of devnet SOL
   - Check for RSOL tokens in wallet

## Troubleshooting

### Common Issues

1. **Wallet Connection Failed**:
   - Ensure wallet is set to devnet
   - Clear browser cache and try again

2. **Transaction Failed**:
   - Check if you have enough SOL for transaction fees
   - Verify wallet permissions

3. **Tokens Not Minted**:
   - Check webhook logs in console
   - Verify environment variables are correct
   - Ensure token mint address is valid

### Debug Mode

Enable debug logging by adding to your environment:
```env
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the troubleshooting section
- Review Solana devnet documentation
- Check Helius webhook documentation
