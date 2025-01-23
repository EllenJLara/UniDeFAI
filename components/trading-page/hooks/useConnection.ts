import { useState, useEffect } from 'react';
import { Connection } from '@solana/web3.js';
import { getConnection } from '@/services/getSolanaConnection';

export const useConnection = () => {
  const [connection, setConnection] = useState<Connection | null>(null);

  useEffect(() => {
    try {
      const conn = getConnection();
      setConnection(conn);
    } catch (err) {
      console.error('Failed to establish connection:', err);
    }
  }, []);

  return { connection };
};