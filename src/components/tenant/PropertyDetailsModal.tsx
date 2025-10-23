import React, { useState } from 'react';
import { House } from '../../lib/supabase';
import { X, MapPin, Bed, Bath, Home as HomeIcon, Calendar, CheckCircle, Eye, Image as ImageIcon, Car, TreePine, Dumbbell, Shield, Wifi, Thermometer, Droplets, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface PropertyDetailsModalProps {
  house: House;
  onClose: () => void;
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({ house, onClose }) => {
  const { user } = useAuth();

  // Fonction pour générer un nombre de personnes regardant basé sur l'ID de la propriété
  const getViewersCount = (propertyId: number) => {
    // Convertir en string pour le hash
    const idString = propertyId.toString();
    // Utilise l'ID pour créer un nombre cohérent mais variable par propriété
    const hash = idString.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    return Math.abs(hash % 50) + 5; // Entre 5 et 54 personnes
  };

  const viewersCount = getViewersCount(house.id);

  // État pour le carrousel d'images
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fonctions de navigation du carrousel
  const nextImage = () => {
    if (house.photos) {
      setCurrentImageIndex((prev) => (prev + 1) % house.photos!.length);
    }
  };

  const prevImage = () => {
    if (house.photos) {
      setCurrentImageIndex((prev) => (prev - 1 + house.photos!.length) % house.photos!.length);
    }
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleBookingClick = () => {
    // Check if user is authenticated
    if (!user) {
      // Store the current URL for redirect after login
      sessionStorage.setItem('returnToProperty', window.location.href);
      // Redirect directly to login page
      window.location.href = '/';
      return;
    }

    // User is authenticated, redirect to booking form
    window.location.href = `/booking/${house.id}`;
  };

  const getButtonContent = () => {
    if (!user) {
      return (
        <>
          Se connecter pour réserver
        </>
      );
    }
    return (
      <>
        <Calendar className="w-5 h-5" />
        Réserver cette propriété
      </>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-6 flex items-center justify-between">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900">Détails de la propriété</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <div className="mb-6 sm:mb-8">
              <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden mb-4">
                {house.video_url ? (
                  <video
                    src={house.video_url}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : house.image_url ? (
                  <img
                    src={house.image_url}
                    alt={house.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <HomeIcon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400" />
                  </div>
                )}
              </div>

              {house.photos && house.photos.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    Photos de la propriété ({house.photos.length})
                  </h3>

                  {/* Carrousel d'images */}
                  <div className="relative">
                    <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden mb-4">
                      <img
                        src={house.photos[currentImageIndex]}
                        alt={`Photo ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(house.photos![currentImageIndex], '_blank')}
                      />
                    </div>

                    {/* Boutons de navigation */}
                    {house.photos.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-lg transition-all"
                        >
                          <ChevronLeft className="w-5 h-5 text-slate-700" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-lg transition-all"
                        >
                          <ChevronRight className="w-5 h-5 text-slate-700" />
                        </button>

                        {/* Indicateurs */}
                        <div className="flex justify-center gap-2 mt-3">
                          {house.photos.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => goToImage(index)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                index === currentImageIndex
                                  ? 'bg-ci-orange-600'
                                  : 'bg-slate-300 hover:bg-slate-400'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {house.virtual_tour_url && (
                <div className="mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    Visite virtuelle
                  </h3>
                  <div className="bg-slate-50 p-3 sm:p-4 rounded-lg">
                    <a
                      href={house.virtual_tour_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-ci-orange-600 hover:text-ci-orange-700 font-medium text-sm sm:text-base"
                    >
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      Voir la visite virtuelle 360°
                    </a>
                    <p className="text-sm text-slate-600 mt-1">
                      Explorez la propriété en réalité virtuelle
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                    Disponible
                  </span>
                  <div className="flex items-center gap-1 text-slate-600 text-sm sm:text-base">
                    <MapPin className="w-4 h-4" />
                    <span>{house.location}, {house.city}</span>
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-2xl sm:text-3xl font-bold text-ci-orange-600">
                    {house.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600">FCFA / mois</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{house.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{house.description}</p>

                  {/* Message des personnes regardant */}
                  <div className="mt-4 p-2">
                    <p className="text-red-500 font-medium text-sm flex items-center gap-2 animate-pulse">
                      <Eye className="w-4 h-4" />
                      <span className="text-red-600 font-bold">{viewersCount}</span>
                      personne{viewersCount > 1 ? 's' : ''} regarde{viewersCount > 1 ? 'nt' : ''} cette propriété en ce moment
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg text-center">
                    <Bed className="w-8 h-8 text-ci-orange-600 mx-auto mb-2" />
                    <div className="font-semibold text-slate-900">{house.bedrooms || 1}</div>
                    <div className="text-sm text-slate-600">Chambre{(house.bedrooms || 1) > 1 ? 's' : ''}</div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg text-center">
                    <Bath className="w-8 h-8 text-ci-orange-600 mx-auto mb-2" />
                    <div className="font-semibold text-slate-900">{house.bathrooms || 1}</div>
                    <div className="text-sm text-slate-600">Salle{(house.bathrooms || 1) > 1 ? 's' : ''} de bain</div>
                  </div>

                  {house.area_sqm && (
                    <div className="bg-slate-50 p-4 rounded-lg text-center">
                      <HomeIcon className="w-8 h-8 text-ci-orange-600 mx-auto mb-2" />
                      <div className="font-semibold text-slate-900">{house.area_sqm}</div>
                      <div className="text-sm text-slate-600">m²</div>
                    </div>
                  )}

                  <div className="bg-slate-50 p-4 rounded-lg text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="font-semibold text-green-700">Disponible</div>
                    <div className="text-sm text-slate-600">Statut</div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Informations sur la propriété</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {house.neighborhood && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-slate-600" />
                        <div>
                          <div className="font-medium text-slate-900">Quartier</div>
                          <div className="text-sm text-slate-600">{house.neighborhood}</div>
                        </div>
                      </div>
                    )}

                    {house.property_type && (
                      <div className="flex items-center gap-2">
                        <HomeIcon className="w-5 h-5 text-slate-600" />
                        <div>
                          <div className="font-medium text-slate-900">Type de propriété</div>
                          <div className="text-sm text-slate-600">{house.property_type}</div>
                        </div>
                      </div>
                    )}

                    {house.floor && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">Étage:</span>
                        <span className="font-medium text-slate-900">{house.floor}ème</span>
                      </div>
                    )}

                    {house.furnished && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">Meublé:</span>
                        <span className="font-medium text-green-600">Oui</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">Confort et équipements</h4>
                    <div className="space-y-2">
                      {house.air_conditioning && (
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-blue-600" />
                          <span className="text-slate-700">Climatisation</span>
                        </div>
                      )}
                      {house.heating && (
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-orange-600" />
                          <span className="text-slate-700">Chauffage</span>
                        </div>
                      )}
                      {house.hot_water && (
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-600" />
                          <span className="text-slate-700">Eau chaude</span>
                        </div>
                      )}
                      {house.internet && (
                        <div className="flex items-center gap-2">
                          <Wifi className="w-4 h-4 text-green-600" />
                          <span className="text-slate-700">Internet</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">Sécurité et services</h4>
                    <div className="space-y-2">
                      {house.parking && (
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-slate-600" />
                          <span className="text-slate-700">Parking</span>
                        </div>
                      )}
                      {house.elevator && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700">Ascenseur</span>
                        </div>
                      )}
                      {house.balcony && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700">Balcon/Terrasse</span>
                        </div>
                      )}
                      {house.garden && (
                        <div className="flex items-center gap-2">
                          <TreePine className="w-4 h-4 text-green-600" />
                          <span className="text-slate-700">Jardin</span>
                        </div>
                      )}
                      {house.pool && (
                        <div className="flex items-center gap-2">
                          <Dumbbell className="w-4 h-4 text-blue-600" />
                          <span className="text-slate-700">Piscine</span>
                        </div>
                      )}
                      {house.security_cameras && (
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-slate-600" />
                          <span className="text-slate-700">Caméras de surveillance</span>
                        </div>
                      )}
                      {house.guardian && (
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-slate-600" />
                          <span className="text-slate-700">Gardien</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {(house.proximity_transport || house.proximity_schools || house.proximity_shops || house.proximity_green_spaces) && (
                  <div className="bg-slate-50 p-6 rounded-lg">
                    <h4 className="text-lg font-semibold text-slate-900 mb-4">Environnement</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {house.proximity_transport && (
                        <div>
                          <div className="font-medium text-slate-900">Transports</div>
                          <div className="text-sm text-slate-600">{house.proximity_transport}</div>
                        </div>
                      )}
                      {house.proximity_schools && (
                        <div>
                          <div className="font-medium text-slate-900">Écoles</div>
                          <div className="text-sm text-slate-600">{house.proximity_schools}</div>
                        </div>
                      )}
                      {house.proximity_shops && (
                        <div>
                          <div className="font-medium text-slate-900">Commerces</div>
                          <div className="text-sm text-slate-600">{house.proximity_shops}</div>
                        </div>
                      )}
                      {house.proximity_green_spaces && (
                        <div>
                          <div className="font-medium text-slate-900">Espaces verts</div>
                          <div className="text-sm text-slate-600">{house.proximity_green_spaces}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Informations financières</h4>
                  <div className="space-y-3">
                    {house.deposit_amount && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Caution</span>
                        <span className="font-semibold">{house.deposit_amount.toLocaleString()} FCFA</span>
                      </div>
                    )}
                    {house.agency_fees && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Frais d'agence</span>
                        <span className="font-semibold">{house.agency_fees.toLocaleString()} FCFA</span>
                      </div>
                    )}
                    {house.utilities_included && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-slate-700">Charges incluses dans le loyer</span>
                      </div>
                    )}
                    {house.utilities_amount && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Provision pour charges</span>
                        <span className="font-semibold">{house.utilities_amount.toLocaleString()} FCFA/mois</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4">Conditions de location</h4>
                  <div className="space-y-3">
                    {house.minimum_rental_period && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Durée minimale</span>
                        <span className="font-semibold">{house.minimum_rental_period} mois</span>
                      </div>
                    )}
                    {house.availability_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Disponible à partir du</span>
                        <span className="font-semibold">{new Date(house.availability_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {house.amenities && house.amenities.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 mb-3">Équipements supplémentaires</h4>
                    <div className="flex flex-wrap gap-2">
                      {house.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-ci-orange-100 text-ci-orange-700 rounded-full text-sm font-medium"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-slate-50 rounded-lg p-4 sm:p-6 sticky top-6">
                  <h4 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">Réserver cette propriété</h4>

                  <div className="space-y-3 sm:space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 text-sm sm:text-base">Loyer mensuel</span>
                      <span className="font-semibold text-base sm:text-lg">{house.price.toLocaleString()} FCFA</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 text-sm sm:text-base">Commission plateforme</span>
                      <span className="font-semibold text-base sm:text-lg">1 000 FCFA</span>
                    </div>

                    <div className="border-t pt-3 sm:pt-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 text-sm sm:text-base">Total à payer maintenant</span>
                        <span className="text-xl sm:text-2xl font-bold text-ci-orange-600">1 000 FCFA</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleBookingClick}
                    className="w-full font-semibold py-3 sm:py-4 rounded-lg transition flex items-center justify-center gap-2 bg-ci-orange-600 hover:bg-ci-orange-700 text-white text-sm sm:text-base"
                  >
                    {getButtonContent()}
                  </button>

                  <p className="text-xs text-slate-500 mt-3 text-center">
                    Vous ne paierez que la commission de 1 000 FCFA maintenant.
                    Le premier mois de loyer sera payé directement au propriétaire.
                    Vous aurez les informations du propriétaire une fois le paiement effectué.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
