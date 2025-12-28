import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  productId: z.string(),
  phone: z.string(),
  name: z.string(),
  state: z.string()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, phone, name, state } = schema.parse(body);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const tx_ref = `SKM-STORE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await prisma.transaction.create({
      data: {
        tx_ref,
        type: 'ecommerce',
        status: 'pending',
        phone,
        amount: product.price,
        productId: product.id,
        customerName: name,
        deliveryState: state,
        idempotencyKey: crypto.randomUUID(),
      }
    });
    
    return NextResponse.json({
      tx_ref,
      amount: product.price,
      bank: "Wema Bank",
      account_number: "7812093842",
      account_name: "SAUKI MART / FLW"
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}