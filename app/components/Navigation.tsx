'use client'

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

export default function Navigation() {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link href="/" style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: '#6366f1',
          textDecoration: 'none'
        }}>
          RSOL Platform
        </Link>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/" style={{ 
            color: '#4b5563', 
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            transition: 'background 0.2s'
          }}>
            Home
          </Link>
          <Link href="/LST" style={{ 
            color: '#4b5563', 
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            transition: 'background 0.2s'
          }}>
            Stake
          </Link>
          <Link href="/monitor" style={{ 
            color: '#4b5563', 
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            transition: 'background 0.2s'
          }}>
            Monitor
          </Link>
        </div>
      </div>
      
      <WalletMultiButton style={{
        background: '#6366f1',
        border: 'none',
        borderRadius: '6px',
        padding: '0.5rem 1rem',
        color: 'white',
        cursor: 'pointer'
      }} />
    </nav>
  );
}
