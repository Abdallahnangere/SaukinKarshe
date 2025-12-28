const BASE_URL = process.env.AMIGO_BASE_URL || 'https://amigo.ng'; 
const API_KEY = process.env.AMIGO_API_KEY!;

interface AmigoResponse {
  success: boolean;
  message?: string;
  reference?: string;
  error?: string;
  status?: string;
}

export const amigo = {
  deliverData: async (
    network: 'MTN' | 'AIRTEL' | 'GLO',
    mobile_number: string,
    planId: number,
    idempotencyKey: string
  ): Promise<AmigoResponse> => {
    // Map network string to Amigo Network IDs
    // 1=MTN, 2=Glo, 4=Airtel
    const networkMap: Record<string, number> = {
      'MTN': 1,
      'GLO': 2,
      'AIRTEL': 4 
    };

    const networkId = networkMap[network];
    if (!networkId) {
      return { success: false, error: 'Invalid network' };
    }

    try {
      const payload = {
        network: networkId,
        mobile_number,
        plan: planId,
        Ported_number: false
      };

      // Using Authorization: Bearer as per user request
      const response = await fetch(`${BASE_URL}/api/data/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      // Amigo success checks
      if (data.success === true || data.status === 'delivered') {
        return { success: true, ...data };
      }

      return { 
        success: false, 
        error: data.error || 'Unknown Amigo Error',
        message: data.message 
      };

    } catch (error: any) {
      console.error('Amigo Delivery Error:', error);
      return { success: false, error: error.message };
    }
  }
};