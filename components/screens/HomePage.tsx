import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Wifi, ArrowRight, ShieldCheck, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Transaction } from '@/lib/types';
import { api } from '@/lib/api';
import { TransactionStatus } from '@/components/TransactionStatus';
import { formatCurrency } from '@/lib/utils';
import { transactionStore } from '@/lib/transaction';

const HomeActionCard = ({ title, icon: Icon, onClick, colorClass }: any) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="relative flex flex-col justify-between p-5 h-36 w-full rounded-2xl overflow-hidden bg-white shadow-sm border border-zinc-100 group"
  >
    <div className={`absolute top-0 right-0 p-24 rounded-full opacity-5 ${colorClass} -mr-8 -mt-8`} />
    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${colorClass} bg-opacity-10`}>
      <Icon className={`h-5 w-5 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
    <div className="flex items-end justify-between w-full">
      <span className="font-semibold text-lg text-zinc-900 text-left max-w-[80%] leading-tight">{title}</span>
      <ArrowRight className="h-5 w-5 text-zinc-300 group-hover:text-zinc-600 transition-colors" />
    </div>
  </motion.button>
);

export default function HomePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [recentTx, setRecentTx] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const lastTx = transactionStore.getLatest();
    if (lastTx) {
      setPhone(lastTx.phone);
      fetchTransactions(lastTx.phone);
    }
  }, []);

  const fetchTransactions = async (phoneNumber: string) => {
    if (phoneNumber.length < 10) return;
    setLoading(true);
    try {
      const txs = await api.transactions.track(phoneNumber);
      setRecentTx(txs.slice(0, 3));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 px-5 pt-12 space-y-8 bg-zinc-50/50">
      
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">SAUKI MART</h1>
          <p className="text-zinc-500 font-medium">Welcome back</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-zinc-200 animate-pulse" />
      </header>

      {/* Action Cards */}
      <section className="grid grid-cols-2 gap-4">
        <HomeActionCard 
          title="Buy Devices & SIMs" 
          icon={Smartphone} 
          onClick={() => router.push('/store')} 
          colorClass="bg-blue-500" 
        />
        <HomeActionCard 
          title="Buy Mobile Data" 
          icon={Wifi} 
          onClick={() => router.push('/data')} 
          colorClass="bg-green-500" 
        />
      </section>

      {/* Track Transaction */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900">Track Orders</h2>
        <div className="flex gap-2">
          <Input 
            placeholder="Enter Phone Number" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-white"
          />
          <Button onClick={() => fetchTransactions(phone)} disabled={loading}>
            Track
          </Button>
        </div>

        <div className="space-y-3 mt-4">
          {loading ? (
             [1,2].map(i => <div key={i} className="h-20 w-full bg-white rounded-xl animate-pulse" />)
          ) : recentTx.length > 0 ? (
            recentTx.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-zinc-100">
                <div>
                  <p className="font-medium text-zinc-900 capitalize">{tx.type} Purchase</p>
                  <p className="text-xs text-zinc-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-semibold text-sm">{formatCurrency(tx.amount)}</span>
                  <TransactionStatus status={tx.status} />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-zinc-400 text-sm bg-white rounded-xl border border-zinc-100 border-dashed">
              No recent transactions found
            </div>
          )}
        </div>
      </section>

      {/* Footer / Trust */}
      <footer className="pt-8 pb-4 border-t border-zinc-200 space-y-6">
        <div className="flex items-center justify-center gap-6 opacity-60 grayscale">
          <div className="flex flex-col items-center">
             <ShieldCheck className="h-6 w-6 mb-1" />
             <span className="text-[10px] font-bold">SMEDAN CERTIFIED</span>
          </div>
          <div className="h-8 w-[1px] bg-zinc-300" />
           <div className="flex flex-col items-center">
             <div className="h-6 w-6 bg-zinc-400 rounded-full mb-1" />
             <span className="text-[10px] font-bold">RC: 123456</span>
          </div>
        </div>
        
        <div className="flex justify-center gap-4">
          <Button variant="outline" size="sm" className="rounded-full gap-2">
            <Phone className="h-3 w-3" /> Support
          </Button>
          <Button variant="outline" size="sm" className="rounded-full gap-2 border-green-200 text-green-700 bg-green-50">
            WhatsApp
          </Button>
        </div>
        <p className="text-center text-[10px] text-zinc-400">© 2024 SAUKI MART. All rights reserved.</p>
      </footer>
    </div>
  );
}