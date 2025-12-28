import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processTransaction } from '@/lib/processor';

const FLW_SECRET = process.env.FLUTTERWAVE_SECRET_KEY!;

export async function POST(req: Request) {
  try {
    const { tx_ref } = await req.json();

    const tx = await prisma.transaction.findUnique({ where: { tx_ref } });
    if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

    if (tx.status === 'delivered' || tx.status === 'paid') {
      return NextResponse.json(tx);
    }

    const flwRes = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`, {
      headers: { Authorization: `Bearer ${FLW_SECRET}` }
    });
    
    const flwData = await flwRes.json();

    if (flwData.status === 'success' && flwData.data.status === 'successful') {
        if (flwData.data.amount < tx.amount) {
            return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 });
        }
        const updatedTx = await processTransaction(tx_ref);
        return NextResponse.json(updatedTx);
    } else {
        return NextResponse.json(tx); 
    }

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}