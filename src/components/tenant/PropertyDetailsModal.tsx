import React, { useState, useEffect } from 'react';
import { House, supabase } from '../../lib/supabase';
import { X, MapPin, Bed, Bath, Home as HomeIcon, Eye, Image as ImageIcon, Car, TreePine, Dumbbell, Shield, Wifi, Thermometer, ChevronLeft, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ContactModal } from './ContactModal';

interface PropertyDetailsModalProps {
  house: House;
  onClose: () => void;
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({ house, onClose }) => {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = React.useRef<number | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState<{ name: string; phone: string } | null>(null);

  const allImages = [
    ...(house.image_url ? [house.image_url] : []),
    ...(house.photos || [])
  ];

  const getViewersCount = (propertyId: number | string) => {
    const idString = propertyId.toString();
    const hash = idString.split('').reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0);
    return Math.abs(hash % 50) + 5;
  };

  const viewersCount = getViewersCount(house.id);

  useEffect(() => {
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [allImages.length]);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  const handleTouchStart = (e: React.TouchEvent) => touchStartX.current = e.touches[0].clientX;
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? nextImage() : prevImage();
    touchStartX.current = null;
  };

  const handleContactClick = async () => {
    if (!user) {
      sessionStorage.setItem('returnToProperty', window.location.href);
      window.location.href = '/?login=true';
      return;
    }
    if (ownerInfo) { setShowContactModal(true); return; }
    try {
      const { data, error } = await supabase.from('profiles').select('full_name, phone').eq('id', house.owner_id).single();
      if (error) throw error;
      setOwnerInfo({ name: data?.full_name || 'Nom non disponible', phone: data?.phone || 'Non disponible' });
      setShowContactModal(true);
    } catch (err) {
      console.error(err);
      setOwnerInfo({ name: 'Nom non disponible', phone: 'Non disponible' });
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white sm:bg-slate-900/60 sm:backdrop-blur-sm">
      <div className="min-h-screen sm:flex sm:items-center sm:justify-center sm:p-4">
        <div className="relative w-full max-w-5xl bg-white sm:rounded-3xl sm:shadow-2xl overflow-hidden min-h-screen sm:min-h-0">
          {/* Header Mobile Sticky */}
          <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-white/80 backdrop-blur-md sm:hidden">
            <button onClick={onClose} className="p-2 bg-slate-100 rounded-full"><ChevronLeft className="w-5 h-5 text-slate-900" /></button>
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Détails du bien</h2>
            <div className="w-9" />
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Colonne Gauche: Média & Info Principal */}
            <div className="flex-1 lg:max-w-[60%] border-r border-slate-100">
              <div
                className="relative aspect-[4/3] sm:aspect-video bg-slate-100"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {allImages.length > 0 ? (
                  <>
                    <img src={allImages[currentImageIndex]} alt={house.title} className="w-full h-full object-cover transition duration-700" />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
                    {allImages.length > 1 && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {allImages.map((_, idx) => (
                          <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-ci-orange-500 w-6' : 'bg-white/40 w-1.5'}`} />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-12 h-12 text-slate-200" /></div>
                )}

                <button onClick={onClose} className="hidden sm:flex absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg text-slate-900 active:scale-95 transition"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-5 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-1 bg-ci-orange-50 text-ci-orange-600 text-[10px] font-black uppercase tracking-widest rounded-md">{house.type}</span>
                  <span className="px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-md">Disponible</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-4">{house.title}</h1>

                <div className="flex items-center text-slate-400 mb-8 font-medium">
                  <MapPin className="w-4 h-4 mr-2 text-ci-orange-500" />
                  <span className="text-sm sm:text-base">{house.neighborhood || house.location}, {house.city}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl text-center">
                    <Bed className="w-5 h-5 sm:w-6 sm:h-6 text-ci-orange-500 mx-auto mb-2" />
                    <div className="text-sm sm:text-lg font-black text-slate-900">{house.bedrooms || 1}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chambres</div>
                  </div>
                  <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl text-center">
                    <Bath className="w-5 h-5 sm:w-6 sm:h-6 text-ci-orange-500 mx-auto mb-2" />
                    <div className="text-sm sm:text-lg font-black text-slate-900">{house.bathrooms || 1}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sdb</div>
                  </div>
                  <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl text-center">
                    <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-ci-orange-500 mx-auto mb-2" />
                    <div className="text-sm sm:text-lg font-black text-slate-900">{house.area_sqm || '--'}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">m²</div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none mb-10">
                  <h3 className="text-lg font-black text-slate-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                    <div className="w-1 h-5 bg-ci-orange-500 rounded-full" /> Description
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">{house.description}</p>
                </div>

                {house.video_url && (
                  <div className="mb-10">
                    <h3 className="text-lg font-black text-slate-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                      <div className="w-1 h-5 bg-ci-orange-500 rounded-full" /> Visite Vidéo
                    </h3>
                    <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-xl"><video src={house.video_url} controls className="w-full h-full object-contain" /></div>
                  </div>
                )}

                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl mb-10 animate-pulse">
                  <Eye className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-tight">{viewersCount} personnes regardent ce bien actuellement</span>
                </div>
              </div>
            </div>

            {/* Colonne Droite: Action & Équipements */}
            <div className="lg:flex-1 bg-slate-50/50 p-5 sm:p-8">
              <div className="sticky top-6">
                <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-8">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    {house.type === 'land' ? 'Prix total' : 'Loyer par mois'}
                  </div>
                  <div className="text-4xl font-black text-slate-900 mb-6 font-display">
                    {house.price.toLocaleString()} <span className="text-sm font-bold text-slate-400">FCFA</span>
                  </div>

                  <div className="space-y-3">
                    {isResidence ? (
                      <button onClick={handleBookingClick} className="w-full py-4 bg-ci-orange-600 hover:bg-ci-orange-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-ci-orange-200">
                        {user ? 'Réserver maintenant' : 'Se connecter pour réserver'}
                      </button>
                    ) : (
                      <button onClick={handleContactClick} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-slate-200 flex items-center justify-center gap-3">
                        <Phone className="w-4 h-4" /> {user ? 'Contacter le proprio' : 'Accéder au contact'}
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-center text-slate-400 mt-4 font-bold uppercase tracking-widest">Mise en relation directe • Aucun frais caché</p>
                </div>

                <div className="mb-8">
                  <h3 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-widest">Équipements inclus</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { show: house.air_conditioning, icon: Thermometer, label: 'Climatisation', color: 'text-blue-500' },
                      { show: house.internet, icon: Wifi, label: 'Internet', color: 'text-green-500' },
                      { show: house.parking, icon: Car, label: 'Parking', color: 'text-slate-500' },
                      { show: house.guardian, icon: Shield, label: 'Gardien', color: 'text-slate-600' },
                      { show: house.pool, icon: Dumbbell, label: 'Piscine', color: 'text-blue-600' },
                      { show: house.garden, icon: TreePine, label: 'Jardin', color: 'text-green-600' }
                    ].filter(f => f.show).map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-xs font-bold text-slate-600">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {house.neighborhood && (
                  <div>
                    <h3 className="text-sm font-black text-slate-900 mb-4 uppercase tracking-widest">Localisation</h3>
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
                      <div className="w-10 h-10 bg-ci-orange-50 rounded-xl flex items-center justify-center"><MapPin className="w-5 h-5 text-ci-orange-500" /></div>
                      <div>
                        <div className="text-sm font-black text-slate-900">{house.neighborhood}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{house.city}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showContactModal && ownerInfo && (
        <ContactModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          houseId={house.id}
          ownerId={house.owner_id}
          propertyType={house.type}
          neighborhood={house.neighborhood || house.location || 'Quartier non précisé'}
          ownerName={ownerInfo.name}
        />
      )}
    </div>
  );
};
