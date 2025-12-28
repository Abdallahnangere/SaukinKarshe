import React, { useState, useEffect } from 'react';
import { PaymentInitResponse, Transaction } from '../lib/types';
import { Button } from './ui/Button';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { api } from '../lib/api';
import { motion } from 'framer-motion';

interface PaymentScreenProps {
  paymentDetails: PaymentInitResponse;
  onSuccess: (tx: Transaction) => void;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ paymentDetails, onSuccess }) => {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleVerify = async () => {
    setVerifying(true);
    setError(null);
    try {
      const tx = await api.transactions.verify(paymentDetails.tx_ref);
      if (tx.status === 'paid' || tx.status === 'delivered') {
        onSuccess(tx);
      } else {
        // In a real world, we might poll here. For this UI, we show a "Check again" or pending state.
        // If the API returns pending, we tell user to wait.
        if (tx.status === 'pending') {
          setError("We haven't received the payment yet. It may take a few seconds.");
        } else if (tx.status === 'failed') {
          setError("Transaction failed. Please try again or contact support.");
        }
      }
    } catch (e) {
      setError("Could not verify payment status. Please check your internet connection.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold text-zinc-900">{formatCurrency(paymentDetails.amount)}</h3>
        <p className="text-sm text-zinc-500">Transfer exact amount to the account below</p>
      </div>

      <div className="rounded-2xl bg-zinc-50 p-6 space-y-4 border border-zinc-100">
        <div className="space-y-1">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Bank Name</p>
          <p className="text-lg font-semibold text-zinc-800">{paymentDetails.bank}</p>
        </div>
        
        <div className="space-y-1">
           <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Account Number</p>
           <div className="flex items-center justify-between">
              <p className="text-3xl font-mono font-bold text-zinc-900 tracking-wider">{paymentDetails.account_number}</p>
              <button 
                onClick={() => copyToClipboard(paymentDetails.account_number)}
                className="p-2 hover:bg-zinc-200 rounded-full transition-colors"
              >
                {copiedAccount ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-zinc-400" />}
              </button>
           </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Account Name</p>
          <p className="text-sm font-medium text-zinc-700">{paymentDetails.account_name}</p>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      <Button 
        size="lg" 
        className="w-full" 
        onClick={handleVerify}
        loading={verifying}
      >
        I Have Paid
      </Button>

      <div className="text-center">
        <p className="text-xs text-zinc-400">
          Payment is automatically verified. 
          <br/>Do not close this screen until verified.
        </p>
      </div>
    </div>
  );
};