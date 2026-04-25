import React, { useEffect, useState } from 'react';
import { supabase, Booking, House, Profile } from '../../lib/supabase';
import { CheckCircle, XCircle, Loader, Home, ArrowRight, MapPin, Bed, Bath, Building2, Phone, Mail, User, Calendar, CreditCard } from 'lucide-react';

interface BookingWithDetails extends Omit<Booking, 'house_info' | 'owner_profile'> {
  house_info?: House | null;
  owner_profile?: Profile | null;
}

export const PaymentSuccess: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | 'pending'>('pending');
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    const initializeSuccessPage = async () => {
      // Récupérer les paramètres d'URL
      const urlParams = new URLSearchParams(window.location.search);
      const bookingId = urlParams.get('booking_id');
      const amount = urlParams.get('amount');
      const status = urlParams.get('status');

      // Si pas de paramètres URL, afficher une page d'instruction
      if (!bookingId || !amount || !status) {
        setPaymentStatus('pending');
        setLoading(false);
        return;
      }

      try {
        // Récupérer les détails complets de la réservation avec les informations du propriétaire
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            *,
            house_info:houses(*),
            owner_profile:profiles!bookings_owner_id_fkey(*)
          `)
          .eq('id', bookingId)
          .single();

        if (bookingError) throw bookingError;

        // Mettre à jour le statut de la réservation
        await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', bookingId);

        // Créer l'enregistrement de paiement
        if (amount) {
          await supabase
            .from('payments')
            .insert({
              booking_id: parseInt(bookingId),
              amount: parseFloat(amount),
              payment_type: 'commission',
              payment_method: 'wave',
              status: 'completed',
              paid_by: bookingData.tenant_id,
              completed_at: new Date().toISOString()
            });
        }

        setBooking(bookingData);
        setPaymentStatus('success');
        setPaymentInfo({ amount: amount || '1000', currency: 'XOF' });

      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        setPaymentStatus('error');
      } finally {
        setLoading(false);
      }
    };

    initializeSuccessPage();
  }, []);

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleViewBooking = () => {
    window.location.href = '/?view=dashboard';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-ci-orange-600 mx-auto mb-4" />
          <p className="text-slate-600">Finalisation de votre réservation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {paymentStatus === 'pending' ? (
            <>
              <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">ℹ️</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-blue-800">Finalisation de réservation</h1>
                    <p className="text-blue-700">Complétez votre réservation après le paiement</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Récupération des détails de réservation</h2>
                  <p className="text-slate-600">
                    Pour finaliser votre réservation et obtenir les coordonnées du propriétaire, veuillez utiliser le lien ci-dessous après avoir effectué votre paiement sur Wave.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 Instructions</h3>
                  <ol className="text-sm text-blue-700 space-y-2 mb-4">
                    <li>1. Cliquez sur le bouton "Payer avec Wave" sur la page précédente</li>
                    <li>2. Effectuez le paiement de 1 000 FCFA sur l'application Wave</li>
                    <li>3. Revenez à cette page en utilisant le lien ci-dessous</li>
                    <li>4. Vous obtiendrez alors tous les détails de la propriété et les coordonnées du propriétaire</li>
                  </ol>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href="/payment/success?booking_id=123&amount=1000&status=success"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      J'ai terminé le paiement - Afficher les détails
                    </a>

                    <button
                      onClick={() => window.history.back()}
                      className="border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      Retour à la page de paiement
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-4">
                    💡 Si vous avez déjà effectué le paiement, utilisez le bouton ci-dessus pour accéder aux détails de votre réservation.
                  </p>
                </div>
              </div>
            </>
          ) : paymentStatus === 'success' ? (
            <>
              <div className="px-6 py-4 bg-green-50 border-b border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-green-800">Réservation confirmée !</h1>
                    <p className="text-green-700">Votre paiement a été traité avec succès</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Récapitulatif de votre réservation</h2>

                  {booking && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Détails de la propriété */}
                      <div className="bg-slate-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <Home className="w-5 h-5" />
                          Détails de la propriété
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-slate-900 text-lg">{booking.house_info?.title}</h4>
                            <div className="flex items-center text-slate-600 mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{booking.house_info?.location}, {booking.house_info?.city}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center text-slate-600">
                              <Bed className="w-4 h-4 mr-2" />
                              <span>{booking.house_info?.bedrooms} chambre{booking.house_info?.bedrooms !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center text-slate-600">
                              <Bath className="w-4 h-4 mr-2" />
                              <span>{booking.house_info?.bathrooms} salle{booking.house_info?.bathrooms !== 1 ? 's' : ''} de bain</span>
                            </div>
                            {booking.house_info?.area_sqm && (
                              <div className="flex items-center text-slate-600">
                                <Building2 className="w-4 h-4 mr-2" />
                                <span>{booking.house_info.area_sqm} m²</span>
                              </div>
                            )}
                            <div className="flex items-center text-slate-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>À partir du {new Date(booking.move_in_date).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Loyer mensuel</span>
                              <span className="font-semibold text-lg">{booking.monthly_rent?.toLocaleString()} FCFA</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Informations du propriétaire */}
                      <div className="bg-slate-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Informations du propriétaire
                        </h3>

                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-ci-orange-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-ci-orange-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{booking.owner_profile?.full_name || 'Propriétaire'}</p>
                              <p className="text-sm text-slate-600">Propriétaire</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {booking.owner_profile?.phone && (
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <Phone className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-slate-600">Téléphone</p>
                                  <a
                                    href={`tel:${booking.owner_profile.phone}`}
                                    className="font-semibold text-ci-orange-600 hover:text-ci-orange-700"
                                  >
                                    {booking.owner_profile.phone}
                                  </a>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Mail className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-sm text-slate-600">Email</p>
                                <a
                                  href={`mailto:${booking.owner_profile?.email || 'contact@loki.app'}`}
                                  className="font-semibold text-ci-orange-600 hover:text-ci-orange-700"
                                >
                                  {booking.owner_profile?.email || 'contact@loki.app'}
                                </a>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-200">
                            <p className="text-sm text-slate-600">
                              💡 Contactez le propriétaire pour organiser la visite et la remise des clés.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Informations de paiement */}
                  {paymentInfo && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-green-800">Paiement de la commission</h3>
                          <p className="text-green-700">
                            Montant payé : <strong>{paymentInfo.amount} {paymentInfo.currency}</strong>
                          </p>
                          <p className="text-sm text-green-600 mt-1">
                            Commission plateforme pour la confirmation de réservation
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleViewBooking}
                    className="bg-ci-orange-600 hover:bg-ci-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <Home className="w-5 h-5" />
                    Voir mes réservations
                  </button>

                  <button
                    onClick={handleGoHome}
                    className="border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Retour à l'accueil
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-red-800">Erreur</h1>
                    <p className="text-red-700">Une erreur s'est produite lors de la confirmation</p>
                  </div>
                </div>
              </div>

              <div className="p-6 text-center">
                <p className="text-slate-600 mb-6">
                  Veuillez contacter le support si le problème persiste.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleGoHome}
                    className="bg-ci-orange-600 hover:bg-ci-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition"
                  >
                    Retour à l'accueil
                  </button>

                  <button
                    onClick={() => window.location.href = '/contact'}
                    className="border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold py-3 px-6 rounded-lg transition"
                  >
                    Contactez le support
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
