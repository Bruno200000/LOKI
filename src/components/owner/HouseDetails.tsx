import React, { useState, useEffect, useRef } from 'react';
import { House } from '../../lib/supabase';
import { ChevronLeft, ChevronRight, Home as HomeIcon, MapPin, Bed, Bath, Thermometer, Wifi, Car, TreePine, Dumbbell, Shield } from 'lucide-react';

interface HouseDetailsProps {
  house: House;
  onClose: () => void;
}

export const HouseDetails: React.FC<HouseDetailsProps> = ({ house, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const allImages = [
    ...(house.image_url ? [house.image_url] : []),
    ...(house.photos || [])
  ];

  useEffect(() => {
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [allImages.length]);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else prevImage();
    }
    touchStartX.current = null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-white sm:bg-slate-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto sm:py-8 sm:px-4">
        <div className="bg-white sm:rounded-3xl sm:shadow-2xl border-none sm:border sm:border-slate-100 overflow-hidden min-h-screen sm:min-h-0">
          <div className="relative">
            {/* Carousel d'images avec support tactile - Format Mobile Optimisé */}
            <div
              className="relative w-full aspect-[4/3] sm:aspect-video"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {allImages.length > 0 ? (
                <>
                  <img
                    src={allImages[currentImageIndex]}
                    alt={house.title}
                    className="w-full h-full object-cover transition duration-700"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hidden md:block"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-md rounded-full text-white hidden md:block"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>

                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {allImages.map((_, idx) => (
                          <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-ci-orange-500 w-6' : 'bg-white/40 w-1.5'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <HomeIcon className="w-16 h-16 text-slate-300" />
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-2.5 bg-white/90 backdrop-blur-md shadow-lg rounded-full transition active:scale-90 z-20"
            >
              <ChevronLeft className="w-6 h-6 text-slate-900" />
            </button>
          </div>

          <div className="px-5 py-8 sm:px-10">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-ci-orange-50 text-ci-orange-600 text-[10px] font-black uppercase tracking-widest rounded-md">
                    {house.type || 'Résidence'}
                  </span>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${house.status === 'available' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {house.status === 'available' ? 'Disponible' : 'Pris'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  {house.title}
                </h1>
                <div className="flex items-center text-slate-400 mt-2 font-medium">
                  <MapPin className="w-4 h-4 mr-1.5 text-ci-orange-500" />
                  <span className="text-sm">{house.location || house.neighborhood}, {house.city}</span>
                </div>
              </div>

              <div className="bg-slate-50 sm:bg-white p-4 rounded-2xl sm:p-0 flex flex-col items-start sm:items-end w-full sm:w-auto">
                <div className="text-3xl font-black text-ci-orange-600 tracking-tighter">
                  {house.price.toLocaleString()}
                  <span className="text-sm font-bold ml-1">FCFA</span>
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {house.type === 'residence' ? 'Par nuit' : house.type === 'land' ? 'Prix fixe' : 'Par mois'}
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100 w-full mb-8" />

            {/* Informations détaillées sur la propriété */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <Bed className="w-6 h-6 text-ci-orange-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chambres</div>
                  <div className="text-lg font-black text-slate-900">{house.bedrooms || 1} Pièce(s)</div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <Bath className="w-6 h-6 text-ci-orange-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Salles de bain</div>
                  <div className="text-lg font-black text-slate-900">{house.bathrooms || 1} Sdb</div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <HomeIcon className="w-6 h-6 text-ci-orange-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Surface</div>
                  <div className="text-lg font-black text-slate-900">{house.area_sqm || '--'} m²</div>
                </div>
              </div>
            </div>

            <div className="prose prose-slate max-w-none mb-12">
              <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                <div className="w-1 h-6 bg-ci-orange-500 rounded-full" />
                Description
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {house.description}
              </p>
            </div>

            {/* Photos de la propriété */}
            {house.photos && house.photos.length > 0 && (
              <div className="mb-12">
                <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-2">
                  <div className="w-1 h-6 bg-ci-orange-500 rounded-full" />
                  Galerie Photos ({house.photos.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {house.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="aspect-square relative group overflow-hidden rounded-2xl cursor-pointer"
                      onClick={() => window.open(photo, '_blank')}
                    >
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section Vidéo */}
            {house.video_url && (
              <div className="mb-12">
                <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-2">
                  <div className="w-1 h-6 bg-ci-orange-500 rounded-full" />
                  Visite Vidéo
                </h2>
                <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
                  <video
                    src={house.video_url}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Équipements */}
            <div className="mb-12">
              <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-2">
                <div className="w-1 h-6 bg-ci-orange-500 rounded-full" />
                Équipements & Confort
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {house.air_conditioning && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Thermometer className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-bold text-slate-700">Climatisation</span>
                  </div>
                )}
                {house.internet && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Wifi className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-bold text-slate-700">Internet / WiFi</span>
                  </div>
                )}
                {house.parking && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Car className="w-5 h-5 text-slate-500" />
                    <span className="text-sm font-bold text-slate-700">Parking</span>
                  </div>
                )}
                {house.garden && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <TreePine className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-bold text-slate-700">Jardin</span>
                  </div>
                )}
                {house.pool && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Dumbbell className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-bold text-slate-700">Piscine</span>
                  </div>
                )}
                {house.guardian && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <Shield className="w-5 h-5 text-slate-600" />
                    <span className="text-sm font-bold text-slate-700">Gardien 24h/7</span>
                  </div>
                )}
              </div>
            </div>

            {/* Infos supplémentaires */}
            {(house.proximity_transport || house.proximity_shops || house.proximity_schools) && (
              <div className="mb-12">
                <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-2">
                  <div className="w-1 h-6 bg-ci-orange-500 rounded-full" />
                  À proximité
                </h2>
                <div className="space-y-4">
                  {house.proximity_transport && (
                    <div className="flex flex-col gap-1">
                      <div className="text-xs font-bold text-slate-400 tracking-wider">TRANSPORTS</div>
                      <div className="text-sm font-medium text-slate-700">{house.proximity_transport}</div>
                    </div>
                  )}
                  {house.proximity_shops && (
                    <div className="flex flex-col gap-1">
                      <div className="text-xs font-bold text-slate-400 tracking-wider">COMMERCES</div>
                      <div className="text-sm font-medium text-slate-700">{house.proximity_shops}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
