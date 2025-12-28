import { NextResponse } from 'next/server';
import { processTransaction } from '@/lib/processor';

const SECRET_HASH = process.env.FLUTTERWAVE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('verif-hash');
    if (!signature || signature !== SECRET_HASH) {
      return NextResponse.json({}, { status: 401 });
    }

    const body = await req.json();
    const { txRef, status } = body.data;

    if (status === 'successful') {
      await processTransaction(txRef);
    }

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error("Webhook error", error);
    return NextResponse.json({}, { status: 500 });
  }
}