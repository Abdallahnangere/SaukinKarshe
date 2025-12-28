import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DataPlan, NetworkType, PaymentInitResponse, Transaction } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import { Sheet } from '@/components/Sheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PaymentScreen } from '@/components/PaymentScreen';
import { transactionStore } from '@/lib/transaction';
import { CheckCircle2, Download, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const networks: { id: NetworkType; color: string; label: string }[] = [
  { id: 'MTN', color: 'bg-yellow-400', label: 'MTN' },
  { id: 'AIRTEL', color: 'bg-red-500 text-white', label: 'Airtel' },
  { id: 'GLO', color: 'bg-green-600 text-white', label: 'Glo' },
];

export default function DataPage() {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType | null>(null);
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'input' | 'payment' | 'success'>('input');
  const [paymentData, setPaymentData] = useState<PaymentInitResponse | null>(null);
  const [successTx, setSuccessTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingPlans, setFetchingPlans] = useState(true);

  useEffect(() => {
    api.data.listPlans()
      .then(setPlans)
      .catch(console.error)
      .finally(() => setFetchingPlans(false));
  }, []);

  const handleNetworkSelect = (id: NetworkType) => {
    setSelectedNetwork(id);
    setSelectedPlan(null); 
  };

  const initiatePurchase = async () => {
    if (!selectedPlan || !selectedNetwork || !phone) return;
    setLoading(true);
    try {
      const res = await api.data.initiatePayment({
        planId: selectedPlan.id,
        phone
      });
      setPaymentData(res);
      setStep('payment');
      transactionStore.save({
        tx_ref: res.tx_ref,
        phone,
        type: 'data',
        timestamp: Date.now()
      });
    } catch (e) {
      alert("System busy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (tx: Transaction) => {
    setSuccessTx(tx);
    setStep('success');
  };

  const reset = () => {
    setStep('input');
    setSelectedPlan(null);
    setPaymentData(null);
    setSuccessTx(null);
  };

  const visiblePlans = plans.filter(p => p.network === selectedNetwork);

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 pt-12 px-5">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Buy Data</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {networks.map((net) => (
          <motion.button
            key={net.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNetworkSelect(net.id)}
            className={cn(
              "h-24 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm transition-all",
              selectedNetwork === net.id 
                ? "ring-4 ring-offset-2 ring-zinc-900 scale-105 z-10" 
                : "opacity-70 hover:opacity-100",
               net.color
            )}
          >
            <span className="font-bold text-lg">{net.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Available Plans</h2>
        {fetchingPlans ? (
          [1,2,3].map(i => <div key={i} className="h-16 w-full bg-white animate-pulse rounded-xl" />)
        ) : !selectedNetwork ? (
           <p className="text-zinc-400 text-sm">Select a network to view plans</p>
        ) : visiblePlans.length === 0 ? (
           <p className="text-zinc-400 text-sm">No plans available for this network</p>
        ) : (
          visiblePlans.map((plan) => (
            <motion.div
              key={plan.id}
              onClick={() => { setSelectedPlan(plan); setStep('input'); }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-zinc-100 shadow-sm active:bg-zinc-50"
            >
              <div>
                <p className="text-lg font-bold text-zinc-900">{plan.data}</p>
                <p className="text-xs text-zinc-500">{plan.validity}</p>
              </div>
              <div className="flex items-center gap-3">
                 <span className="font-semibold text-zinc-700">{formatCurrency(plan.price)}</span>
                 <Button size="sm" variant="secondary" className="h-8 rounded-lg">Buy</Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <Sheet isOpen={!!selectedPlan} onClose={reset} title="Data Purchase">
        {step === 'input' && selectedPlan && (
          <div className="space-y-6">
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex justify-between items-center">
               <div>
                 <p className="text-sm text-zinc-500">Selected Plan</p>
                 <p className="text-lg font-bold text-zinc-900">{selectedPlan.data} <span className="text-zinc-400 text-sm font-normal">/ {selectedPlan.validity}</span></p>
               </div>
               <p className="font-bold text-xl">{formatCurrency(selectedPlan.price)}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Phone Number</label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                <Input 
                  className="pl-10 text-lg tracking-wide" 
                  placeholder="080 1234 5678" 
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full" 
              disabled={phone.length < 10} 
              loading={loading}
              onClick={initiatePurchase}
            >
              Proceed to Pay
            </Button>
          </div>
        )}

        {step === 'payment' && paymentData && (
          <PaymentScreen paymentDetails={paymentData} onSuccess={handleSuccess} />
        )}

        {step === 'success' && successTx && (
          <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">Success!</h2>
              <p className="text-zinc-500 mt-2">Data has been sent to {successTx.phone}.</p>
            </div>
             <a 
              href={api.receipt.generateUrl(successTx.tx_ref)} 
              target="_blank" 
              rel="noreferrer"
              className="w-full"
            >
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" /> Download Receipt
              </Button>
            </a>
            <Button className="w-full" onClick={reset}>Done</Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}