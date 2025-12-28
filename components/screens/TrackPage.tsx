import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Transaction } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TransactionStatus } from '@/components/TransactionStatus';
import { formatCurrency } from '@/lib/utils';
import { Loader2, Search } from 'lucide-react';

export default function TrackPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrack = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (phone.length < 10) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await api.transactions.track(phone);
      setTransactions(data);
    } catch (e) {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 pt-12 px-5">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Track Transactions</h1>
      
      <form onSubmit={handleTrack} className="flex gap-2 mb-8">
        <Input 
          placeholder="Enter phone number" 
          type="tel" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)}
          className="bg-white text-lg"
        />
        <Button size="icon" type="submit" disabled={loading} className="w-14 shrink-0 rounded-xl">
          {loading ? <Loader2 className="animate-spin" /> : <Search />}
        </Button>
      </form>

      <div className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-zinc-100 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-zinc-900">{tx.type === 'data' ? 'Data Bundle' : 'Store Order'}</p>
                <p className="text-xs text-zinc-400 font-mono mt-1">REF: {tx.tx_ref}</p>
              </div>
              <TransactionStatus status={tx.status} />
            </div>
            <div className="flex justify-between items-end border-t border-zinc-50 pt-3">
              <p className="text-xs text-zinc-500">{new Date(tx.createdAt).toLocaleString()}</p>
              <p className="font-semibold">{formatCurrency(tx.amount)}</p>
            </div>
            {tx.status === 'failed' && (
              <Button variant="outline" size="sm" className="w-full mt-2 text-red-600 border-red-100 hover:bg-red-50">
                Retry Transaction
              </Button>
            )}
          </div>
        ))}

        {hasSearched && transactions.length === 0 && !loading && (
          <div className="text-center py-12 text-zinc-400">
            <p>No transactions found for this number.</p>
          </div>
        )}
      </div>
    </div>
  );
}