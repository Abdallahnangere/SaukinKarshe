import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Product, PaymentInitResponse, Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Sheet } from '@/components/Sheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PaymentScreen } from '@/components/PaymentScreen';
import { transactionStore } from '@/lib/transaction';
import { Loader2, CheckCircle2, Download } from 'lucide-react';

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [customer, setCustomer] = useState({ name: '', phone: '', state: '' });
  const [paymentData, setPaymentData] = useState<PaymentInitResponse | null>(null);
  const [successTx, setSuccessTx] = useState<Transaction | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.products.list();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const initiatePurchase = async () => {
    if (!selectedProduct) return;
    setProcessing(true);
    try {
      const res = await api.ecommerce.initiatePayment({
        productId: selectedProduct.id,
        ...customer
      });
      setPaymentData(res);
      setStep('payment');
      
      transactionStore.save({
        tx_ref: res.tx_ref,
        phone: customer.phone,
        type: 'ecommerce',
        timestamp: Date.now()
      });
    } catch (e) {
      alert("Failed to initiate payment. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = (tx: Transaction) => {
    setSuccessTx(tx);
    setStep('success');
  };

  const resetFlow = () => {
    setSelectedProduct(null);
    setStep('details');
    setPaymentData(null);
    setSuccessTx(null);
    setCustomer({ name: '', phone: '', state: '' });
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 pt-12 px-5">
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">Store</h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="aspect-[4/5] bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {products.map(product => (
            <div 
              key={product.id} 
              onClick={() => setSelectedProduct(product)}
              className="bg-white rounded-2xl p-3 shadow-sm border border-zinc-100 active:scale-95 transition-transform"
            >
              <div className="aspect-square bg-zinc-100 rounded-xl mb-3 relative overflow-hidden">
                <img src={product.image} alt={product.name} className="object-cover w-full h-full" />
              </div>
              <h3 className="font-semibold text-zinc-900 text-sm truncate">{product.name}</h3>
              <p className="text-xs text-zinc-500 mb-2 truncate">{product.description}</p>
              <p className="font-bold text-zinc-900">{formatCurrency(product.price)}</p>
            </div>
          ))}
        </div>
      )}

      <Sheet isOpen={!!selectedProduct} onClose={resetFlow} title={step === 'details' ? 'Product Details' : 'Checkout'}>
        {selectedProduct && step === 'details' && (
          <div className="space-y-6 pb-6">
            <div className="aspect-video bg-zinc-100 rounded-xl overflow-hidden">
               <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-zinc-900">{selectedProduct.name}</h2>
              <p className="text-2xl font-semibold text-zinc-900 mt-1">{formatCurrency(selectedProduct.price)}</p>
            </div>

            <p className="text-zinc-600 leading-relaxed text-sm">
              {selectedProduct.description}
            </p>

            <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 space-y-1">
              <p className="font-semibold">Free Delivery</p>
              <p className="opacity-80">Estimated arrival: 34–48 hours</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <h3 className="font-semibold text-zinc-900">Delivery Details</h3>
              <Input placeholder="Full Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
              <Input placeholder="Phone Number" type="tel" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
              <Input placeholder="State / Address" value={customer.state} onChange={e => setCustomer({...customer, state: e.target.value})} />
            </div>

            <Button 
              className="w-full h-12 text-lg" 
              onClick={initiatePurchase}
              disabled={!customer.name || !customer.phone || !customer.state}
              loading={processing}
            >
              Buy Now
            </Button>
          </div>
        )}

        {step === 'payment' && paymentData && (
          <PaymentScreen paymentDetails={paymentData} onSuccess={handlePaymentSuccess} />
        )}

        {step === 'success' && successTx && (
          <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">Order Placed!</h2>
              <p className="text-zinc-500 mt-2">Your payment has been verified.</p>
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
            
            <Button className="w-full" onClick={resetFlow}>
              Continue Shopping
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}