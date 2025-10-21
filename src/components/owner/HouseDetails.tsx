import React from 'react';
import { House } from '../../lib/supabase';
import { X, DollarSign, Home as HomeIcon, ExternalLink, Camera, Play, Bed, Bath, MapPin, Car, TreePine, Dumbbell, Shield, Wifi, Thermometer, Droplets } from 'lucide-react';

interface HouseDetailsProps {
  house: House;
  onClose: () => void;
}

export const HouseDetails: React.FC<HouseDetailsProps> = ({ house, onClose }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="relative">
            {/* Affichage de la vidéo ou image principale */}
            {house.video_url ? (
              <video
                src={house.video_url}
                controls
                className="w-full h-64 object-cover"
              />
            ) : house.image_url ? (
              <img
                src={house.image_url}
                alt={house.title}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-slate-200 flex items-center justify-center">
                <HomeIcon className="w-16 h-16 text-slate-400" />
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full transition"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{house.title}</h1>
                <div className="flex items-center text-slate-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{house.location}, {house.city}</span>
                </div>
              </div>
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                  house.status === 'available'
                    ? 'bg-green-100 text-green-800'
                    : house.status === 'taken'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {house.status === 'available' ? 'Disponible' : house.status === 'taken' ? 'Pris' : 'En attente'}
              </span>
            </div>

            <div className="flex items-center text-slate-600 text-lg mb-6">
              <DollarSign className="w-5 h-5 mr-2 text-ci-orange-600" />
              <span className="font-bold text-2xl text-ci-orange-600">{house.price.toLocaleString()} FCFA</span>
              <span className="ml-1">/ mois</span>
            </div>

            {/* Affichage des images multiples */}
            {house.photos && house.photos.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Photos de la propriété ({house.photos.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {house.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-slate-200 hover:shadow-md transition cursor-pointer"
                        onClick={() => window.open(photo, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Affichage du lien de visite virtuelle */}
            {house.virtual_tour_url && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <Play className="w-5 h-5 mr-2" />
                  Visite Virtuelle
                </h2>
                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                  <p className="text-slate-600 mb-4">
                    Découvrez cette propriété en visite virtuelle 360°
                  </p>
                  <a
                    href={house.virtual_tour_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-ci-orange-600 hover:bg-ci-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Voir la visite virtuelle
                  </a>
                </div>
              </div>
            )}

            <div className="prose prose-slate max-w-none mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Description</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {house.description}
              </p>
            </div>

            {/* Informations détaillées sur la propriété */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {/* Caractéristiques de base */}
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <HomeIcon className="w-5 h-5 mr-2" />
                  Caractéristiques
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bed className="w-4 h-4 text-ci-orange-600" />
                      <span className="text-slate-700">Chambres</span>
                    </div>
                    <span className="font-semibold">{house.bedrooms || 1}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bath className="w-4 h-4 text-ci-orange-600" />
                      <span className="text-slate-700">Salles de bain</span>
                    </div>
                    <span className="font-semibold">{house.bathrooms || 1}</span>
                  </div>
                  {house.area_sqm && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Surface</span>
                      <span className="font-semibold">{house.area_sqm} m²</span>
                    </div>
                  )}
                  {house.neighborhood && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Quartier</span>
                      <span className="font-semibold">{house.neighborhood}</span>
                    </div>
                  )}
                  {house.property_type && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Type</span>
                      <span className="font-semibold">{house.property_type}</span>
                    </div>
                  )}
                  {house.floor && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Étage</span>
                      <span className="font-semibold">{house.floor}ème</span>
                    </div>
                  )}
                  {house.furnished && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Meublé</span>
                      <span className="font-semibold text-green-600">Oui</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Équipements et confort */}
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Équipements</h3>
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
                </div>
              </div>

              {/* Sécurité et services */}
              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Sécurité</h3>
                <div className="space-y-2">
                  {house.security_cameras && (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-700">Caméras de surveillance</span>
                    </div>
                  )}
                  {house.alarm_system && (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-600" />
                      <span className="text-slate-700">Système d'alarme</span>
                    </div>
                  )}
                  {house.interphone && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700">Interphone</span>
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

            {/* Informations financières */}
            {(house.deposit_amount || house.agency_fees || house.utilities_included || house.utilities_amount) && (
              <div className="bg-slate-50 p-6 rounded-lg mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Informations financières</h3>
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
                      <span className="text-slate-700">✓ Charges incluses dans le loyer</span>
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
            )}

            {/* Conditions de location */}
            {(house.minimum_rental_period || house.availability_date) && (
              <div className="bg-slate-50 p-6 rounded-lg mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Conditions de location</h3>
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
            )}

            {/* Environnement */}
            {(house.proximity_transport || house.proximity_schools || house.proximity_shops || house.proximity_green_spaces) && (
              <div className="bg-slate-50 p-6 rounded-lg mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Environnement</h3>
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

            {/* Équipements supplémentaires */}
            {house.amenities && house.amenities.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Équipements supplémentaires</h3>
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
        </div>
      </div>
    </div>
  );
};
