import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tx_ref = searchParams.get('tx_ref');

  if (!tx_ref) return new NextResponse('Missing Reference', { status: 400 });

  const tx = await prisma.transaction.findUnique({ where: { tx_ref } });

  if (!tx) return new NextResponse('Transaction Not Found', { status: 404 });

  // Generate a simple HTML receipt
  const html = `
    <html>
      <head><title>Receipt ${tx.tx_ref}</title></head>
      <body style="font-family: sans-serif; padding: 40px; text-align: center;">
        <div style="max-width: 400px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h1>SAUKI MART</h1>
            <p>Receipt</p>
            <hr style="border: 0; border-top: 1px dashed #ccc; margin: 20px 0;" />
            <p><strong>Amount:</strong> ₦${tx.amount.toLocaleString()}</p>
            <p><strong>Ref:</strong> ${tx.tx_ref}</p>
            <p><strong>Date:</strong> ${tx.createdAt.toLocaleString()}</p>
            <p><strong>Status:</strong> ${tx.status.toUpperCase()}</p>
            <p><strong>Item:</strong> ${tx.type === 'data' ? 'Data Bundle' : 'Store Item'}</p>
            <hr style="border: 0; border-top: 1px dashed #ccc; margin: 20px 0;" />
            <p style="font-size: 12px; color: #888;">Thank you for your patronage.</p>
        </div>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
