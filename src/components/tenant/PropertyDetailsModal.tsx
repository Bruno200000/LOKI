import React, { useState } from 'react';
import { House, supabase } from '../../lib/supabase';
import { X, MapPin, Bed, Bath, Home as HomeIcon, Calendar, CheckCircle, Eye, Image as ImageIcon, Car, TreePine, Dumbbell, Shield, Wifi, Thermometer, Droplets, ChevronLeft, ChevronRight, Phone, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ContactModal } from './ContactModal';

interface PropertyDetailsModalProps {
  house: House;
  onClose: () => void;
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({ house, onClose }) => {
  const { user } = useAuth();

  // Fonction pour générer un nombre de personnes regardant basé sur l'ID de la propriété
  const getViewersCount = (propertyId: number | string) => {
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

  // State for contact modal
  const [showContactModal, setShowContactModal] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState<{ name: string; phone: string } | null>(null);

  // Fetch owner info for contact modal
  const handleContactClick = async () => {
    if (!user) {
      sessionStorage.setItem('returnToProperty', window.location.href);
      window.location.href = '/?login=true';
      return;
    }

    if (ownerInfo) {
      setShowContactModal(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', house.owner_id)
        .single();

      if (error) throw error;

      setOwnerInfo({
        name: data?.full_name || 'Nom non disponible',
        phone: data?.phone || 'Non disponible'
      });
      setShowContactModal(true);
    } catch (err) {
      console.error('Error fetching owner info:', err);
      setOwnerInfo({
        name: 'Nom non disponible',
        phone: 'Non disponible'
      });
      setShowContactModal(true);
    }
  };

  const handleBookingClick = () => {
    if (!user) {
      sessionStorage.setItem('returnToProperty', window.location.href);
      window.location.href = '/?login=true';
      return;
    }
    window.location.href = `/booking/${house.id}`;
  };

  const isResidence = house.type === 'residence';

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-0 sm:mx-2 lg:mx-4 max-w-7xl">
          <div className="sticky top-0 bg-white border-b border-slate-200 p-3 sm:p-4 lg:p-6 flex items-center justify-between">
            <h2 className="text-base sm:text-lg lg:text-2xl font-bold text-slate-900">Détails de la propriété</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-slate-600" />
            </button>
          </div>

          <div className="p-3 sm:p-4 lg:p-6">
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden mb-3 sm:mb-4">
                {/* Afficher la vidéo principale ou la première vidéo du tableau */}
                {(() => {
                  // Priorité: video_url d'abord, puis videos[] si video_url n'existe pas
                  // Gérer le cas où house.videos est undefined (au lieu d'un tableau vide)
                  const videosToShow = house.video_url
                    ? [house.video_url]
                    : ((house.videos !== undefined && house.videos !== null && house.videos.length > 0) ? house.videos : []);
                  const mainVideo = videosToShow.length > 0 ? videosToShow[0] : null;

                  if (mainVideo) {
                    return (
                      <video
                        src={mainVideo}
                        controls
                        muted
                        autoPlay
                        loop
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Erreur de chargement vidéo:', mainVideo, e);
                          e.currentTarget.style.display = 'none';
                          if (house.image_url) {
                            const imgFallback = document.createElement('img');
                            imgFallback.src = house.image_url;
                            imgFallback.alt = house.title;
                            imgFallback.className = 'w-full h-full object-cover';
                            e.currentTarget.parentNode?.appendChild(imgFallback);
                          }
                        }}
                        onLoadStart={() => {
                          console.log('Chargement de la vidéo:', mainVideo);
                        }}
                      >
                        Votre navigateur ne supporte pas la lecture de vidéos.
                      </video>
                    );
                  }

                  // Afficher l'image principale si pas de vidéo
                  if (house.image_url) {
                    return (
                      <img
                        src={house.image_url}
                        alt={house.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Erreur de chargement image:', house.image_url, e);
                        }}
                      />
                    );
                  }

                  return (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                      <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400" />
                    </div>
                  );
                })()}
              </div>

              {/* Afficher les vidéos supplémentaires si disponibles */}
              {(() => {
                // Priorité: video_url d'abord, puis videos[] si video_url n'existe pas
                // Gérer le cas où house.videos est undefined (au lieu d'un tableau vide)
                const videosToShow = house.video_url
                  ? [house.video_url]
                  : ((house.videos !== undefined && house.videos !== null && house.videos.length > 0) ? house.videos : []);

                // N'afficher les vidéos supplémentaires que s'il y en a plus d'une
                if (videosToShow.length > 1) {
                  return (
                    <div className="mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        Vidéos de la propriété ({videosToShow.length})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {videosToShow.slice(1).map((videoUrl, index) => (
                          <div key={index + 1} className="aspect-video bg-slate-200 rounded-lg overflow-hidden">
                            <video
                              src={videoUrl}
                              controls
                              muted
                              autoPlay
                              loop
                              playsInline
                              preload="metadata"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Erreur de chargement vidéo:', videoUrl, e);
                                e.currentTarget.style.display = 'none';
                              }}
                            >
                              Votre navigateur ne supporte pas la lecture de vidéos.
                            </video>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

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
                              className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex
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

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-8">
              <div className="xl:col-span-2 space-y-4 lg:space-y-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 lg:mb-3">{house.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4 text-sm sm:text-base">{house.description}</p>

                  {/* Afficher les documents de description */}
                  {house.description_documents && house.description_documents.length > 0 && (
                    <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-slate-50 rounded-lg">
                      <h4 className="text-base lg:text-lg font-semibold text-slate-900 mb-2 lg:mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 lg:w-5 lg:h-5" />
                        <span className="text-sm lg:text-base">Documents et images</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3">
                        {house.description_documents.map((doc: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 lg:p-3 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 lg:gap-3">
                              {doc.type === 'image' ? (
                                <img
                                  src={doc.url}
                                  alt={doc.name}
                                  className="w-12 h-12 lg:w-16 lg:h-16 object-cover rounded border border-slate-200"
                                />
                              ) : (
                                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-slate-100 rounded border border-slate-200 flex items-center justify-center">
                                  <FileText className="w-6 h-6 lg:w-8 lg:h-8 text-slate-500" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs lg:text-sm font-medium text-slate-900 truncate">{doc.name}</p>
                                <p className="text-xs text-slate-500">{doc.type === 'image' ? 'Image' : 'Document'}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => window.open(doc.url, '_blank')}
                              className="p-1 lg:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Voir le document"
                            >
                              <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message des personnes regardant */}
                  <div className="mt-3 lg:mt-4 p-2 lg:p-3">
                    <p className="text-red-500 font-medium text-xs sm:text-sm flex items-center gap-2 animate-pulse">
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-red-600 font-bold">{viewersCount}</span>
                      <span className="text-xs sm:text-sm">personne{viewersCount > 1 ? 's' : ''} regarde{viewersCount > 1 ? 'nt' : ''} cette propriété en ce moment</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
                  <div className="bg-slate-50 p-3 lg:p-4 rounded-lg text-center">
                    <Bed className="w-6 h-6 lg:w-8 lg:h-8 text-ci-orange-600 mx-auto mb-2" />
                    <div className="font-semibold text-slate-900 text-sm lg:text-base">{house.bedrooms || 1}</div>
                    <div className="text-xs lg:text-sm text-slate-600">Chambre{(house.bedrooms || 1) > 1 ? 's' : ''}</div>
                  </div>

                  <div className="bg-slate-50 p-3 lg:p-4 rounded-lg text-center">
                    <Bath className="w-6 h-6 lg:w-8 lg:h-8 text-ci-orange-600 mx-auto mb-2" />
                    <div className="font-semibold text-slate-900 text-sm lg:text-base">{house.bathrooms || 1}</div>
                    <div className="text-xs lg:text-sm text-slate-600">Salle{(house.bathrooms || 1) > 1 ? 's' : ''} de bain</div>
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

                <div className="bg-slate-50 p-4 lg:p-6 rounded-lg">
                  <h4 className="text-base lg:text-lg font-semibold text-slate-900 mb-3 lg:mb-4">Informations sur la propriété</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                    {house.neighborhood && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 lg:w-5 lg:h-5 text-slate-600" />
                        <div>
                          <div className="font-medium text-slate-900 text-sm lg:text-base">Quartier</div>
                          <div className="text-xs lg:text-sm text-slate-600">{house.neighborhood}</div>
                        </div>
                      </div>
                    )}

                    {house.type && (
                      <div className="flex items-center gap-2">
                        <HomeIcon className="w-4 h-4 lg:w-5 lg:h-5 text-slate-600" />
                        <div>
                          <div className="font-medium text-slate-900 text-sm lg:text-base">Type</div>
                          <div className="text-xs lg:text-sm text-slate-600">{house.type}</div>
                        </div>
                      </div>
                    )}

                    {house.floor && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 text-sm lg:text-base">Étage:</span>
                        <span className="font-medium text-slate-900 text-sm lg:text-base">{house.floor}ème</span>
                      </div>
                    )}

                    {house.furnished && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 text-sm lg:text-base">Meublé:</span>
                        <span className="font-medium text-green-600 text-sm lg:text-base">Oui</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <h4 className="text-base lg:text-lg font-semibold text-slate-900 mb-2 lg:mb-3">Confort et équipements</h4>
                    <div className="space-y-1 lg:space-y-2">
                      {house.air_conditioning && (
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-blue-600" />
                          <span className="text-slate-700 text-sm lg:text-base">Climatisation</span>
                        </div>
                      )}
                      {house.heating && (
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-orange-600" />
                          <span className="text-slate-700 text-sm lg:text-base">Chauffage</span>
                        </div>
                      )}
                      {house.hot_water && (
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-600" />
                          <span className="text-slate-700 text-sm lg:text-base">Eau chaude</span>
                        </div>
                      )}
                      {house.internet && (
                        <div className="flex items-center gap-2">
                          <Wifi className="w-4 h-4 text-green-600" />
                          <span className="text-slate-700 text-sm lg:text-base">Internet</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-base lg:text-lg font-semibold text-slate-900 mb-2 lg:mb-3">Sécurité et services</h4>
                    <div className="space-y-1 lg:space-y-2">
                      {house.parking && (
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-slate-600" />
                          <span className="text-slate-700 text-sm lg:text-base">Parking</span>
                        </div>
                      )}
                      {house.elevator && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700 text-sm lg:text-base">Ascenseur</span>
                        </div>
                      )}
                      {house.balcony && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700 text-sm lg:text-base">Balcon/Terrasse</span>
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
                <div className="bg-slate-50 rounded-lg p-3 sm:p-4 lg:p-6 sticky top-6">
                  <h4 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
                    {isResidence ? 'Réserver cette résidence' : 'Contacter le propriétaire'}
                  </h4>

                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 text-sm sm:text-base">
                        {house.type === 'land' ? 'Prix de vente' : 'Loyer mensuel'}
                      </span>
                      <span className="font-semibold text-base sm:text-lg lg:text-xl">{house.price.toLocaleString()} FCFA</span>
                    </div>

                    {isResidence && (
                      <div className="bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-100">
                        <p className="text-xs sm:text-sm text-blue-800">
                          Réservation gratuite. Payez directement le propriétaire.
                        </p>
                      </div>
                    )}
                  </div>

                  {isResidence ? (
                    <button
                      onClick={handleBookingClick}
                      className="w-full font-semibold py-2.5 sm:py-3 lg:py-4 rounded-lg transition flex items-center justify-center gap-2 bg-ci-orange-600 hover:bg-ci-orange-700 text-white text-sm sm:text-base"
                    >
                      {user ? (
                        <>
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>Réserver maintenant</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>Se connecter pour réserver</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={handleContactClick}
                        className="w-full font-semibold py-2.5 sm:py-3 lg:py-4 rounded-lg transition flex items-center justify-center gap-2 bg-ci-green-600 hover:bg-ci-green-700 text-white text-sm sm:text-base"
                      >
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>{user ? 'Contacter le propriétaire' : 'Se connecter pour contacter'}</span>
                      </button>

                      {!user && (
                        <p className="text-xs text-slate-500 text-center">
                          Connectez-vous pour accéder aux coordonnées
                        </p>
                      )}
                    </div>
                  )}

                  {isResidence && (
                    <p className="text-xs text-slate-500 mt-3 text-center">
                      Après validation, vous recevrez les coordonnées du propriétaire.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Add ContactModal */}
      {showContactModal && ownerInfo && (
        <>
          <ContactModal
            isOpen={showContactModal}
            onClose={() => setShowContactModal(false)}
            houseId={house.id}
            ownerId={house.owner_id}
            propertyType={house.type}
            neighborhood={house.neighborhood || house.location || 'Quartier non précisé'}
            ownerName={ownerInfo.name}
          />
          {/* Background overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowContactModal(false)} />
        </>
      )}
    </>
  );
};
