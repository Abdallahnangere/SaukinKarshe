import { Transaction, PaymentInitResponse, Product, DataPlan } from '../types';

// In Next.js App Router, relative URLs work automatically for internal APIs
const API_BASE = ''; 

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed: ${response.status}`);
  }
  return response.json();
}

export const api = {
  products: {
    list: async (): Promise<Product[]> => {
      const res = await fetch(`${API_BASE}/api/products`);
      return handleResponse<Product[]>(res);
    },
  },
  data: {
    listPlans: async (): Promise<DataPlan[]> => {
      const res = await fetch(`${API_BASE}/api/data-plans`);
      return handleResponse<DataPlan[]>(res);
    },
    initiatePayment: async (data: { planId: string; phone: string }): Promise<PaymentInitResponse> => {
      const res = await fetch(`${API_BASE}/api/data/initiate-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<PaymentInitResponse>(res);
    },
  },
  ecommerce: {
    initiatePayment: async (data: { productId: string; phone: string; name: string; state: string }): Promise<PaymentInitResponse> => {
      const res = await fetch(`${API_BASE}/api/ecommerce/initiate-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<PaymentInitResponse>(res);
    },
  },
  transactions: {
    verify: async (tx_ref: string): Promise<Transaction> => {
      const res = await fetch(`${API_BASE}/api/transactions/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx_ref }),
      });
      return handleResponse<Transaction>(res);
    },
    track: async (phone: string): Promise<Transaction[]> => {
      const res = await fetch(`${API_BASE}/api/transactions/track?phone=${encodeURIComponent(phone)}`);
      return handleResponse<Transaction[]>(res);
    },
  },
  receipt: {
    generateUrl: (tx_ref: string) => `${API_BASE}/api/receipt/generate?tx_ref=${tx_ref}`,
  }
};