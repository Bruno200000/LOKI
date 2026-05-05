import { Home, Search, Shield, Users, TrendingUp, ArrowRight, CheckCircle, Building2, MapPin, Clock, MessageSquare, Facebook, Twitter, Instagram, Linkedin, Bed, Bath, Star, X, Sparkles, Phone, Mail, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, House } from '../lib/supabase';

function useTypewriter(phrases: string[], startDelay: number = 0) {
  const [text, setText] = useState('');

  useEffect(() => {
    const paddedPhrases = phrases.map(p => p + '      ');
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timeoutId: NodeJS.Timeout;
    let startTimeoutId: NodeJS.Timeout;

    const type = () => {
      const currentPhrase = paddedPhrases[phraseIndex];
      if (isDeleting) {
        setText(currentPhrase.substring(0, charIndex - 1));
        charIndex--;
      } else {
        setText(currentPhrase.substring(0, charIndex + 1));
        charIndex++;
      }

      let typeSpeed = isDeleting ? 30 : 80;

      if (!isDeleting && charIndex === currentPhrase.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % paddedPhrases.length;
        typeSpeed = 500;
      }

      timeoutId = setTimeout(type, typeSpeed);
    };

    startTimeoutId = setTimeout(() => {
      type();
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(startTimeoutId);
    };
  }, []);

  return text;
}

export function LandingPage() {
  const [houses, setHouses] = useState<House[]>([]);
  const [recentHouses, setRecentHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState(true);

  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'house' | 'residence' | 'land' | 'shop'>('all');
  const [filteredHouses, setFilteredHouses] = useState<House[]>([]);
  const [searchCity, setSearchCity] = useState('');
  const [searchNeighborhood, setSearchNeighborhood] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  const localityText = useTypewriter(["Ville, Quartier...", "Abidjan, Cocody...", "Bouaké, Nimbo...", "Yamoussoukro..."], 0);
  const roomsText = useTypewriter(["2, 3, 4+ Chambres...", "1 Chambre...", "3 pièces...", "Studio..."], 1000);
  const budgetText = useTypewriter(["500,000 FCFA...", "150,000 FCFA...", "1,000,000 FCFA...", "300,000 FCFA..."], 2000);
  const typeText = useTypewriter(["Appartement, Villa...", "Maison Basse...", "Terrain Nu...", "Local Commercial..."], 500);

  const CITY_QUARTIER: Record<string, string[]> = {
    'Abidjan': [
      "Abobo", "Adjamé", "Anyama", "Attécoubé", "Bingerville",
      "Cocody - Angré", "Cocody - Deux Plateaux", "Cocody - M'Pouto", "Cocody - Palmeraie",
      "Cocody - Riviera 1", "Cocody - Riviera 2", "Cocody - Riviera 3", "Cocody - Riviera 4",
      "Cocody - Riviera Faya", "Koumassi", "Marcory - Biétry", "Marcory - Résidentiel",
      "Marcory - Zone 4", "Plateau", "Port-Bouët", "Songon", "Treichville",
      "Yopougon - Maroc", "Yopougon - Niangon", "Yopougon - Selmer",
    ],
    'Bouaké': [
      "quartier bouaké", "Aéroport", "Ahougnanssou", "Air France 1", "Air France 2", "Air France 3",
      "Allokokro", "Attienkro", "Beaufort", "Belleville 1", "Belleville 2",
      "Broukro 1", "Broukro 2", "Camp Militaire", "Commerce", "Dar-es-Salam 1",
      "Dar-es-Salam 2", "Dar-es-Salam 3", "Dougouba", "Gonfreville", "Houphouët-Ville",
      "IDESSA", "Kamounoukro", "Kanakro", "Kennedy", "Koko", "Kodiakoffikro",
      "Konankankro", "Liberté", "Lycée Municipal", "Mamianou", "N'Dakro",
      "N'Gattakro", "N'Gouatanoukro", "Niankoukro", "Nimbo", "Sokoura",
      "Tièrèkro", "Tolla Kouadiokro", "Zone Industrielle",
      "Corridor sud", "Quartier milionnaire", "Béoumi", "Marcory", "Petit paris"
    ]
  };

  const handleGetStarted = () => {
    // Rediriger directement vers la page de connexion en forçant l'état d'authentification
    window.location.href = '/?login=true';
  };

  useEffect(() => {
    fetchFeaturedHouses();
    fetchRecentHouses();
  }, []);

  useEffect(() => {
    let filtered = [...houses];

    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(house => house.type === selectedCategory);
    }

    // Filtrer par ville
    if (searchCity) {
      filtered = filtered.filter(house =>
        house.city && house.city.toLowerCase() === searchCity.toLowerCase()
      );
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
  }, [selectedCategory, searchCity, searchNeighborhood, maxPrice, houses]);

  useEffect(() => {
    if (searchCity && CITY_QUARTIER[searchCity]) {
      setNeighborhoods(CITY_QUARTIER[searchCity]);
    } else {
      // Si aucune ville, montrer tous les quartiers uniques existants
      const houseNeighborhoods = houses.map(house => house.neighborhood).filter((neighborhood): neighborhood is string => Boolean(neighborhood));
      const allPredefined = [...CITY_QUARTIER['Abidjan'], ...CITY_QUARTIER['Bouaké']];
      const allNeighborhoods = [...new Set([...allPredefined, ...houseNeighborhoods])].sort();
      setNeighborhoods(allNeighborhoods);
    }
  }, [searchCity, houses]);

  // Auto-play videos on scroll for mobile/touch devices
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouch) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute('data-house-id');
          if (entry.isIntersecting && id) {
            setHoveredCard(Number(id));
          } else if (!entry.isIntersecting && id) {
            setHoveredCard((prev) => (prev === Number(id) ? null : prev));
          }
        });
      },
      { threshold: 0.6 }
    );

    const timeoutId = setTimeout(() => {
      const cards = document.querySelectorAll('.property-card');
      cards.forEach((card) => observer.observe(card));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [filteredHouses]);

  const getPriceDisplay = (house: House) => {
    switch (house.type) {
      case 'residence':
        return `${house.price.toLocaleString()} FCFA/nuit`;
      case 'land':
        return `${house.price.toLocaleString()} FCFA (Prix fixe)`;
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
        .limit(12);

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

      <section className="pt-24 pb-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
        {/* Glows de fond */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-ci-orange-100 rounded-full blur-[100px] opacity-60"></div>
          <div className="absolute top-40 right-20 w-[30rem] h-[30rem] bg-ci-green-100 rounded-full blur-[100px] opacity-40"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center pt-8 lg:pt-16">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-800 mb-6 leading-[1.1] tracking-tight animate-slide-up">
            Arrêtez de perdre des <br /> heures.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-ci-green-600 to-emerald-500 mt-2 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              À trouver votre résidence, maison, terrain, magasin...
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 mb-10 max-w-2xl mx-auto font-medium animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            Des milliers de biens mis en location à votre disposition. Créer un compte pour plus de fonctionnalités exclusives.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-ci-orange-600 hover:bg-ci-orange-700 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(255,144,0,0.3)] hover:shadow-[0_0_30px_rgba(255,144,0,0.5)] transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto"
            >
              Trouvez ce qu'il vous faut
            </button>
            <button
              onClick={() => window.location.href = '/?view=dashboard'}
              className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto"
            >
              Voir les offres
            </button>
          </div>

          {/* Search Mockup */}
          <div className="relative max-w-4xl mx-auto animate-fade-in-up">
            <div className="bg-slate-800 rounded-t-xl px-4 py-3 flex items-center space-x-2">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 text-center text-slate-400 text-xs font-medium font-mono">loki/recherche</div>
            </div>
            <div className="bg-white rounded-b-xl shadow-2xl p-6 sm:p-10 border-b border-l border-r border-slate-200 transition-all duration-500">
              <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-6 mb-6">
                <div className="flex-1 w-full group/field cursor-pointer">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-left group-hover/field:text-ci-orange-500 transition-colors">Localité</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left font-semibold text-slate-700 overflow-hidden text-ellipsis whitespace-nowrap group-hover/field:border-ci-orange-300 group-hover/field:bg-ci-orange-50/50 transition-all h-[56px] flex items-center">
                    {localityText}<span className="inline-block w-[2px] h-4 bg-slate-400 animate-pulse ml-0.5 align-middle"></span>
                  </div>
                </div>
                <div className="hidden sm:block w-px bg-slate-200"></div>
                <div className="flex-1 w-full group/field cursor-pointer">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-left group-hover/field:text-ci-green-500 transition-colors">Chambres</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left font-semibold text-slate-700 overflow-hidden text-ellipsis whitespace-nowrap group-hover/field:border-ci-green-300 group-hover/field:bg-ci-green-50/50 transition-all h-[56px] flex items-center">
                    {roomsText}<span className="inline-block w-[2px] h-4 bg-slate-400 animate-pulse ml-0.5 align-middle"></span>
                  </div>
                </div>
                <div className="hidden sm:block w-px bg-slate-200"></div>
                <div className="flex-1 w-full group/field cursor-pointer">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-left group-hover/field:text-ci-orange-500 transition-colors">Budget Max</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-4 overflow-hidden text-ellipsis whitespace-nowrap group-hover/field:border-ci-orange-300 group-hover/field:bg-ci-orange-50/50 transition-all h-[56px]">
                    <span className="font-semibold text-slate-700">{budgetText}</span><span className="inline-block w-[2px] h-4 bg-slate-400 animate-pulse ml-0.5 align-middle"></span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8 animate-slide-up" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
                <div className="flex-1 w-full group/field cursor-pointer">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-left group-hover/field:text-ci-green-500 transition-colors">Type de Bien</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left font-semibold text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap group-hover/field:border-ci-green-300 group-hover/field:bg-ci-green-50/50 transition-all h-[56px] flex items-center">
                    {typeText}<span className="inline-block w-[2px] h-4 bg-slate-400 animate-pulse ml-0.5 align-middle"></span>
                  </div>
                </div>
                <div className="hidden sm:block w-px h-16 bg-slate-200"></div>
                <div className="flex-[2] w-full group/field">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-left">Commodités & Options</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-ci-orange-100 hover:border-ci-orange-300 hover:text-ci-orange-700 border border-slate-200 rounded-full text-xs font-semibold text-slate-600 transition-all transform hover:scale-105">Piscine</span>
                    <span className="cursor-pointer px-4 py-2 bg-ci-green-100 text-ci-green-700 border border-ci-green-200 rounded-full text-xs font-bold shadow-sm transition-all transform hover:scale-105 flex items-center gap-1">Climatisé <CheckCircle className="w-3 h-3" /></span>
                    <span className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-ci-orange-100 hover:border-ci-orange-300 hover:text-ci-orange-700 border border-slate-200 rounded-full text-xs font-semibold text-slate-600 transition-all transform hover:scale-105">Parking</span>
                    <span className="cursor-pointer px-4 py-2 bg-white border border-slate-300 rounded-full text-xs font-semibold text-slate-500 border-dashed hover:border-solid hover:bg-slate-50 hover:text-slate-700 transition-all">+ Ajouter</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-ci-green-50 to-emerald-50 p-5 rounded-xl border border-ci-green-100 shadow-inner">
                <div className="flex items-center text-ci-green-700 font-bold mb-4 sm:mb-0">
                  <div className="relative mr-3">
                    <CheckCircle className="w-6 h-6 animate-pulse text-ci-green-600" />
                    <div className="absolute inset-0 bg-ci-green-400 rounded-full animate-ping opacity-20"></div>
                  </div>
                  <span className="text-lg">156 Biens disponibles</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <div className="h-3 bg-ci-green-200/50 rounded-full w-full sm:w-48 overflow-hidden shadow-inner relative">
                    <div className="h-full bg-gradient-to-r from-ci-green-400 to-ci-green-600 w-[75%] rounded-full absolute left-0 top-0"></div>
                  </div>
                  <button onClick={handleGetStarted} className="w-full sm:w-auto px-8 py-3 bg-ci-green-600 text-white font-bold rounded-lg hover:bg-ci-green-700 transition-all shadow-md hover:shadow-lg hover:shadow-ci-green-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                    <Search className="w-4 h-4" /> Voir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-16 relative z-10 animate-slide-up">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
            Conçu pour simplifier vos locations
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Que vous soyez propriétaire ou locataire, LOKI a été conçu pour automatiser tout le processus
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
            <div className="w-12 h-12 bg-ci-green-500 rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
              <Search className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Recherche intelligente</h3>
            <p className="text-slate-500 leading-relaxed mb-6">
              Trouvez facilement grâce à des vues personnalisées et aux détails pointus.
            </p>
            <div className="space-y-3">
              <div className="flex items-start text-slate-600 text-sm">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-2 flex-shrink-0" />
                <span className="pt-0.5">Filtres détaillés</span>
              </div>
              <div className="flex items-start text-slate-600 text-sm">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-2 flex-shrink-0" />
                <span className="pt-0.5">Visites virtuelles HD</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-ci-green-500 rounded-xl flex items-center justify-center mb-6 shadow-sm">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Gestion simplifiée</h3>
            <p className="text-slate-500 leading-relaxed mb-6">
              Gérez tout sans stress, depuis votre tableau de bord ou par notifications.
            </p>
            <div className="space-y-3">
              <div className="flex items-start text-slate-600 text-sm">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-2 flex-shrink-0" />
                <span className="pt-0.5">Tableau de bord dynamique</span>
              </div>
              <div className="flex items-start text-slate-600 text-sm">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-2 flex-shrink-0" />
                <span className="pt-0.5">Notifications SMS & Email</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-ci-green-500 rounded-xl flex items-center justify-center mb-6 shadow-sm">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Mise en relation sécurisée</h3>
            <p className="text-slate-500 leading-relaxed mb-6">
              Soyez rassuré en communiquant en toute confiance avant toute conclusion finale.
            </p>
            <div className="space-y-3">
              <div className="flex items-start text-slate-600 text-sm">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-2 flex-shrink-0" />
                <span className="pt-0.5">Système de messagerie privée</span>
              </div>
              <div className="flex items-start text-slate-600 text-sm">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-2 flex-shrink-0" />
                <span className="pt-0.5">Profils et avis vérifiés</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Maisons en Location */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white to-slate-50"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-orange-100/50 text-ci-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-ci-orange-200">
              <span className="w-2 h-2 bg-ci-orange-500 rounded-full mr-2"></span>
              Les plus recommandées
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
              Offres immobilières: résidences, maisons, terrains, magasins
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Trouvez votre prochain chez-vous parmi nos propriétés exclusives
            </p>
          </div>

          {/* Filtres de recherche */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Filtre par catégorie */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type de bien</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ci-orange-500 outline-none transition-all"
                >
                  <option value="all">Tous les types</option>
                  <option value="house">Locations</option>
                  <option value="residence">Meublés</option>
                  <option value="land">Ventes</option>
                  <option value="shop">Magasins</option>
                </select>
              </div>

              {/* Filtre par ville */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ville</label>
                <select
                  value={searchCity}
                  onChange={(e) => {
                    setSearchCity(e.target.value);
                    setSearchNeighborhood(''); // Réinitialiser le quartier si on change de ville
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ci-orange-500 outline-none transition-all"
                >
                  <option value="">Toutes les villes</option>
                  <option value="Abidjan">Abidjan</option>
                  <option value="Bouaké">Bouaké</option>
                </select>
              </div>

              {/* Filtre par quartier */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Quartier</label>
                <select
                  value={searchNeighborhood}
                  onChange={(e) => setSearchNeighborhood(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ci-orange-500 outline-none transition-all"
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Budget max (FCFA)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Ex: 500000"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-ci-orange-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Bouton pour réinitialiser les filtres */}
            {(selectedCategory !== 'all' || searchCity || searchNeighborhood || maxPrice) && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchCity('');
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
              {[...Array(12)].map((_, i) => (
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
                <a
                  key={house.id}
                  href={`/property/${house.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/property/${house.id}`;
                  }}
                  className="property-card block bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  data-house-id={house.id}
                  onMouseEnter={() => setHoveredCard(house.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    {(() => {
                      const getVideoSrc = () => {
                        if (house.video_url) return house.video_url;
                        if (house.videos !== undefined && house.videos !== null && house.videos.length > 0) return house.videos[0];
                        return null;
                      };
                      const getImageSrc = () => {
                        // Forcer l'affichage de l'image par défaut pour tous les types sur la landing page pour unifier le design
                        if (['residence', 'shop', 'house', 'land'].includes(house.type?.toLowerCase() || '')) return null;
                        if (house.image_url && !house.image_url.includes('default-')) return house.image_url;
                        if (house.photos && house.photos.length > 0) return house.photos[0];
                        return null;
                      };

                      const videoSrc = getVideoSrc();
                      const imageSrc = getImageSrc();
                      const isHovered = hoveredCard === house.id;

                      if (isHovered && videoSrc) {
                        return (
                          <video
                            src={videoSrc}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover transition-opacity duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              setHoveredCard(null);
                            }}
                          />
                        );
                      }

                      if (imageSrc) {
                        return (
                          <img
                            src={imageSrc}
                            alt={house.title}
                            className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : ''}`}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        );
                      } else {
                        return (
                          <div className="relative w-full h-full overflow-hidden">
                            <img
                              src={
                                house.type?.toLowerCase() === 'land' ? "/images/default-land.png" :
                                  house.type?.toLowerCase() === 'residence' ? "/images/default-residence.png" :
                                    house.type?.toLowerCase() === 'shop' ? "/images/default-shop.png" :
                                      "/images/default-property.png"
                              }
                              alt="LOKI Default"
                              className="w-full h-full object-cover opacity-80"
                            />
                            {['residence', 'shop', 'house', 'land'].includes(house.type?.toLowerCase() || '') && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/5 transition-colors group-hover:bg-black/20">
                                <span className="bg-white/95 backdrop-blur-xl px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-slate-900 shadow-[0_0_30px_rgba(255,255,255,0.5)] border border-white/50 uppercase tracking-[0.2em] animate-pulse transform group-hover:scale-110 transition-transform duration-500">
                                  {house.type?.toLowerCase() === 'residence' ? 'Résidence à louer' : 
                                   house.type?.toLowerCase() === 'shop' ? 'Magasin à louer' :
                                   house.type?.toLowerCase() === 'house' ? 'Maison à louer' :
                                   'Terrain en vente'}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      }
                    })()}

                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className="bg-ci-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                        VIP
                      </div>
                      <div className="bg-white/90 backdrop-blur text-slate-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        En vedette
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-orange-100 text-ci-orange-700 px-3 py-1.5 rounded-lg text-sm font-black shadow-sm border border-orange-200">
                      {getPriceDisplay(house)}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-ci-green-700 transition-colors line-clamp-1">
                      {house.title}
                    </h3>
                    <div className="flex items-center text-slate-500 text-sm mb-4">
                      <MapPin className="h-4 w-4 mr-1 text-slate-400" />
                      <span className="truncate">
                        {[...new Set([house.neighborhood, house.location, house.city].filter(Boolean))].join(', ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100 text-slate-600 text-sm font-medium">
                      {house.type !== 'land' && house.type !== 'shop' && (
                        <>
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-md">
                            <Bed className="h-4 w-4 text-slate-400" />
                            {house.bedrooms} ch.
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-md">
                            <Bath className="h-4 w-4 text-slate-400" />
                            {house.bathrooms} sdb
                          </div>
                        </>
                      )}
                      {house.area_sqm && (
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-md">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          {house.area_sqm}m²
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="bg-ci-green-50 text-ci-green-700 px-3 py-1.5 rounded text-xs font-bold tracking-wider uppercase">
                        {house.type === 'land' ? 'À VENDRE' : 'À LOUER'}
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-slate-700">4.8</span>
                      </div>
                    </div>
                  </div>
                </a>
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
                {selectedCategory !== 'all' || searchCity || searchNeighborhood || maxPrice
                  ? 'Essayez d\'ajuster vos filtres pour voir plus de résultats.'
                  : 'Revenez bientôt pour découvrir nos nouvelles offres'}
              </p>
              {(selectedCategory !== 'all' || searchCity || searchNeighborhood || maxPrice) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchCity('');
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

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden" id="features">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="relative">
              <div className="inline-flex items-center bg-green-50 text-ci-green-700 px-4 py-2 rounded-full text-sm font-bold mb-6 border border-green-100 uppercase tracking-wider">
                <span>Pour les propriétaires</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6">
                Gérez vos biens comme un pro
              </h2>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-lg">
                Tous les outils dont vous avez besoin pour maximiser la rentabilité de votre patrimoine immobilier de manière automatisée.
              </p>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-ci-green-500 rounded-xl flex items-center justify-center mr-5 shadow-sm text-white">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 mb-1">Activer des performances</h4>
                    <p className="text-slate-500 text-sm">Ayez une vue globale sur la rentabilité de tous vos biens centralisés.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-ci-green-500 rounded-xl flex items-center justify-center mr-5 shadow-sm text-white">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 mb-1">Gestion des locataires</h4>
                    <p className="text-slate-500 text-sm">Gérez toutes les demandes et signatures avec une seule interface puissante.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-ci-green-500 rounded-xl flex items-center justify-center mr-5 shadow-sm text-white">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 mb-1">Gain de temps</h4>
                    <p className="text-slate-500 text-sm">Automatisez les rappels, factures et encaissements pour gagner des heures.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-slate-50 rounded-3xl shadow-xl p-8 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <div className="bg-white/80 text-ci-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">Ce mois</div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-6">Vos statistiques</h3>
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-ci-green-500"></div>
                    <div className="text-xs text-slate-400 font-bold mb-1 uppercase tracking-wider">Revenus totaux</div>
                    <div className="text-4xl font-black text-ci-green-600 mb-2">
                      2,450,000 FCFA
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm text-center">
                      <div className="text-xs text-slate-400 font-bold mb-1 uppercase">Biens actifs</div>
                      <div className="text-2xl font-black text-slate-800">24</div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm text-center">
                      <div className="text-xs text-slate-400 font-bold mb-1 uppercase">Taux d'occup.</div>
                      <div className="text-2xl font-black text-slate-800">92%</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 text-sm">
                      <span className="text-slate-500 font-medium">Réservations confirmées</span>
                      <span className="font-bold text-ci-green-600">10</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 text-sm">
                      <span className="text-slate-500 font-medium">En attente</span>
                      <span className="font-bold text-yellow-500">3</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 text-sm">
                      <span className="text-slate-500 font-medium">Demandes ce mois</span>
                      <span className="font-bold text-blue-500">47</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mt-32 pt-24 border-t border-slate-100">
            <div className="order-2 lg:order-1 relative">
              <div className="bg-slate-50 rounded-3xl shadow-xl p-8 border border-slate-100 transition-all duration-500 transform hover:-translate-y-2">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-800">Derniers ajouts</h3>
                  <div className="bg-blue-100 px-3 py-1 rounded-full">
                    <MapPin className="h-4 w-4 text-blue-600 inline mr-1" />
                    <span className="text-sm font-bold text-blue-700">Nouveautés</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {recentHouses.length > 0 ? (
                    recentHouses.map((house) => (
                      <div
                        key={house.id}
                        className="flex items-center p-4 bg-white rounded-2xl hover:bg-slate-50 transition-all duration-300 cursor-pointer group border border-slate-100 shadow-sm hover:shadow-md"
                        onClick={() => window.location.href = `/property/${house.id}`}
                      >
                        <div className="w-20 h-20 bg-slate-100 rounded-xl mr-4 flex items-center justify-center overflow-hidden">
                          {(() => {
                            const getImageSrc = () => {
                              // Forcer l'image par défaut pour tous les types
                              if (['residence', 'shop', 'house', 'land'].includes(house.type?.toLowerCase() || '')) return null;
                              if (house.image_url && !house.image_url.includes('default-')) return house.image_url;
                              if (house.photos && house.photos.length > 0) return house.photos[0];
                              return null;
                            };

                            const imageSrc = getImageSrc();

                            if (imageSrc) {
                              return (
                                <img
                                  src={imageSrc}
                                  alt={house.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              );
                            } else {
                              return (
                                <div className="relative w-full h-full overflow-hidden">
                                  <img
                                    src={
                                      house.type?.toLowerCase() === 'land' ? "/images/default-land.png" :
                                      house.type?.toLowerCase() === 'residence' ? "/images/default-residence.png" :
                                      house.type?.toLowerCase() === 'shop' ? "/images/default-shop.png" :
                                      "/images/default-property.png"
                                    }
                                    alt="LOKI Default"
                                    className="w-full h-full object-cover opacity-60"
                                  />
                                  {['residence', 'shop', 'house', 'land'].includes(house.type?.toLowerCase() || '') && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                                      <span className="bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg text-[6px] font-black text-slate-900 shadow-xl border border-white/20 uppercase tracking-widest animate-pulse">
                                        {house.type?.toLowerCase() === 'residence' ? 'Résidence' : 
                                         house.type?.toLowerCase() === 'shop' ? 'Magasin' :
                                         house.type?.toLowerCase() === 'house' ? 'Maison' :
                                         'Terrain'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors text-base line-clamp-1">
                            {house.title}
                          </h4>
                          <p className="text-sm text-slate-500 mb-2 flex items-center">
                            <MapPin className="h-3 w-3 inline mr-1 flex-shrink-0 text-slate-400" />
                            <span className="truncate">
                              {[...new Set([house.neighborhood, house.location, house.city].filter(Boolean))].join(', ')}
                            </span>
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-black text-blue-600">
                              {getPriceDisplay(house)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-100">
                      <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-slate-800 mb-2">Aucun logement</h3>
                      <button
                        onClick={handleGetStarted}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold transition-all hover:bg-blue-700"
                      >
                        Devenir propriétaire
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 relative">
              <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6 border border-blue-100 uppercase tracking-wider">
                <span>Pour les locataires</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6">
                Trouvez votre prochain chez-vous
              </h2>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed max-w-lg">
                Parcourez des centaines d'annonces vérifiées et réservez en quelques clics avec notre interface intuitive et sécurisée.
              </p>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-5 shadow-sm text-white">
                    <Search className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 mb-1">Filtres intelligents</h4>
                    <p className="text-slate-500 text-sm">Ne perdez plus de temps : la recherche intègre tous vos critères précis.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-5 shadow-sm text-white">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 mb-1">Contact direct</h4>
                    <p className="text-slate-500 text-sm">Discutez en temps réel avec les propriétaires, en toute transparence.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-5 shadow-sm text-white">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 mb-1">Réservation simple</h4>
                    <p className="text-slate-500 text-sm">Signez et validez en ligne, payez le propriétaire avec traçabilité.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Section LOKI est fait pour tous */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center mb-16 relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
            LOKI est fait pour tous
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Que vous soyez un locataire à l'affût, un propriétaire avec un bien ou un expert de l'immobilier.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 relative z-10">
          {/* Locataire */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 text-center flex flex-col relative overflow-hidden">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Locataire</h3>
            <div className="flex items-baseline justify-center gap-1 mb-8">
              <span className="text-6xl font-black text-slate-800 tracking-tighter">0</span>
              <span className="text-slate-400 font-medium">FCFA / RECHERCHE</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1 text-left">
              <li className="flex items-center text-slate-600 text-sm">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-3 flex-shrink-0" />
                <span>Recherche gratuite</span>
              </li>
              <li className="flex items-center text-slate-600 text-sm">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-3 flex-shrink-0" />
                <span>Visites en ligne HD</span>
              </li>
              <li className="flex items-center text-slate-600 text-sm">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-3 flex-shrink-0" />
                <span>Prise de contact</span>
              </li>
              <li className="flex items-center text-slate-600 text-sm opacity-50">
                <X className="h-5 w-5 text-slate-400 mr-3 flex-shrink-0" />
                <span>Compte multi-agents</span>
              </li>
            </ul>
            <button
              onClick={() => window.location.href = '/?view=dashboard'}
              className="w-full py-4 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Rechercher
            </button>
          </div>

          {/* Propriétaire */}
          <div className="bg-gradient-to-b from-ci-orange-600 to-ci-orange-800 rounded-[2rem] p-8 shadow-2xl transition-all duration-300 text-center flex flex-col relative transform scale-105 z-10">
            <div className="absolute top-0 right-0 bg-yellow-400 text-slate-900 px-4 py-1.5 rounded-bl-xl rounded-tr-[2rem] text-xs font-black uppercase tracking-wider">
              Populaire
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Propriétaire</h3>
            <div className="flex items-baseline justify-center gap-1 mb-8">
              <span className="text-6xl font-black text-white tracking-tighter">5</span>
              <span className="text-orange-200 font-medium">% / TRANSACTION</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1 text-left">
              <li className="flex items-center text-white text-sm">
                <CheckCircle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0" />
                <span>Publication gratuite</span>
              </li>
              <li className="flex items-center text-white text-sm">
                <CheckCircle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0" />
                <span>Dashboard Analytics</span>
              </li>
              <li className="flex items-center text-white text-sm">
                <CheckCircle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0" />
                <span>Gestion locative centralisée</span>
              </li>
              <li className="flex items-center text-white text-sm">
                <CheckCircle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0" />
                <span>Visibilité supérieure</span>
              </li>
            </ul>
            <button
              onClick={handleGetStarted}
              className="w-full py-4 rounded-xl bg-white text-ci-orange-600 font-black shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              Publier un bien
            </button>
          </div>

          {/* Entreprise */}
          <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 text-center flex flex-col relative overflow-hidden">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Entreprise</h3>
            <div className="flex justify-center mb-8 h-[72px] items-center">
              <span className="text-4xl font-black text-slate-800 tracking-tighter uppercase border-b-4 border-slate-200 pb-2">Sur devis</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1 text-left">
              <li className="flex items-center text-slate-600 text-sm">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-3 flex-shrink-0" />
                <span>API de connexion</span>
              </li>
              <li className="flex items-center text-slate-600 text-sm">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-3 flex-shrink-0" />
                <span>Comptes multi-agents</span>
              </li>
              <li className="flex items-center text-slate-600 text-sm">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-3 flex-shrink-0" />
                <span>Exports personnalisés</span>
              </li>
              <li className="flex items-center text-slate-600 text-sm">
                <CheckCircle className="h-5 w-5 text-ci-green-500 mr-3 flex-shrink-0" />
                <span>Assistance dédiée</span>
              </li>
            </ul>
            <button
              onClick={() => window.location.href = '/contact'}
              className="w-full py-4 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Nous contacter
            </button>
          </div>
        </div>
      </section>

      {/* Section Clean Service */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden" id="cleaning-service">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-100/50 blur-[100px] rounded-full pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-green-100/40 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-black text-xs uppercase tracking-widest mb-6 border border-blue-100 shadow-sm">
              <Sparkles className="w-4 h-4" /> Partenaire LOKI
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 mb-6 leading-tight">
              Clean Service <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500 block">BOUAKÉ</span>
            </h2>
            <p className="text-xl text-slate-600 mb-8 font-medium">
              Votre satisfaction, notre mission ! Pour un espace propre et sain, faites appel à notre expertise en nettoyage.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              {[
                "Nettoyage de maison",
                "Nettoyage de bureau",
                "Nettoyage de fauteuil",
                "Nettoyage de fin chantier",
                "Nettoyage après événement",
                "Désinfection"
              ].map((service, index) => (
                <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-green-50 p-2 rounded-full">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  </div>
                  <span className="font-bold text-slate-700 text-sm">{service}</span>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 border border-slate-200 p-8 rounded-3xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
              <h3 className="font-black text-slate-800 mb-6 uppercase tracking-widest text-sm text-center sm:text-left">Contactez-Nous</h3>
              <div className="grid sm:grid-cols-2 gap-6 relative z-10">
                <a href="tel:0759842565" className="flex items-center gap-3 text-slate-700 font-bold hover:text-blue-600 transition group p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <div>07 59 84 25 65</div>
                    <div className="text-slate-400 text-xs font-medium">Appel & WhatsApp</div>
                  </div>
                </a>
                <a href="tel:0702416699" className="flex items-center gap-3 text-slate-700 font-bold hover:text-blue-600 transition group p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <div>07 02 41 66 99</div>
                    <div className="text-slate-400 text-xs font-medium">Ligne secondaire</div>
                  </div>
                </a>
                <a href="mailto:cleanservicebouake@gmail.com" className="flex items-center gap-3 text-slate-700 font-bold hover:text-blue-600 transition group p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-sm truncate">
                    <div>cleanservicebouake</div>
                    <div className="text-slate-400 text-xs font-medium">@gmail.com</div>
                  </div>
                </a>
                <a href="https://lokivoire.pro" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-700 font-bold hover:text-blue-600 transition group p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <div>lokivoire.pro</div>
                    <div className="text-slate-400 text-xs font-medium">Site Web</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 w-full max-w-lg relative">
            <div className="absolute inset-0 bg-blue-600 rounded-[3rem] transform rotate-3 scale-105 opacity-10 blur-xl"></div>
            <div className="bg-gradient-to-br from-blue-500 to-green-400 p-1.5 rounded-[3rem] shadow-2xl relative z-10 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="bg-white rounded-[2.8rem] p-8 sm:p-12 h-full flex flex-col justify-between">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100">
                    <Sparkles className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 mb-2">Service Premium</h3>
                  <div className="w-16 h-1.5 bg-gradient-to-r from-blue-500 to-green-400 mx-auto rounded-full"></div>
                </div>

                <div className="space-y-8 flex-1 flex flex-col justify-center">
                  <p className="text-center text-slate-600 text-lg font-medium italic">"L'expertise du nettoyage professionnel dans toutes les dimensions de votre maison et entreprise."</p>
                  <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-green-50 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    <p className="text-xs text-slate-500 mb-2 uppercase font-black tracking-widest relative z-10">Retrouvez-nous sur les réseaux</p>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="p-3 bg-white rounded-full shadow-sm text-slate-800 border border-slate-100"><Instagram className="w-6 h-6" /></div>
                      <div className="font-bold text-slate-800">@cleanservicebouake</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#9b5110] to-[#b4621c] text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-orange-400 rounded-full blur-[120px] opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-orange-600 rounded-full blur-[120px] opacity-20"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            Prêt à transformer votre <br />expérience de location ?
          </h2>
          <p className="text-xl mb-12 text-orange-100 max-w-2xl mx-auto font-medium">
            Le processus est infiniment plus court et transparent avec LOKI. Rejoignez la prochaine révolution immobilière.
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleGetStarted}
              className="px-10 py-5 bg-white text-[#9b5110] rounded-xl font-black text-lg shadow-2xl hover:shadow-white/20 transition-all transform hover:-translate-y-1 flex items-center"
            >
              Créer un compte gratuitement
              <ArrowRight className="ml-3 h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-orange-200/80 mt-8">Lancez-vous maintenant. L'inscription prend moins de 2 minutes.</p>
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
