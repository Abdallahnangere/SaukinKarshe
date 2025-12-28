import React from 'react';
import { Transaction } from '../lib/types';
import { cn } from '../lib/utils';
import { CheckCircle2, Clock, XCircle, Truck } from 'lucide-react';

interface TransactionStatusProps {
  status: Transaction['status'];
  className?: string;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({ status, className }) => {
  const config = {
    pending: {
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      icon: Clock,
      label: 'Awaiting Payment'
    },
    paid: {
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      icon: CheckCircle2,
      label: 'Payment Verified'
    },
    delivered: {
      color: 'text-green-600 bg-green-50 border-green-200',
      icon: CheckCircle2,
      label: 'Delivered'
    },
    failed: {
      color: 'text-red-600 bg-red-50 border-red-200',
      icon: XCircle,
      label: 'Failed'
    }
  };

  const { color, icon: Icon, label } = config[status] || config.pending;

  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium", color, className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
};