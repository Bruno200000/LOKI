import React from 'react';
import { Home, Target, Shield, TrendingUp, Heart, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onGetStarted?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onGetStarted }) => {
  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      // Navigate to main site or registration
      window.location.href = '/';
    }
  };

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="bg-ci-orange-600 p-2 rounded-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-900">LOKI</span>
            </div>
            <div className="flex items-center space-x-6">
              <button onClick={() => handleNavigation('/')} className="text-slate-600 hover:text-slate-900 font-medium hidden md:block">
                Accueil
              </button>
              <button onClick={() => handleNavigation('/#features')} className="text-slate-600 hover:text-slate-900 font-medium hidden md:block">
                Fonctionnalités
              </button>
              <button onClick={() => handleNavigation('/#pricing')} className="text-slate-600 hover:text-slate-900 font-medium hidden md:block">
                Tarifs
              </button>
              <span className="text-ci-orange-600 font-medium hidden md:block">
                À propos
              </span>
              <button onClick={() => handleNavigation('/contact')} className="text-slate-600 hover:text-slate-900 font-medium hidden md:block">
                Contact
              </button>
              <button
                onClick={handleGetStarted}
                className="bg-ci-orange-600 hover:bg-ci-orange-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
              >
                Commencer
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center bg-ci-green-50 text-ci-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            Notre histoire
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Révolutionner la location
            <br />
            <span className="bg-gradient-to-r from-ci-orange-600 to-ci-green-500 bg-clip-text text-transparent">
              immobilière en Côte d'Ivoire
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            LOKI est née de la frustration de voir des propriétaires perdre des heures à gérer leurs biens
            et des locataires passer des semaines à trouver le logement idéal.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center bg-ci-orange-100 text-ci-orange-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
                Notre mission
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
                Simplifier la vie de tous
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Nous croyons que la location immobilière devrait être simple, transparente et accessible à tous.
                C'est pourquoi nous avons créé une plateforme qui élimine les intermédiaires coûteux et les processus compliqués.
              </p>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-ci-green-100 rounded-xl flex items-center justify-center mr-4">
                    <Target className="h-6 w-6 text-ci-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Connecter directement</h4>
                    <p className="text-slate-600">Propriétaires et locataires se rencontrent sans intermédiaire</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-ci-green-100 rounded-xl flex items-center justify-center mr-4">
                    <Shield className="h-6 w-6 text-ci-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Sécuriser les transactions</h4>
                    <p className="text-slate-600">Paiements sécurisés et contrats vérifiés pour tous</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-ci-green-100 rounded-xl flex items-center justify-center mr-4">
                    <TrendingUp className="h-6 w-6 text-ci-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Optimiser les revenus</h4>
                    <p className="text-slate-600">Aider les propriétaires à maximiser leurs revenus locatifs</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-ci-orange-50 to-ci-green-50 rounded-2xl p-8 border border-ci-orange-100">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-ci-orange-500 to-ci-orange-600 rounded-full mb-6">
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Nos valeurs</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <h5 className="font-semibold text-slate-900 mb-2">Transparence</h5>
                    <p className="text-sm text-slate-600">Prix clairs, processus transparent</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <h5 className="font-semibold text-slate-900 mb-2">Innovation</h5>
                    <p className="text-sm text-slate-600">Technologies modernes pour simplifier</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <h5 className="font-semibold text-slate-900 mb-2">Accessibilité</h5>
                    <p className="text-sm text-slate-600">Solution abordable pour tous</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-ci-orange-600 via-ci-orange-700 to-ci-orange-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Prêt à rejoindre
            <br />
            l'aventure LOKI ?
          </h2>
          <p className="text-xl mb-10 text-ci-green-50 max-w-2xl mx-auto">
            Que vous soyez propriétaire ou locataire, commencez votre expérience dès aujourd'hui
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center bg-white text-ci-orange-600 hover:bg-slate-50 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl justify-center"
            >
              Créer mon compte
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <a
              href="/contact"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('/contact');
              }}
              className="inline-flex items-center border-2 border-white text-white hover:bg-white hover:text-ci-orange-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all justify-center"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-ci-orange-600 p-2 rounded-lg">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">LOKI</span>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed">
                La plateforme de location immobilière qui simplifie la vie des propriétaires et locataires en Côte d'Ivoire.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <span className="text-xs">FB</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <span className="text-xs">TW</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                  <span className="text-xs">IN</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Produit</h4>
              <ul className="space-y-3 text-slate-400">
                <li><button onClick={() => handleNavigation('/')} className="hover:text-white transition-colors">Accueil</button></li>
                <li><button onClick={() => handleNavigation('/#features')} className="hover:text-white transition-colors">Fonctionnalités</button></li>
                <li><button onClick={() => handleNavigation('/#pricing')} className="hover:text-white transition-colors">Tarifs</button></li>
                <li><span className="text-ci-orange-400">À propos</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-3 text-slate-400">
                <li><button onClick={() => handleNavigation('/contact')} className="hover:text-white transition-colors">Contact</button></li>
                <li><button onClick={() => handleNavigation('/#')} className="hover:text-white transition-colors">Centre d'aide</button></li>
                <li><button onClick={() => handleNavigation('/#')} className="hover:text-white transition-colors">Documentation</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Entreprise</h4>
              <ul className="space-y-3 text-slate-400">
                <li><button onClick={() => handleNavigation('/')} className="hover:text-white transition-colors">Accueil</button></li>
                <li><button onClick={() => handleNavigation('/#features')} className="hover:text-white transition-colors">Fonctionnalités</button></li>
                <li><button onClick={() => handleNavigation('/#pricing')} className="hover:text-white transition-colors">Tarifs</button></li>
                <li><span className="text-ci-orange-400">À propos</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">
              &copy; 2025 LOKI. Tous droits réservés.
            </p>
            <div className="flex space-x-6 text-sm text-slate-400">
              <span className="hover:text-white transition-colors cursor-pointer">Confidentialité</span>
              <span className="hover:text-white transition-colors cursor-pointer">Conditions</span>
              <span className="hover:text-white transition-colors cursor-pointer">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
