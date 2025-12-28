import { Transaction } from "../types";

const STORAGE_KEY = 'sauki_local_transactions';

interface LocalTx {
  tx_ref: string;
  phone: string;
  type: 'ecommerce' | 'data';
  timestamp: number;
}

export const transactionStore = {
  save: (tx: LocalTx) => {
    try {
      const existing = transactionStore.getAll();
      // Avoid duplicates
      if (existing.find(t => t.tx_ref === tx.tx_ref)) return;
      
      const updated = [tx, ...existing].slice(0, 10); // Keep last 10
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save transaction locally', e);
    }
  },

  getAll: (): LocalTx[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  },
  
  getLatest: (): LocalTx | null => {
    const all = transactionStore.getAll();
    return all.length > 0 ? all[0] : null;
  }
};