import React from 'react';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

async function getStats() {
  const totalTx = await prisma.transaction.count();
  const successfulTx = await prisma.transaction.count({ where: { status: 'delivered' } });
  const pendingTx = await prisma.transaction.count({ where: { status: 'pending' } });
  return { totalTx, successfulTx, pendingTx };
}

export const dynamic = 'force-dynamic';

export default async function AdminPage({ searchParams }: { searchParams: { pass?: string } }) {
  // Ultra-simple password protection
  if (searchParams.pass !== process.env.ADMIN_PASSWORD_HASH) {
    return (
      <div className="p-10 flex flex-col items-center">
         <h1 className="text-2xl font-bold mb-4">Admin Access</h1>
         <p>Please provide the password in the URL query (?pass=...)</p>
      </div>
    );
  }

  const stats = await getStats();
  const recentTxs = await prisma.transaction.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6">SAUKI MART Admin</h1>
      
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-100 p-6 rounded-xl">
           <h3 className="text-sm uppercase text-slate-500 font-bold">Total Trans</h3>
           <p className="text-4xl font-bold">{stats.totalTx}</p>
        </div>
        <div className="bg-green-100 p-6 rounded-xl text-green-800">
           <h3 className="text-sm uppercase text-green-600 font-bold">Success</h3>
           <p className="text-4xl font-bold">{stats.successfulTx}</p>
        </div>
        <div className="bg-amber-100 p-6 rounded-xl text-amber-800">
           <h3 className="text-sm uppercase text-amber-600 font-bold">Pending</h3>
           <p className="text-4xl font-bold">{stats.pendingTx}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-3">Ref</th>
              <th className="p-3">Type</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentTxs.map(tx => (
              <tr key={tx.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="p-3 font-mono text-xs">{tx.tx_ref}</td>
                <td className="p-3 capitalize">{tx.type}</td>
                <td className="p-3">{tx.phone}</td>
                <td className="p-3">₦{tx.amount}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    tx.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    tx.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                    tx.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {tx.status}
                  </span>
                </td>
                <td className="p-3 text-slate-500">{tx.createdAt.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
