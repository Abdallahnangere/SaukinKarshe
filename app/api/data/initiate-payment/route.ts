import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  planId: z.string(),
  phone: z.string().min(10)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, phone } = schema.parse(body);

    const plan = await prisma.dataPlan.findUnique({ where: { id: planId } });
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    const tx_ref = `SKM-DATA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await prisma.transaction.create({
      data: {
        tx_ref,
        type: 'data',
        status: 'pending',
        phone,
        amount: plan.price,
        planId: plan.id,
        idempotencyKey: crypto.randomUUID(),
      }
    });

    return NextResponse.json({
      tx_ref,
      amount: plan.price,
      bank: "Wema Bank", 
      account_number: "7812093842", 
      account_name: "SAUKI MART / FLW"
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}