import React, { useState, useEffect } from 'react';
import { supabase, House } from '../../lib/supabase';
import { Search, Filter, X, Home as HomeIcon, MapPin, Bed, Bath, Eye } from 'lucide-react';
import { PropertyDetailsModal } from './PropertyDetailsModal';

export const HouseBrowser: React.FC = () => {
  const [houses, setHouses] = useState<House[]>([]);
  const [filteredHouses, setFilteredHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBedrooms, setMinBedrooms] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchHouses();
  }, []);

  useEffect(() => {
    filterHouses();
  }, [houses, searchTerm, selectedCity, maxPrice, minBedrooms]);

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
          house.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (house.description && house.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCity) {
      filtered = filtered.filter((house) => house.city === selectedCity);
    }

    if (maxPrice) {
      filtered = filtered.filter((house) => house.price <= parseFloat(maxPrice));
    }

    if (minBedrooms) {
      filtered = filtered.filter((house) => house.bedrooms >= parseInt(minBedrooms));
    }

    setFilteredHouses(filtered);
  };

  const handleViewDetails = (house: House) => {
    setSelectedHouse(house);
    setShowDetailsModal(true);
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Trouvez votre prochain logement
        </h1>
        <p className="text-slate-600">
          {filteredHouses.length} propriété{filteredHouses.length > 1 ? 's' : ''} disponible
          {filteredHouses.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par titre, localisation ou description..."
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition ${
              showFilters
                ? 'bg-ci-orange-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filtres
          </button>
        </div>

        {showFilters && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ville
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none"
                >
                  <option value="">Toutes les villes</option>
                  <option value="Abidjan">Abidjan</option>
                  <option value="Bouaké">Bouaké</option>
                  <option value="Daloa">Daloa</option>
                  <option value="Yamoussoukro">Yamoussoukro</option>
                  <option value="San-Pédro">San-Pédro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prix maximum (FCFA)
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="200000"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre de chambres minimum
                </label>
                <select
                  value={minBedrooms}
                  onChange={(e) => setMinBedrooms(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none"
                >
                  <option value="">Toutes</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedCity('');
                setMaxPrice('');
                setMinBedrooms('');
                setSearchTerm('');
              }}
              className="text-sm text-ci-orange-600 hover:text-ci-orange-700 font-semibold flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-ci-orange-600"></div>
        </div>
      ) : filteredHouses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Aucune propriété trouvée</h3>
          <p className="text-slate-600">Essayez d'ajuster vos filtres de recherche</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHouses.map((house) => (
            <div
              key={house.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition group"
            >
              <div className="aspect-video bg-slate-200 relative overflow-hidden">
                {house.video_url ? (
                  <video
                    src={house.video_url}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : house.image_url ? (
                  <img
                    src={house.image_url}
                    alt={house.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <HomeIcon className="w-12 h-12 text-slate-400" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    Disponible
                  </span>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition duration-300"></div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-slate-900 line-clamp-1">
                    {house.title}
                  </h3>
                  <button
                    onClick={() => handleViewDetails(house)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                    title="Voir les détails"
                  >
                    <Eye className="w-4 h-4 text-slate-600" />
                  </button>
                </div>

                <div className="flex items-center gap-1 text-slate-600 text-sm mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{house.location}, {house.city}</span>
                </div>

                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{house.description}</p>

                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span>{house.bedrooms} chambre{house.bedrooms > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    <span>{house.bathrooms} salle{house.bathrooms > 1 ? 's' : ''} de bain</span>
                  </div>
                  {house.area_sqm && (
                    <div className="flex items-center gap-1">
                      <HomeIcon className="w-4 h-4" />
                      <span>{house.area_sqm} m²</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div>
                    <div className="text-2xl font-bold text-ci-orange-600">
                      {house.price.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-600">FCFA / mois</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(house)}
                      className="px-3 py-2 border border-ci-orange-500 text-ci-orange-600 hover:bg-ci-orange-50 rounded-lg font-semibold transition flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Détails
                    </button>
                  </div>
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
    </>
  );
};
