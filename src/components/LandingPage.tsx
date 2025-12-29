import { Home, Search, Shield, Users, TrendingUp, ArrowRight, CheckCircle, Building2, MapPin, Clock, MessageSquare, Facebook, Twitter, Instagram, Linkedin, Bed, Bath, Eye, Star, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, House } from '../lib/supabase';

interface LandingPageProps {
  showBackToDashboard?: boolean;
}

export function LandingPage({ showBackToDashboard }: LandingPageProps) {
  const [houses, setHouses] = useState<House[]>([]);
  const [recentHouses, setRecentHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'house' | 'residence' | 'land' | 'shop'>('all');
  const [filteredHouses, setFilteredHouses] = useState<House[]>([]);
  const [searchNeighborhood, setSearchNeighborhood] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  const handleGetStarted = () => {
    // Rediriger directement vers la page de connexion en forçant l'état d'authentification
    window.location.href = '/?login=true';
  };

  useEffect(() => {
    fetchFeaturedHouses();
    fetchRecentHouses();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredHouses(houses);
    } else {
      setFilteredHouses(houses.filter(house => house.type === selectedCategory));
    }
  }, [selectedCategory, houses]);

  useEffect(() => {
    let filtered = houses;

    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(house => house.type === selectedCategory);
    }

    // Filtrer par quartier
    if (searchNeighborhood) {
      filtered = filtered.filter(house =>
        house.neighborhood && house.neighborhood.toLowerCase().includes(searchNeighborhood.toLowerCase())
      );
    }

    // Filtrer par prix maximum
    if (maxPrice) {
      const maxPriceNum = parseFloat(maxPrice);
      filtered = filtered.filter(house => house.price <= maxPriceNum);
    }

    setFilteredHouses(filtered);
  }, [selectedCategory, searchNeighborhood, maxPrice, houses]);

  useEffect(() => {
    // Liste prédéfinie des quartiers disponibles
    const predefinedNeighborhoods = [
      'Aéroport', 'Ahougnanssou', 'Air France 1', 'Air France 2', 'Air France 3',
      'Allokokro', 'Attienkro', 'Beaufort', 'Belleville 1', 'Belleville 2',
      'Broukro 1', 'Broukro 2', 'Camp Militaire', 'Commerce', 'Dar-es-Salam 1',
      'Dar-es-Salam 2', 'Dar-es-Salam 3', 'Dougouba', 'Gonfreville', 'Houphouët-Ville',
      'IDESSA', 'Kamounoukro', 'Kanakro', 'Kennedy', 'Koko', 'Kodiakoffikro',
      'Konankankro', 'Liberté', 'Lycée Municipal', 'Mamianou', 'N\'Dakro',
      'N\'Gattakro', 'N\'Gouatanoukro', 'Niankoukro', 'Nimbo', 'Sokoura',
      'Tièrèkro', 'Tolla Kouadiokro', 'Zone Industrielle'
    ];

    // Extraire les quartiers uniques des maisons et combiner avec la liste prédéfinie
    const houseNeighborhoods = houses.map(house => house.neighborhood).filter((neighborhood): neighborhood is string => Boolean(neighborhood));
    const allNeighborhoods = [...new Set([...predefinedNeighborhoods, ...houseNeighborhoods])].sort();
    setNeighborhoods(allNeighborhoods);
  }, [houses]);

  const getPriceDisplay = (house: House) => {
    switch (house.type) {
      case 'residence':
        return `${house.price.toLocaleString()} FCFA/nuit`;
      case 'land':
        return `${house.price.toLocaleString()} FCFA (fixe)`;
      case 'house':
      case 'shop':
      default:
        return `${house.price.toLocaleString()} FCFA/mois`;
    }
  };

  const fetchFeaturedHouses = async () => {
    try {
      const { data, error } = await supabase
        .from('houses')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setHouses(data || []);
    } catch (error) {
      console.error('Error fetching houses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentHouses = async () => {
    try {
      const { data, error } = await supabase
        .from('houses')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentHouses(data || []);
    } catch (error) {
      console.error('Error fetching recent houses:', error);
    }
  };
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-ci-orange-600 p-2 rounded-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">LOKI</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="/#features" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Fonctionnalités
              </a>
              <a href="/#pricing" className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Tarifs
              </a>
              <button onClick={() => window.location.href = '/about'} className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                À propos
              </button>
              <button onClick={() => window.location.href = '/contact'} className="text-slate-600 hover:text-slate-900 font-medium transition-colors">
                Contact
              </button>
              {showBackToDashboard && (
                <button
                  onClick={() => window.location.href = '/?view=dashboard'}
                  className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  Retour au tableau de bord
                </button>
              )}
              <button
                onClick={handleGetStarted}
                className="bg-ci-orange-600 hover:bg-ci-orange-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
              >
                Essayer gratuitement
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-600 hover:text-slate-900 p-2 rounded-lg transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a
                  href="/#features"
                  className="block px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Fonctionnalités
                </a>
                <a
                  href="/#pricing"
                  className="block px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tarifs
                </a>
                <button
                  onClick={() => {
                    window.location.href = '/about';
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                >
                  À propos
                </button>
                <button
                  onClick={() => {
                    window.location.href = '/contact';
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                >
                  Contact
                </button>
                {showBackToDashboard && (
                  <button
                    onClick={() => {
                      window.location.href = '/?view=dashboard';
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                  >
                    Retour au tableau de bord
                  </button>
                )}
                <button
                  onClick={() => {
                    handleGetStarted();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 bg-ci-orange-600 hover:bg-ci-orange-700 text-white rounded-lg font-semibold transition-colors mt-2"
                >
                  Essayer gratuitement
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <section className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        {/* Animations de fond avec gradients colorés */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-ci-orange-200 to-yellow-200 rounded-full blur-3xl opacity-40 animate-bounce-slow"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-br from-ci-green-200 to-emerald-200 rounded-full blur-3xl opacity-30 animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-25 animate-bounce-slow" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight animate-slide-up">
              Arrêtez de perdre des heures.
              <br />
              <span className="text-ci-green-600">
                À trouver votre résidence, maison, terrain, magasin…
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Connectez propriétaires et locataires en quelques clics. Gérez vos biens et réservations.
              Mise en relation directe, sans paiement côté utilisateur.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center bg-ci-orange-600 hover:bg-ci-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl w-full sm:w-auto justify-center transform hover:scale-105"
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={() => window.location.href = '/demo'}
                className="inline-flex items-center border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all w-full sm:w-auto justify-center bg-white hover:bg-slate-50 transform hover:scale-105"
              >
                Voir le démo
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-6">Aucune carte bancaire requise. Commencez en 2 minutes.</p>
          </div>

          <div className="relative max-w-5xl mx-auto animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center space-x-2">
                <div className="flex space-x-1 sm:space-x-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 text-center text-slate-400 text-xs sm:text-sm font-medium">loki.app/dashboard</div>
              </div>
              <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200">
                    <div className="text-xs sm:text-sm text-slate-500 mb-1">Biens actifs</div>
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900">156</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200">
                    <div className="text-xs sm:text-sm text-slate-500 mb-1">Réservations</div>
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900">89</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 sm:p-4 border border-slate-200">
                    <div className="text-xs sm:text-sm text-slate-500 mb-1">Revenus</div>
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900">12M</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-ci-green-500 to-ci-orange-600 h-1 sm:h-2"></div>
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-slate-200 rounded-lg"></div>
                        <div>
                          <div className="h-2 w-20 sm:w-24 lg:w-32 bg-slate-200 rounded mb-1 sm:mb-2"></div>
                          <div className="h-1.5 w-16 sm:w-20 lg:w-24 bg-slate-100 rounded"></div>
                        </div>
                      </div>
                      <div className="h-6 w-16 sm:w-20 lg:w-24 bg-ci-green-100 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-24 h-24 sm:w-32 sm:h-32 bg-ci-orange-200 rounded-full blur-3xl opacity-50 animate-bounce-slow"></div>
            <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 w-24 h-24 sm:w-32 sm:h-32 bg-ci-green-200 rounded-full blur-3xl opacity-50 animate-bounce-slow"></div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        {/* Animations de fond avec gradients colorés */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-ci-green-100 to-ci-orange-100 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <div className="max-w-7xl mx-auto text-center mb-16 relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Conçu pour simplifier vos locations
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Que vous soyez propriétaire ou locataire, LOKI automatise tout le processus
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          <div className="relative">
            <div className="bg-slate-50 rounded-2xl p-6 lg:p-8 border-2 border-slate-100 hover:border-ci-green-200 transition-all hover:shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-ci-green-500 rounded-xl mb-4 lg:mb-6">
                <Search className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2 lg:mb-3">Recherche intelligente</h3>
              <p className="text-slate-600 leading-relaxed mb-3 lg:mb-4 text-sm lg:text-base">
                Trouvez le logement parfait grâce à nos filtres avancés par ville, prix et type de bien.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-slate-500">
                  <CheckCircle className="h-4 w-4 text-ci-green-500 mr-2 flex-shrink-0" />
                  Filtres personnalisés
                </div>
                <div className="flex items-center text-slate-500">
                  <CheckCircle className="h-4 w-4 text-ci-green-500 mr-2 flex-shrink-0" />
                  Photos et vidéos HD
                </div>
              </div>
            </div>
            <div className="hidden md:block absolute top-1/2 -right-4 w-6 lg:w-8 h-0.5 bg-gradient-to-r from-ci-orange-300 to-transparent"></div>
          </div>

          <div className="relative">
            <div className="bg-slate-50 rounded-2xl p-6 lg:p-8 border-2 border-slate-100 hover:border-ci-green-200 transition-all hover:shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-ci-green-500 rounded-xl mb-4 lg:mb-6">
                <Building2 className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2 lg:mb-3">Gestion simplifiée</h3>
              <p className="text-slate-600 leading-relaxed mb-3 lg:mb-4 text-sm lg:text-base">
                Publiez vos biens, gérez les réservations et suivez vos revenus depuis un tableau de bord unique.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-slate-500">
                  <CheckCircle className="h-4 w-4 text-ci-green-500 mr-2 flex-shrink-0" />
                  Tableau de bord complet
                </div>
                <div className="flex items-center text-slate-500">
                  <CheckCircle className="h-4 w-4 text-ci-green-500 mr-2 flex-shrink-0" />
                  Notifications en temps réel
                </div>
              </div>
            </div>
            <div className="hidden md:block absolute top-1/2 -right-4 w-6 lg:w-8 h-0.5 bg-gradient-to-r from-ci-orange-300 to-transparent"></div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 lg:p-8 border-2 border-slate-100 hover:border-ci-green-200 transition-all hover:shadow-lg">
            <div className="flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-ci-green-500 rounded-xl mb-4 lg:mb-6">
              <Shield className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2 lg:mb-3">Mise en relation sécurisée</h3>
            <p className="text-slate-600 leading-relaxed mb-3 lg:mb-4 text-sm lg:text-base">
              Propriétaires et locataires se connectent en toute sécurité. Aucun paiement requis côté utilisateur; frais fixes réglés par le propriétaire après transaction réussie.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-slate-500">
                <CheckCircle className="h-4 w-4 text-ci-green-500 mr-2 flex-shrink-0" />
                Numéro du propriétaire partagé après réservation
              </div>
              <div className="flex items-center text-slate-500">
                <CheckCircle className="h-4 w-4 text-ci-green-500 mr-2 flex-shrink-0" />
                Suivi des réservations et frais propriétaires
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Maisons en Location avec Animations */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
        {/* Animations de fond avec gradients colorés */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-ci-orange-200 to-ci-green-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-ci-green-200 to-blue-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-ci-orange-100 to-ci-green-100 text-ci-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-gradient-to-r from-ci-orange-500 to-ci-green-500 rounded-full mr-2 animate-pulse"></span>
              Découvrez nos meilleures offres
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
              <span className="bg-gradient-to-r from-ci-orange-600 via-ci-green-600 to-blue-600 bg-clip-text text-transparent">
                Offres immobilières: résidences, maisons, terrains, magasins
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Trouvez votre prochain chez-vous parmi nos propriétés sélectionnées
            </p>
          </div>

          {/* Filtres de recherche */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Filtre par catégorie */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type de bien</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                >
                  <option value="all">Tous les types</option>
                  <option value="house">Maisons</option>
                  <option value="residence">Résidences</option>
                  <option value="land">Terrains</option>
                  <option value="shop">Magasins</option>
                </select>
              </div>

              {/* Filtre par quartier */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Quartier</label>
                <select
                  value={searchNeighborhood}
                  onChange={(e) => setSearchNeighborhood(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                >
                  <option value="">Tous les quartiers</option>
                  {neighborhoods.map((neighborhood) => (
                    <option key={neighborhood} value={neighborhood}>
                      {neighborhood}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par prix maximum */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Prix maximum (FCFA)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Ex: 200000"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ci-orange-500 focus:border-ci-orange-500 outline-none transition"
                />
              </div>
            </div>

            {/* Bouton pour réinitialiser les filtres */}
            {(selectedCategory !== 'all' || searchNeighborhood || maxPrice) && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchNeighborhood('');
                    setMaxPrice('');
                  }}
                  className="inline-flex items-center text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  <X className="h-4 w-4 mr-1" />
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-slate-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded mb-4 w-3/4"></div>
                    <div className="flex justify-between">
                      <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredHouses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredHouses.map((house, index) => (
                <div
                  key={house.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onMouseEnter={() => setHoveredCard(house.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="relative overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                      {(() => {
                        // Logique pour détecter les vidéos disponibles (priorité: video_url puis videos[])
                        const getVideoSrc = () => {
                          if (house.video_url) return house.video_url;
                          if (house.videos !== undefined && house.videos !== null && house.videos.length > 0) return house.videos[0];
                          return null;
                        };

                        // Logique d'affichage d'image
                        const getImageSrc = () => {
                          if (house.image_url) return house.image_url;
                          if (house.photos && house.photos.length > 0) return house.photos[0];
                          return null;
                        };

                        const videoSrc = getVideoSrc();
                        const imageSrc = getImageSrc();
                        const isHovered = hoveredCard === house.id;

                        // Si la carte est survolée et qu'il y a une vidéo, afficher la vidéo
                        if (isHovered && videoSrc) {
                          return (
                            <video
                              src={videoSrc}
                              autoPlay
                              muted
                              loop
                              playsInline
                              className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300"
                              onError={(e) => {
                                console.error('Erreur de chargement vidéo:', videoSrc);
                                e.currentTarget.style.display = 'none';
                                // Remettre l'image en cas d'erreur
                                setHoveredCard(null);
                              }}
                            />
                          );
                        }

                        // Sinon, afficher l'image
                        if (imageSrc) {
                          return (
                            <img
                              src={imageSrc}
                              alt={house.title}
                              className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? 'scale-110 opacity-90' : 'group-hover:scale-110'}`}
                              onError={(e) => {
                                console.error('Erreur de chargement image:', imageSrc);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          );
                        } else {
                          return (
                            <div className="text-slate-400">
                              <Home className="h-12 w-12 mx-auto mb-2" />
                              <p className="text-sm">Aucune image</p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-ci-orange-600">
                      {getPriceDisplay(house)}
                    </div>
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-ci-green-500 to-ci-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Disponible
                    </div>
                    {/* Badge vidéo si disponible et pas survolé */}
                    {(() => {
                      const getVideoSrc = () => {
                        if (house.video_url) return house.video_url;
                        if (house.videos !== undefined && house.videos !== null && house.videos.length > 0) return house.videos[0];
                        return null;
                      };
                      const videoSrc = getVideoSrc();
                      if (videoSrc && hoveredCard !== house.id) {
                        return (
                          <div className="absolute top-12 left-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            VIDÉO
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  <div className="p-4 lg:p-6">
                    <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-2 group-hover:text-ci-orange-600 transition-colors line-clamp-2">
                      {house.title}
                    </h3>
                    <div className="flex items-center text-slate-500 mb-3">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="text-sm truncate">{house.location}, {house.city}</span>
                    </div>

                    <div className="flex items-center space-x-3 lg:space-x-4 mb-4 text-slate-600">
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        <span className="text-sm">{house.bedrooms} ch.</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        <span className="text-sm">{house.bathrooms} sdb</span>
                      </div>
                      {house.area_sqm && (
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1" />
                          <span className="text-sm">{house.area_sqm}m²</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => window.location.href = `/property/${house.id}`}
                        className="flex items-center bg-gradient-to-r from-ci-orange-600 to-ci-green-600 hover:from-ci-orange-700 hover:to-ci-green-700 text-white px-3 lg:px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm"
                      >
                        <Eye className="h-4 w-4 mr-1 lg:mr-2" />
                        <span className="hidden sm:inline">Voir détails</span>
                        <span className="sm:hidden">Voir</span>
                      </button>
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm text-slate-600 ml-1">4.8</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : houses.length > 0 ? (
            // Message quand aucun résultat ne correspond aux filtres
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-6">
                <Search className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Aucun résultat trouvé</h3>
              <p className="text-slate-600 mb-6">
                {selectedCategory !== 'all' || searchNeighborhood || maxPrice
                  ? 'Essayez d\'ajuster vos filtres pour voir plus de résultats.'
                  : 'Revenez bientôt pour découvrir nos nouvelles offres'}
              </p>
              {(selectedCategory !== 'all' || searchNeighborhood || maxPrice) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchNeighborhood('');
                    setMaxPrice('');
                  }}
                  className="inline-flex items-center bg-gradient-to-r from-ci-orange-600 to-ci-green-600 hover:from-ci-orange-700 hover:to-ci-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                >
                  Réinitialiser les filtres
                  <X className="ml-2 h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            // Message quand aucune propriété n'est disponible
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-6">
                <Home className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Aucune propriété disponible</h3>
              <p className="text-slate-600 mb-6">Revenez bientôt pour découvrir nos nouvelles offres</p>
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center bg-gradient-to-r from-ci-orange-600 to-ci-green-600 hover:from-ci-orange-700 hover:to-ci-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                Devenir propriétaire
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          )}

          {houses.length > 0 && (
            <div className="text-center mt-12">
              <button
                onClick={() => window.location.href = '/?view=dashboard'}
                className="inline-flex items-center bg-white hover:bg-slate-50 text-slate-700 px-8 py-3 rounded-xl font-semibold border-2 border-slate-200 hover:border-ci-orange-300 transition-all duration-300 transform hover:scale-105"
              >
                Voir toutes les propriétés
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden" id="features">
        {/* Animations de fond avec gradients colorés */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-ci-green-200/30 to-ci-orange-200/30 rounded-full blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-ci-orange-200/30 to-yellow-200/30 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-200/20 to-ci-green-200/20 rounded-full blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="relative">
              <div className="inline-flex items-center bg-gradient-to-r from-ci-green-100 to-ci-orange-100 text-ci-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
                <span className="w-2 h-2 bg-gradient-to-r from-ci-green-500 to-ci-orange-500 rounded-full mr-2 animate-pulse"></span>
                Pour les propriétaires
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                <span className="bg-gradient-to-r from-ci-green-600 via-ci-orange-600 to-emerald-600 bg-clip-text text-transparent">
                  Gérez vos biens comme un pro
                </span>
              </h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Tous les outils dont vous avez besoin pour maximiser la rentabilité de votre patrimoine immobilier.
              </p>
              <div className="space-y-6">
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-ci-green-500 to-ci-orange-500 rounded-2xl flex items-center justify-center mr-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-ci-orange-600 transition-colors">Analyse des performances</h4>
                    <p className="text-slate-600 leading-relaxed">Suivez vos revenus, taux d'occupation et performances en temps réel avec des graphiques interactifs</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-ci-green-500 to-ci-orange-500 rounded-2xl flex items-center justify-center mr-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-ci-orange-600 transition-colors">Gestion des locataires</h4>
                    <p className="text-slate-600 leading-relaxed">Centralisez les demandes, contrats et communications dans un espace dédié</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-ci-green-500 to-ci-orange-500 rounded-2xl flex items-center justify-center mr-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <Clock className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-ci-orange-600 transition-colors">Gain de temps</h4>
                    <p className="text-slate-600 leading-relaxed">Automatisez les tâches répétitives et gagnez des heures chaque semaine</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-200 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-slate-900">Vos statistiques</h3>
                  <div className="bg-gradient-to-r from-ci-green-100 to-ci-orange-100 px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold text-ci-orange-700">Ce mois</span>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-ci-green-50 via-ci-orange-50 to-emerald-50 rounded-2xl p-6 border border-ci-green-100">
                    <div className="text-sm text-ci-green-700 font-semibold mb-2 uppercase tracking-wide">Revenus totaux</div>
                    <div className="text-5xl font-bold bg-gradient-to-r from-ci-green-600 to-ci-orange-600 bg-clip-text text-transparent mb-2">
                      2,450,000 FCFA
                    </div>
                    <div className="flex items-center text-sm">
                      <TrendingUp className="h-4 w-4 text-ci-green-600 mr-2" />
                      <span className="text-ci-green-600 font-semibold">+12% par rapport au mois dernier</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300">
                      <div className="text-sm text-slate-500 mb-2 font-medium">Biens actifs</div>
                      <div className="text-4xl font-bold text-slate-900">24</div>
                      <div className="text-xs text-slate-400 mt-1">Propriétés</div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-300">
                      <div className="text-sm text-slate-500 mb-2 font-medium">Taux d'occupation</div>
                      <div className="text-4xl font-bold text-slate-900">92%</div>
                      <div className="text-xs text-slate-400 mt-1">Performance</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <span className="text-slate-600 font-medium">Réservations confirmées</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-ci-green-500 rounded-full mr-2"></div>
                        <span className="font-bold text-slate-900">10</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <span className="text-slate-600 font-medium">En attente</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                        <span className="font-bold text-slate-900">3</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <span className="text-slate-600 font-medium">Demandes ce mois</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        <span className="font-bold text-slate-900">47</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-gradient-to-br from-ci-green-200 to-ci-orange-200 rounded-full blur-3xl opacity-30"></div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-8 border border-slate-200 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="flex items-center justify-between mb-6 lg:mb-8">
                  <h3 className="text-xl lg:text-2xl font-bold text-slate-900">Logements disponibles</h3>
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1 rounded-full">
                    <MapPin className="h-4 w-4 text-blue-600 inline mr-1" />
                    <span className="text-sm font-semibold text-blue-700">Nouveautés</span>
                  </div>
                </div>
                <div className="space-y-3 lg:space-y-4">
                  {recentHouses.length > 0 ? (
                    recentHouses.map((house) => (
                      <div
                        key={house.id}
                        className="flex items-center p-3 lg:p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer group border border-slate-200 hover:border-blue-200 hover:shadow-lg"
                        onClick={() => window.location.href = `/property/${house.id}`}
                      >
                        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl mr-3 lg:mr-4 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                          {(() => {
                            // Logique d'affichage d'image similaire à HouseBrowser
                            const getImageSrc = () => {
                              if (house.image_url) return house.image_url;
                              if (house.photos && house.photos.length > 0) return house.photos[0];
                              return null;
                            };

                            const imageSrc = getImageSrc();

                            if (imageSrc) {
                              return (
                                <img
                                  src={imageSrc}
                                  alt={house.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    console.error('Erreur de chargement image:', imageSrc);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              );
                            } else {
                              return (
                                <Home className="h-6 w-6 lg:h-8 lg:w-8 text-slate-400" />
                              );
                            }
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors text-base lg:text-lg line-clamp-1">
                            {house.title}
                          </h4>
                          <p className="text-sm text-slate-500 mb-1 lg:mb-2 flex items-center">
                            <MapPin className="h-3 w-3 inline mr-1 flex-shrink-0" />
                            <span className="truncate">{house.location}, {house.city}</span>
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                              {getPriceDisplay(house)}
                            </span>
                            <div className="flex items-center text-sm text-slate-500 space-x-2 lg:space-x-3">
                              <div className="flex items-center">
                                <Bed className="h-3 w-3 mr-1" />
                                {house.bedrooms}
                              </div>
                              <div className="flex items-center">
                                <Bath className="h-3 w-3 mr-1" />
                                {house.bathrooms}
                              </div>
                              <div className="flex items-center text-yellow-500">
                                <Star className="h-3 w-3 fill-current mr-1" />
                                4.8
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 lg:py-12 text-slate-500">
                      <div className="inline-flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-4 lg:mb-6">
                        <MapPin className="h-8 w-8 lg:h-10 lg:w-10 text-slate-400" />
                      </div>
                      <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-2">Aucun logement disponible</h3>
                      <p className="text-slate-600 mb-4 lg:mb-6">Revenez bientôt pour découvrir nos nouvelles offres</p>
                      <button
                        onClick={handleGetStarted}
                        className="inline-flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                      >
                        Devenir propriétaire
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 lg:w-40 lg:h-40 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full blur-3xl opacity-30"></div>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-lg">
                <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mr-2 animate-pulse"></span>
                Pour les locataires
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Trouvez votre prochain chez-vous
                </span>
              </h2>
              <p className="text-lg lg:text-xl text-slate-600 mb-6 lg:mb-8 leading-relaxed">
                Parcourez des centaines d'annonces vérifiées et réservez en quelques clics avec notre interface intuitive.
              </p>
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4 lg:mr-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <Search className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg lg:text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">Filtres intelligents</h4>
                    <p className="text-slate-600 leading-relaxed text-sm lg:text-base">Recherchez par ville, quartier, prix et type de logement avec des filtres avancés</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4 lg:mr-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <MessageSquare className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg lg:text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">Contact direct</h4>
                    <p className="text-slate-600 leading-relaxed text-sm lg:text-base">Communiquez directement avec les propriétaires via notre système de messagerie intégré</p>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4 lg:mr-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <CheckCircle className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg lg:text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">Réservation simple</h4>
                    <p className="text-slate-600 leading-relaxed text-sm lg:text-base">Processus de réservation transparent et sécurisé avec paiement en ligne</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white" id="pricing">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            LOKI est fait pour tous
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Commencez gratuitement. Pas de frais cachés, pas de surprise.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 hover:border-ci-orange-300 transition-all">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Locataire</h3>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-bold text-slate-900">0</span>
                <span className="text-xl text-slate-500 ml-2">FCFA</span>
              </div>
              <p className="text-slate-500 mt-2">100% gratuit</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-slate-700">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-3 flex-shrink-0" />
                Recherche illimitée
              </li>
              <li className="flex items-center text-slate-700">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-3 flex-shrink-0" />
                Contact propriétaires
              </li>
              <li className="flex items-center text-slate-700">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-3 flex-shrink-0" />
                Réservations sécurisées
              </li>
              <li className="flex items-center text-slate-700">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-3 flex-shrink-0" />
                Suivi locations
              </li>
            </ul>
            <button
              onClick={handleGetStarted}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl font-semibold transition-colors"
            >
              Commencer
            </button>
          </div>

          <div className="bg-gradient-to-br from-ci-orange-600 to-ci-orange-700 rounded-2xl p-8 text-white relative overflow-hidden transform scale-105 shadow-xl">
            <div className="absolute top-4 right-4 bg-ci-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              POPULAIRE
            </div>
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Propriétaire</h3>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-bold">5</span>
                <span className="text-xl ml-2 opacity-90">%</span>
              </div>
              <p className="opacity-90 mt-2">Par transaction réussie</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                Annonces illimitées
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                Photos et vidéos HD
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                Tableau de bord complet
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                Gestion réservations
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                Suivi revenus
              </li>
            </ul>
            <button
              onClick={handleGetStarted}
              className="w-full bg-white text-ci-orange-600 hover:bg-slate-50 py-3 rounded-xl font-semibold transition-colors"
            >
              Commencer
            </button>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 hover:border-ci-orange-300 transition-all">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Entreprise</h3>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-bold text-slate-900">Sur</span>
              </div>
              <p className="text-slate-500 mt-2">mesure</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-slate-700">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-3 flex-shrink-0" />
                Tout de Propriétaire
              </li>
              <li className="flex items-center text-slate-700">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-3 flex-shrink-0" />
                API personnalisée
              </li>
              <li className="flex items-center text-slate-700">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-3 flex-shrink-0" />
                Support prioritaire
              </li>
              <li className="flex items-center text-slate-700">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-3 flex-shrink-0" />
                Formation équipe
              </li>
            </ul>
            <button
              onClick={() => window.location.href = '/contact'}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-3 rounded-xl font-semibold transition-colors"
            >
              Nous contacter
            </button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-ci-orange-600 via-ci-orange-700 to-ci-orange-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]"></div>
        {/* Animations de fond avec gradients colorés */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-white/10 to-yellow-200/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-ci-green-200/20 to-emerald-200/20 rounded-full blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200/10 to-pink-200/10 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Prêt à transformer votre expérience de location ?
          </h2>
          <p className="text-xl mb-10 text-ci-green-50 max-w-2xl mx-auto">
            Rejoignez des centaines d'utilisateurs qui font déjà confiance à LOKI pour gérer leurs locations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center bg-white text-ci-orange-600 hover:bg-slate-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl justify-center"
            >
              Créer mon compte gratuitement
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-ci-green-100 mt-6">Aucune carte bancaire requise. Commencez en 2 minutes.</p>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-8 lg:mb-12">
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-ci-orange-600 p-2 rounded-lg">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">LOKI</span>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed max-w-md">
                La plateforme de location immobilière qui simplifie la vie des propriétaires et locataires en Côte d'Ivoire.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <Facebook className="h-5 w-5 text-white" />
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <Twitter className="h-5 w-5 text-white" />
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <Instagram className="h-5 w-5 text-white" />
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <Linkedin className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Produit</h4>
              <ul className="space-y-3 text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer">
                  <a href="#features">Fonctionnalités</a>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  <a href="#pricing">Tarifs</a>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  <a href="#security">Sécurité</a>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  <a href="#roadmap">Roadmap</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Ressources</h4>
              <ul className="space-y-3 text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer">
                  <a href="#help">Centre d'aide</a>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  <a href="#blog">Blog</a>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  <a href="#guide">Guide</a>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  <a href="#api">API</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Entreprise</h4>
              <ul className="space-y-3 text-slate-400">
                <li className="hover:text-white transition-colors cursor-pointer">
                  <a href="#careers">Carrières</a>
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  <a href="#partners">Partenaires</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 lg:pt-8 flex flex-col lg:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 lg:mb-0">
              &copy; 2025 LOKI. Tous droits réservés.
            </p>
            <div className="flex flex-wrap gap-4 lg:gap-6 text-sm text-slate-400">
              <a href="/about" className="hover:text-white transition-colors">À propos</a>
              <a href="/contact" className="hover:text-white transition-colors">Contact</a>
              <span className="hover:text-white transition-colors cursor-pointer">Confidentialité</span>
              <span className="hover:text-white transition-colors cursor-pointer">Conditions</span>
              <span className="hover:text-white transition-colors cursor-pointer">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
