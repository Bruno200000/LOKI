import React, { useState, useEffect } from 'react';
import { supabase, Profile } from '../../lib/supabase';
import { User, Phone, MapPin, Eye, EyeOff } from 'lucide-react';

interface OwnerContactInfoProps {
  ownerId: string;
  bookingId: string;
}

export const OwnerContactInfo: React.FC<OwnerContactInfoProps> = ({ ownerId, bookingId }) => {
  const [owner, setOwner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchOwnerInfo();
  }, [ownerId]);

  const fetchOwnerInfo = async () => {
    try {
      // Check if commission payment is completed for this booking
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .eq('payment_type', 'commission')
        .eq('status', 'completed')
        .single();

      if (paymentError || !payment) {
        setError('Le paiement de la commission doit être complété pour voir les informations du propriétaire');
        setLoading(false);
        return;
      }

      // Fetch owner information
      const { data: ownerData, error: ownerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', ownerId)
        .single();

      if (ownerError) throw ownerError;

      setOwner(ownerData);
      setIsVisible(true);
    } catch (err: any) {
      setError('Erreur lors du chargement des informations du propriétaire');
      console.error('Error fetching owner info:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Eye className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-amber-800 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!owner || !isVisible) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-ci-orange-600" />
          Informations du propriétaire
        </h3>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="p-2 hover:bg-slate-100 rounded-lg transition"
        >
          {isVisible ? <EyeOff className="w-5 h-5 text-slate-600" /> : <Eye className="w-5 h-5 text-slate-600" />}
        </button>
      </div>

      {isVisible && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ci-orange-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-ci-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{owner.full_name || 'Nom non disponible'}</p>
              <p className="text-sm text-slate-600">Propriétaire</p>
            </div>
          </div>

          {owner.phone && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{owner.phone}</p>
                <p className="text-sm text-slate-600">Téléphone</p>
              </div>
            </div>
          )}

          {owner.city && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{owner.city}</p>
                <p className="text-sm text-slate-600">Ville</p>
              </div>
            </div>
          )}

          {owner.address && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{owner.address}</p>
                <p className="text-sm text-slate-600">Adresse</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-800">
          <strong>Note:</strong> Ces informations sont visibles car vous avez payé la commission de plateforme de 1 000 FCFA.
        </p>
      </div>
    </div>
  );
};
