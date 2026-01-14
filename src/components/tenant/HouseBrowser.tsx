import React, { useState, useEffect } from 'react';
import { supabase, House } from '../../lib/supabase';
import { Search, Home as HomeIcon, MapPin, Bed, Bath, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { PropertyDetailsModal } from './PropertyDetailsModal';

const ImageCarousel: React.FC<{ images: string[]; title: string; onClick?: () => void }> = ({ images, title, onClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = React.useRef<number | null>(null);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    } else if (Math.abs(diff) < 10 && onClick) {
      onClick();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="w-full h-full relative group/carousel cursor-pointer"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
    >
      {images.length > 0 && (
        <img
          src={images[currentIndex % images.length]}
          alt={title}
          className="w-full h-full object-cover transition duration-700"
        />
      )}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-full opacity-0 md:group-hover/carousel:opacity-100 transition shadow-sm hover:bg-white/40 z-10"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-md rounded-full opacity-0 md:group-hover/carousel:opacity-100 transition shadow-sm hover:bg-white/40 z-10"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-ci-orange-500 w-4' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const HouseBrowser: React.FC = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [filteredHouses, setFilteredHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [neighborhoodFilter, setNeighborhoodFilter] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchHouses();
  }, []);

  useEffect(() => {
    filterHouses();
  }, [houses, searchTerm, maxPrice, neighborhoodFilter, selectedType]);

  const fetchHouses = async () => {
    try {
      const { data, error } = await supabase
        .from('houses')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHouses(data || []);
      setFilteredHouses(data || []);
    } catch (error) {
      console.error('Error fetching houses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterHouses = () => {
    let filtered = [...houses];

    if (searchTerm) {
      filtered = filtered.filter(
        (house) =>
          house.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (house.location && house.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (house.neighborhood && house.neighborhood.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (house.description && house.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedType && selectedType !== 'all') {
      filtered = filtered.filter((house) => house.type === selectedType);
    }

    if (neighborhoodFilter) {
      filtered = filtered.filter((house) => (house.neighborhood || '').toLowerCase().includes(neighborhoodFilter.toLowerCase()));
    }

    if (maxPrice) {
      filtered = filtered.filter((house) => house.price <= parseFloat(maxPrice));
    }

    setFilteredHouses(filtered);
  };

  const handleViewDetails = (house: House) => {
    setSelectedHouse(house);
    setShowDetailsModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-8">
      <div className="mb-6 px-4 sm:px-0 pt-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Résidences & Maisons d'Exception
        </h1>
        <p className="text-slate-500 text-sm sm:text-base mt-1">
          {filteredHouses.length} bien{filteredHouses.length > 1 ? 's' : ''} d'exception disponible{filteredHouses.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/60 -mx-4 px-4 py-3 mb-6 sm:mx-0 sm:px-6 sm:rounded-2xl sm:shadow-lg sm:border sm:mb-8 transition-all duration-300">
        <div className="flex flex-col gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-ci-orange-500 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Quartier, ville, titre..."
              className="w-full pl-11 pr-4 py-3 bg-slate-100/50 border-none rounded-xl focus:ring-2 focus:ring-ci-orange-500 outline-none transition-all text-base"
            />
          </div>

          <div className="flex overflow-x-auto pb-1 gap-2 no-scrollbar scroll-smooth">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium whitespace-nowrap focus:ring-2 focus:ring-ci-orange-500 outline-none shadow-sm transition-all flex-shrink-0"
            >
              <option value="all">Tout type</option>
              <option value="residence">Meublé</option>
              <option value="house">Location</option>
              <option value="land">Vente</option>
              <option value="shop">Commerce</option>
            </select>

            <select
              value={neighborhoodFilter}
              onChange={(e) => setNeighborhoodFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium whitespace-nowrap focus:ring-2 focus:ring-ci-orange-500 outline-none shadow-sm transition-all flex-shrink-0"
            >
              <option value="">Tout quartier</option>
              <option value="Commerce">Commerce</option>
              <option value="Koko">Koko</option>
              <option value="Kennedy">Kennedy</option>
              <option value="Air France">Air France</option>
              <option value="Zone Industrielle">Zone</option>
            </select>

            <div className="flex items-center bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm transition-all flex-shrink-0">
              <span className="text-xs text-slate-400 mr-2 font-bold whitespace-nowrap">MAX</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Budget"
                className="w-20 sm:w-28 text-sm outline-none font-semibold text-slate-700 placeholder:font-normal placeholder:text-slate-300"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-24">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-ci-orange-500"></div>
          <p className="mt-4 text-slate-400 font-bold tracking-widest text-xs uppercase">Chargement...</p>
        </div>
      ) : filteredHouses.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-100 mx-4 sm:mx-0">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Aucun résultat</h3>
          <p className="text-slate-500 max-w-xs mx-auto">Nous n'avons trouvé aucun bien correspondant à vos critères de recherche.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setNeighborhoodFilter('');
              setSelectedType('all');
              setMaxPrice('');
            }}
            className="mt-8 text-ci-orange-600 font-bold text-sm hover:underline"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0 pb-20">
          {filteredHouses.map((house) => (
            <div
              key={house.id}
              onClick={() => handleViewDetails(house)}
              className="group bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_15px_45px_rgb(113,128,150,0.1)] border border-slate-100/80 overflow-hidden transition-all duration-500 cursor-pointer"
            >
              <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                {(() => {
                  const videosToShow = house.video_url
                    ? [house.video_url]
                    : ((house.videos && house.videos.length > 0) ? house.videos : []);
                  const mainVideo = (videosToShow && videosToShow.length > 0) ? videosToShow[0] : null;

                  const imagesToShow = [
                    ...(house.image_url ? [house.image_url] : []),
                    ...(house.photos || [])
                  ];

                  if (mainVideo) {
                    return (
                      <video
                        src={mainVideo}
                        muted
                        autoPlay
                        loop
                        playsInline
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      />
                    );
                  } else if (imagesToShow.length > 0) {
                    return <ImageCarousel images={imagesToShow} title={house.title} onClick={() => handleViewDetails(house)} />;
                  } else {
                    return (
                      <div className="w-full h-full flex items-center justify-center">
                        <HomeIcon className="w-12 h-12 text-slate-300" />
                      </div>
                    );
                  }
                })()}

                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1.5 backdrop-blur-md bg-white/90 text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {house.type === 'residence' ? 'Meublé' : house.type === 'house' ? 'Location' : house.type === 'land' ? 'Vente' : 'Commerce'}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl flex items-center justify-between border border-white/20">
                    <div>
                      <div className="text-xl font-black text-slate-900 tracking-tight leading-none">
                        {house.price.toLocaleString()}
                        <span className="text-xs font-bold text-slate-400 ml-1">FCFA</span>
                      </div>
                      {house.type !== 'land' && <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-1">Par mois</div>}
                    </div>
                    <div className="bg-ci-orange-500 text-white p-2 rounded-xl">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pb-6">
                <div className="flex items-center gap-2 text-ci-orange-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{house.neighborhood || house.city}</span>
                </div>

                <h3 className="font-bold text-lg text-slate-900 line-clamp-1 mb-2 tracking-tight group-hover:text-ci-orange-600 transition-colors duration-300">
                  {house.title}
                </h3>

                <div className="flex items-center gap-4 py-4 border-y border-slate-50 mb-4 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                      <Bed className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{house.bedrooms || 1} <span className="text-slate-400 font-medium">ch.</span></span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                      <Bath className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{house.bathrooms || 1} <span className="text-slate-400 font-medium">sdb.</span></span>
                  </div>
                  {house.area_sqm && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                        <HomeIcon className="w-4 h-4 text-slate-400" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{house.area_sqm} <span className="text-slate-400 font-medium">m²</span></span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(house);
                    }}
                    className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold tracking-tight shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
                  >
                    Voir les détails
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDetailsModal && selectedHouse && (
        <PropertyDetailsModal
          house={selectedHouse}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
};
