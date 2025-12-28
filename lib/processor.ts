import { prisma } from './prisma';
import { amigo } from './amigo';

export async function processTransaction(tx_ref: string) {
  // Use a transaction to ensure atomicity and row locking conceptually
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch current state
    const transaction = await tx.transaction.findUnique({
      where: { tx_ref }
    });

    if (!transaction) throw new Error("Transaction not found");

    // 2. Validate Transitions
    if (transaction.status === 'paid' || transaction.status === 'delivered') {
      return transaction;
    }

    if (transaction.status !== 'pending') {
      throw new Error(`Invalid status transition from ${transaction.status}`);
    }

    // 3. Update to PAID
    const paidTx = await tx.transaction.update({
      where: { tx_ref },
      data: { status: 'paid' }
    });

    // 4. Trigger Delivery (Only for DATA)
    if (paidTx.type === 'data' && paidTx.planId) {
      // Fetch plan details
      const plan = await tx.dataPlan.findUnique({ where: { id: paidTx.planId } });
      if (!plan) throw new Error("Plan not found for delivery");

      // Call Amigo
      const deliveryResult = await amigo.deliverData(
        plan.network as 'MTN' | 'AIRTEL' | 'GLO',
        paidTx.phone,
        plan.planId,
        paidTx.idempotencyKey
      );

      if (deliveryResult.success) {
        // Update to DELIVERED
        return await tx.transaction.update({
          where: { tx_ref },
          data: {
            status: 'delivered',
            deliveryData: deliveryResult as any
          }
        });
      } else {
        // Log failure but keep as PAID
        console.error("Amigo delivery failed", deliveryResult);
        return await tx.transaction.update({
            where: { tx_ref },
            data: {
                deliveryData: { error: deliveryResult } as any
            }
        });
      }
    }

    return paidTx;
  });
}