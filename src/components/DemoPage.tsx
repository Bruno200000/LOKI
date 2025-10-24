import React, { useState, useEffect } from 'react';
import { Volume2, Maximize, ArrowLeft } from 'lucide-react';

export const DemoPage: React.FC = () => {
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const navigateTo = (destination: string) => {
    switch (destination) {
      case 'home':
        window.location.href = '/';
        break;
      case 'about':
        window.location.href = '/about';
        break;
      case 'contact':
        window.location.href = '/contact';
        break;
      case 'back':
        window.history.back();
        break;
      default:
        window.location.href = '/';
    }
  };

  const toggleFullscreen = () => {
    // Utiliser le mode plein écran natif de l'iframe
    const iframe = document.querySelector('iframe');
    if (iframe) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if ((iframe as any).webkitRequestFullscreen) {
        (iframe as any).webkitRequestFullscreen();
      } else if ((iframe as any).mozRequestFullScreen) {
        (iframe as any).mozRequestFullScreen();
      } else if ((iframe as any).msRequestFullscreen) {
        (iframe as any).msRequestFullscreen();
      } else {
        alert('Plein écran non supporté sur ce navigateur');
      }
    }
  };

  const handleWindowControl = (action: 'close' | 'minimize' | 'maximize') => {
    switch (action) {
      case 'close':
        // For demo purposes, just show an alert
        alert('Fenêtre fermée !');
        break;
      case 'minimize':
        // For demo purposes, just show an alert
        alert('Fenêtre minimisée !');
        break;
      case 'maximize':
        // For demo purposes, just show an alert
        alert('Fenêtre maximisée !');
        break;
    }
  };

  // Masquer automatiquement les contrôles après 3 secondes d'inactivité
  useEffect(() => {
    if (showControls && !isLoading) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showControls, isLoading]);

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-ci-orange-900/20 via-slate-900 to-ci-green-900/20"></div>

      {/* Navigation */}
      <nav className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Simple Back Button */}
            <button
              onClick={() => navigateTo('home')}
              className="flex items-center gap-3 text-white hover:text-ci-orange-400 transition-all duration-300 text-sm sm:text-base bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline font-medium">Retour à l'accueil</span>
              <span className="sm:hidden">Retour</span>
            </button>

            {/* Logo and Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-ci-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm sm:text-lg">L</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-white">LOKI Demo</span>
            </div>

            <div className="w-16 sm:w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto w-full">
          {/* Browser Window Container */}
          <div className="bg-white rounded-t-3xl shadow-2xl overflow-hidden border-2 border-slate-300 max-w-5xl mx-auto">
            {/* Browser Header */}
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b-2 border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div
                    onClick={() => handleWindowControl('close')}
                    className="w-4 h-4 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-pointer shadow-sm"
                  ></div>
                  <div
                    onClick={() => handleWindowControl('minimize')}
                    className="w-4 h-4 rounded-full bg-yellow-400 hover:bg-yellow-500 transition-colors cursor-pointer shadow-sm"
                  ></div>
                  <div
                    onClick={() => handleWindowControl('maximize')}
                    className="w-4 h-4 rounded-full bg-green-400 hover:bg-green-500 transition-colors cursor-pointer shadow-sm"
                  ></div>
                </div>
              </div>
              <div className="flex-1 max-w-lg mx-6">
                <div className="bg-white rounded-xl px-4 py-2 text-sm text-slate-700 border-2 border-slate-200 flex items-center shadow-inner">
                  <div className="w-5 h-5 bg-ci-orange-600 rounded mr-3 flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs font-bold">L</span>
                  </div>
                  <span className="font-medium">loki.app/demo</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => alert('Page précédente')}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => alert('Page suivante')}
                  className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Video container */}
            <div
              className="relative bg-black overflow-hidden aspect-video z-10"
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(false)}
              onMouseMove={() => setShowControls(true)}
            >
              {/* YouTube Video Embed with autoplay control */}
              <iframe
                src="https://www.youtube.com/embed/zzmJB7gVKCQ?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&mute=0"
                title="LOKI Platform Demo"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
              />

              {/* Loading indicator */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[60]">
                  <div className="text-white text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                    <p className="text-lg font-medium">Chargement de la vidéo...</p>
                  </div>
                </div>
              )}

              {/* Custom Video controls overlay - Show when hovering */}
              {showControls && !isLoading && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-[50]">
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                    <button
                      onClick={() => alert('Utilisez les contrôles YouTube intégrés')}
                      className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
                      title="Contrôles YouTube intégrés"
                    >
                      <span className="text-white text-xs">▶️</span>
                    </button>

                    <button
                      onClick={() => alert('Utilisez les contrôles YouTube intégrés')}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
                      title="Contrôles YouTube intégrés"
                    >
                      <Volume2 className="w-4 h-4 text-white" />
                    </button>

                    <button
                      onClick={toggleFullscreen}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all"
                      title="Plein écran"
                    >
                      <Maximize className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Demo features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-12 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-ci-orange-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-ci-orange-500 rounded"></div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Interface Intuitive</h3>
              <p className="text-slate-300 text-sm sm:text-base">
                Dashboard moderne et facile à utiliser pour gérer vos propriétés et réservations
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-ci-green-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-ci-green-500 rounded"></div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Réservations Simplifiées</h3>
              <p className="text-slate-300 text-sm sm:text-base">
                Processus de réservation fluide avec paiements sécurisés intégrés
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded"></div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Analyses Détaillées</h3>
              <p className="text-slate-300 text-sm sm:text-base">
                Suivez vos performances avec des statistiques complètes et des rapports
              </p>
            </div>
          </div>

          {/* Call to action */}
          <div className="text-center px-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 lg:mb-6">
              Prêt à transformer votre expérience de location ?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mb-6 lg:mb-8 max-w-2xl mx-auto">
              Rejoignez la plateforme qui révolutionne la location immobilière en Côte d'Ivoire
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/'}
                className="bg-ci-orange-600 hover:bg-ci-orange-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Commencer maintenant
              </button>
              <button className="border-2 border-white/30 hover:border-white/50 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all backdrop-blur-sm hover:bg-white/10 transform hover:scale-105">
                En savoir plus
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
