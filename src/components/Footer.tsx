import React from 'react';
import { Home, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-8 mb-8">
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
                <a href="/">Accueil</a>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                <a href="/about">À propos</a>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                <a href="/contact">Contact</a>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                <span>Fonctionnalités</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Ressources</h4>
            <ul className="space-y-3 text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer">
                <span>Centre d'aide</span>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                <span>Blog</span>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                <span>Guide utilisateur</span>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                <span>API Documentation</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Légal</h4>
            <ul className="space-y-3 text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer">
                <span>Politique de confidentialité</span>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                <span>Conditions d'utilisation</span>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                <span>Politique des cookies</span>
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                <span>Mentions légales</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Administration</h4>
            <ul className="space-y-3 text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer">
                <a href="/admin" className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin Dashboard
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm mb-4 md:mb-0">
            &copy; 2025 LOKI. Tous droits réservés.
          </p>
          <div className="flex space-x-6 text-sm text-slate-400">
            <span className="hover:text-white transition-colors cursor-pointer">Confidentialité</span>
            <span className="hover:text-white transition-colors cursor-pointer">Conditions</span>
            <span className="hover:text-white transition-colors cursor-pointer">Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
