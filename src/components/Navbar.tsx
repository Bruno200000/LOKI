import React from 'react';
import { Home, Menu, X, User, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  showBackToDashboard?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ showBackToDashboard }) => {
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleGetStarted = () => {
    window.location.href = '/?login=true';
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="bg-gradient-to-br from-ci-orange-500 to-ci-orange-600 p-2 rounded-xl shadow-lg shadow-ci-orange-200">
              <Home className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">LOKI <span className="text-ci-orange-600">PRO</span></span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/#features" className="text-slate-600 hover:text-ci-orange-600 font-semibold transition-colors">
              Fonctionnalités
            </a>
            <a href="/#pricing" className="text-slate-600 hover:text-ci-orange-600 font-semibold transition-colors">
              Tarifs
            </a>
            <button onClick={() => window.location.href = '/about'} className="text-slate-600 hover:text-ci-orange-600 font-semibold transition-colors">
              À propos
            </button>
            <button onClick={() => window.location.href = '/contact'} className="text-slate-600 hover:text-ci-orange-600 font-semibold transition-colors">
              Contact
            </button>
            
            {user ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
                {showBackToDashboard && (
                  <button
                    onClick={() => window.location.href = '/?view=dashboard'}
                    className="flex items-center gap-2 text-slate-700 hover:text-ci-orange-600 font-bold transition-all px-4 py-2 rounded-lg bg-slate-100"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </button>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 p-1 rounded-full group-hover:bg-slate-100 transition-all">
                    <div className="w-10 h-10 bg-ci-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                      {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                    </div>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 overflow-hidden">
                    <button onClick={() => window.location.href = '/?view=profile'} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50">
                      <User className="h-4 w-4" /> Mon Profil
                    </button>
                    <button onClick={signOut} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 border-t border-slate-50">
                      <LogOut className="h-4 w-4" /> Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleGetStarted}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Commencer
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-all"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-screen opacity-100 border-t border-slate-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pt-4 pb-8 space-y-2 bg-white">
          <a href="/#features" className="block px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
          <a href="/#pricing" className="block px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
          <button onClick={() => { window.location.href = '/about'; setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl">À propos</button>
          <button onClick={() => { window.location.href = '/contact'; setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl">Contact</button>
          {user ? (
            <>
              <div className="h-px bg-slate-100 my-2"></div>
              <button onClick={() => { window.location.href = '/?view=dashboard'; setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-ci-orange-600 font-bold hover:bg-orange-50 rounded-xl flex items-center gap-3">
                <LayoutDashboard className="h-5 w-5" /> Dashboard
              </button>
              <button onClick={signOut} className="w-full text-left px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl flex items-center gap-3">
                <LogOut className="h-5 w-5" /> Déconnexion
              </button>
            </>
          ) : (
            <button onClick={handleGetStarted} className="w-full px-4 py-4 bg-ci-orange-600 text-white font-bold rounded-xl shadow-lg mt-4">
              Commencer gratuitement
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
