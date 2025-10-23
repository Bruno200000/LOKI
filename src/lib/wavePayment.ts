import { supabase } from './supabase';

export interface WavePaymentData {
  amount: number;
  currency: string;
  error_url: string;
  success_url: string;
  description?: string;
  customer_email?: string;
  customer_phone?: string;
}

export class WavePaymentService {
  private apiKey: string;
  private baseUrl: string = 'https://api.wave.com/v1';

  constructor(apiKey: string) {
    if (!apiKey || apiKey.startsWith('wave_sn_prod_') && apiKey.length < 20) {
      throw new Error('Clé API Wave non configurée. Veuillez définir WAVE_API_KEY dans les variables d\'environnement.');
    }
    this.apiKey = apiKey;
  }

  /**
   * Crée une session de paiement Wave
   */
  async createCheckoutSession(paymentData: WavePaymentData): Promise<{ session_url: string; session_id: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/checkout/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'LOKI-Platform/1.0',
        },
        body: JSON.stringify({
          amount: paymentData.amount.toString(),
          currency: paymentData.currency,
          error_url: paymentData.error_url,
          success_url: paymentData.success_url,
          description: paymentData.description || 'Paiement LOKI',
          customer_email: paymentData.customer_email,
          customer_phone: paymentData.customer_phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur Wave API: ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la session de paiement Wave:', error);
      throw error;
    }
  }

  /**
   * Vérifie le statut d'un paiement
   */
  async checkPaymentStatus(sessionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/checkout/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'LOKI-Platform/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la vérification du paiement: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la vérification du paiement:', error);
      throw error;
    }
  }

  /**
   * Enregistre le paiement dans la base de données
   */
  async recordPayment(paymentData: {
    user_id: string;
    amount: number;
    currency: string;
    wave_session_id: string;
    description: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('payments')
        .insert([{
          ...paymentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);

      if (error) {
        throw new Error(`Erreur lors de l'enregistrement du paiement: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
      throw error;
    }
  }

  /**
   * Met à jour le statut d'un paiement
   */
  async updatePaymentStatus(waveSessionId: string, status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('wave_session_id', waveSessionId);

      if (error) {
        throw new Error(`Erreur lors de la mise à jour du paiement: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paiement:', error);
      throw error;
    }
  }
}

// Initialisation sécurisée du service
const getWaveApiKey = (): string => {
  const apiKey = import.meta.env.VITE_WAVE_API_KEY;

  if (!apiKey) {
    console.error('❌ Clé API Wave manquante. Veuillez configurer VITE_WAVE_API_KEY dans votre fichier .env');
    throw new Error('Configuration de paiement manquante');
  }

  return apiKey;
};

// Instance du service (sera initialisée avec la vraie clé API depuis les variables d'environnement)
export const wavePaymentService = new WavePaymentService(getWaveApiKey());
