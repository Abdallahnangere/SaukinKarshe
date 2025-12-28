import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get('phone');

  if (!phone) return NextResponse.json([], { status: 400 });

  const txs = await prisma.transaction.findMany({
    where: { phone },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  return NextResponse.json(txs);
}