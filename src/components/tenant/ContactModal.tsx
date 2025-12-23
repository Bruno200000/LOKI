import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Phone, User, X, AlertCircle, CheckCircle, MessageCircle } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  houseId: number;
  ownerId: string;
  propertyType: string;
  neighborhood: string;
  ownerName: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  houseId,
  ownerId,
  propertyType,
  neighborhood,
  ownerName
}) => {
  const { user, profile } = useAuth();
  const [tenantName, setTenantName] = useState(profile?.full_name || '');
  const [tenantPhone, setTenantPhone] = useState(profile?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ownerPhone, setOwnerPhone] = useState<string | null>(null);
  const [contactRecorded, setContactRecorded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!tenantName.trim() || !tenantPhone.trim()) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    try {
      // Enregistrer l'action de contact
      const { error: contactError } = await supabase
        .from('property_contacts')
        .insert({
          house_id: houseId,
          owner_id: ownerId,
          tenant_id: user?.id || null,
          tenant_name: tenantName,
          tenant_phone: tenantPhone,
          property_type: propertyType,
          neighborhood: neighborhood || 'Quartier non précisé',
          owner_name: ownerName,
          status: 'contact_initiated',
          contact_date: new Date().toISOString()
        });

      if (contactError) throw contactError;

      // Récupérer le numéro du propriétaire
      const { data: ownerData, error: ownerError } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', ownerId)
        .single();

      if (ownerError) throw ownerError;

      setOwnerPhone(ownerData?.phone || 'Non disponible');
      setContactRecorded(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement du contact');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (ownerPhone && ownerPhone !== 'Non disponible') {
      const whatsappUrl = `https://wa.me/${ownerPhone.replace(/\D/g, '')}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleCallClick = () => {
    if (ownerPhone && ownerPhone !== 'Non disponible') {
      window.location.href = `tel:${ownerPhone}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-2">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-ci-orange-600" />
              Contacter le propriétaire
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {!contactRecorded ? (
            <>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Pour voir le numéro du propriétaire, veuillez fournir vos informations de contact.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="tenantName" className="block text-sm font-medium text-slate-700 mb-2">
                    Votre nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="tenantName"
                      type="text"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-green-500 focus:border-ci-green-500 outline-none transition"
                      placeholder="Entrez votre nom"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="tenantPhone" className="block text-sm font-medium text-slate-700 mb-2">
                    Votre numéro de téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="tenantPhone"
                      type="tel"
                      value={tenantPhone}
                      onChange={(e) => setTenantPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-green-500 focus:border-ci-green-500 outline-none transition"
                      placeholder="Votre numéro WhatsApp"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-ci-orange-600 hover:bg-ci-orange-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? 'Enregistrement...' : 'Voir le numéro du propriétaire'}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-medium">Contact enregistré avec succès!</p>
                  <p className="text-green-700 text-sm mt-1">Vous pouvez maintenant contacter le propriétaire.</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-ci-orange-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-ci-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{ownerName}</p>
                    <p className="text-sm text-slate-600">Propriétaire</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-lg">{ownerPhone}</p>
                    <p className="text-sm text-slate-600">Téléphone/WhatsApp</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCallClick}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
                >
                  <Phone className="w-4 h-4" />
                  Appeler
                </button>
                <button
                  onClick={handleWhatsAppClick}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={onClose}
                  className="text-slate-600 hover:text-slate-800 font-medium"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
