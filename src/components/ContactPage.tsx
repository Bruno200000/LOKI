import React from 'react';
import { Home, Mail, Phone, MapPin, Clock, ArrowRight } from 'lucide-react';

interface ContactPageProps {
  onGetStarted?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onGetStarted }) => {
  const handleGetStarted = () => {
    // Navigate to main site to start registration process
    window.location.href = '/';
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
              <button onClick={() => handleNavigation('/about')} className="text-slate-600 hover:text-slate-900 font-medium hidden md:block">
                À propos
              </button>
              <span className="text-ci-orange-600 font-medium hidden md:block">
                Contact
              </span>
              <button
                onClick={handleGetStarted}
                className="bg-ci-orange-600 hover:bg-ci-orange-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
              >
                Créer un compte
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center bg-ci-green-50 text-ci-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            Contactez-nous
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Parlons de votre
            <br />
            <span className="bg-gradient-to-r from-ci-orange-600 to-ci-green-500 bg-clip-text text-transparent">
              projet immobilier
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Que vous soyez propriétaire souhaitant optimiser vos revenus ou locataire à la recherche du logement idéal,
            notre équipe est là pour vous accompagner.
          </p>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Informations de contact
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Voici comment nous contacter pour toute question ou demande d'information
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
              <div className="w-16 h-16 bg-ci-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-ci-orange-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Email</h4>
              <a href="mailto:loki@gmail.com" className="text-slate-600 hover:text-ci-orange-600 transition-colors">
                loki@gmail.com
              </a>
            </div>

            <div className="text-center p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
              <div className="w-16 h-16 bg-ci-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-ci-orange-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Téléphone</h4>
              <a href="tel:+2250170607784" className="text-slate-600 hover:text-ci-orange-600 transition-colors">
                +225 01 70 60 77 84
              </a>
            </div>

            <div className="text-center p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
              <div className="w-16 h-16 bg-ci-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-ci-orange-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Adresse</h4>
              <p className="text-slate-600">
                Bouaké, Commerce<br />
                Côte d'Ivoire
              </p>
            </div>

            <div className="text-center p-6 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
              <div className="w-16 h-16 bg-ci-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-ci-orange-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Horaires</h4>
              <p className="text-slate-600 text-sm">
                Lundi - Vendredi: 8h - 18h<br />
                Samedi: 9h - 12h<br />
                Dimanche: Fermé
              </p>
            </div>
          </div>

          <div className="mt-16 bg-slate-50 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Support client</h3>
            <p className="text-slate-600 mb-6">
              Notre équipe support est disponible pour répondre à vos questions en moins de 24h.
            </p>
            <a
              href="mailto:loki@gmail.com"
              className="inline-flex items-center bg-ci-orange-600 hover:bg-ci-orange-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Mail className="h-4 w-4 mr-2" />
              loki@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-ci-orange-600 via-ci-orange-700 to-ci-orange-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Prêt à transformer
            <br />
            votre expérience immobilière ?
          </h2>
          <p className="text-xl mb-10 text-ci-green-50 max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui font confiance à LOKI
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
              href="/about"
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('/about');
              }}
              className="inline-flex items-center border-2 border-white text-white hover:bg-white hover:text-ci-orange-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all justify-center"
            >
              En savoir plus
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
                <li><button onClick={() => handleNavigation('/about')} className="hover:text-white transition-colors">À propos</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-3 text-slate-400">
                <li><span className="text-ci-orange-400">Contact</span></li>
                <li><button onClick={() => handleNavigation('/#')} className="hover:text-white transition-colors">Centre d'aide</button></li>
                <li><button onClick={() => handleNavigation('/#')} className="hover:text-white transition-colors">Documentation</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Entreprise</h4>
              <ul className="space-y-3 text-slate-400">
                <li><button onClick={() => handleNavigation('/about')} className="hover:text-white transition-colors">À propos</button></li>
                <li><span className="text-ci-orange-400">Contact</span></li>
                <li><button onClick={() => handleNavigation('/#')} className="hover:text-white transition-colors">Blog</button></li>
                <li><button onClick={() => handleNavigation('/#')} className="hover:text-white transition-colors">Carrières</button></li>
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
