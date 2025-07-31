// Mise à jour complète de la navbar avec tous les améliorations
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import {
  AlertCircle,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
  FileText,
  UserX,
  Lock,
  Truck,
  Siren,
  CheckSquare,
  Users as UsersIcon,
  MapPin,
  Camera,
  Flag,
  Shield,
  Car,
  Ship,
  Package,
  Box,
  Calendar,
  BarChart,
  Database,
  TrendingUp,
  Activity,
  Cog,
} from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";

function Navbar({ user }) {
  const [userRole, setUserRole] = useState("user");
  const [isRoleLoaded, setIsRoleLoaded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNavItem, setActiveNavItem] = useState('');

  const defaultAvatar =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTUiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxMiIgcj0iNSIgZmlsbD0iIzZCNzI4MCIvPgo8cGF0aCBkPSJNNSAyNC41QzUgMjAuMzU3OSA4LjM1NzkgMTcgMTIuNSAxN0gxNy41QzIxLjY0MjEgMTcgMjUgMjAuMzU3OSAyNSAyNC41VjI1SDVWMjQuNVoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+";

  // Fonction pour détecter l'item actif (optimisée pour éviter les flashs)
  const getActiveNavItem = (pathname) => {
    if (pathname.includes('/menu/donnees') || pathname.includes('/operations/')) {
      return 'donnees';
    } else if (pathname.includes('/menu/statistiques') || pathname.includes('/statistiques/')) {
      return 'statistiques';
    } else if (pathname.includes('/menu/parametres') || pathname.includes('/parametres/')) {
      return 'parametres';
    }
    return '';
  };

  // Mettre à jour l'état actif instantanément
  useEffect(() => {
    const newActiveItem = getActiveNavItem(location.pathname);
    if (newActiveItem !== activeNavItem) {
      setActiveNavItem(newActiveItem);
    }
  }, [location.pathname, activeNavItem]);

  useEffect(() => {
    const checkUserRole = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().profil || "user");
          }
        } catch (error) {
          console.error("Erreur lors de la vérification du rôle:", error);
        } finally {
          setIsRoleLoaded(true);
        }
      } else {
        setIsRoleLoaded(true);
      }
    };
    checkUserRole();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/auth");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  const handleOpenChangePasswordModal = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleCloseChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
  };

  // Gestionnaires de clic pour mise à jour immédiate
  const handleNavClick = (navItem) => {
    setActiveNavItem(navItem);
  };

  if (!user) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-xl shadow-soft-xl border-b border-slate-200/50 h-18" style={{borderRadius: '0 0 40px 40px'}}>
        <div className="container mx-auto px-6 py-3 flex justify-between items-center h-full">
          <Link
            to="/"
            className="flex items-center space-x-4 group transition-all duration-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white rounded-2xl p-2"
          >
            {/* Logo ISP avec effet extraordinaire */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-125 group-hover:rotate-6 group-hover:shadow-blue-500/40 border border-white/20">
                {/* Effet de brillance animé */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {/* Initiales ISP stylisées */}
                <span className="relative z-10 text-white font-black text-lg tracking-tighter group-hover:text-blue-100 transition-colors duration-300 drop-shadow-lg">
                  ISP
                </span>
                {/* Points décoratifs */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg animate-pulse opacity-80"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-md animate-bounce opacity-70" style={{animationDelay: '0.5s'}}></div>
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl scale-110 opacity-0 group-hover:opacity-60 transition-all duration-500"></div>
            </div>
            
            {/* Texte "Opérations" stylisé */}
            <div className="flex flex-col justify-center">
              <span className="text-slate-800 text-2xl font-black tracking-tight leading-none group-hover:text-blue-700 transition-all duration-300">
                Opérations
              </span>
              <span className="text-slate-400 font-medium tracking-wide opacity-70 group-hover:text-blue-500 group-hover:opacity-90 transition-all duration-300" style={{fontFamily: 'Dancing Script, cursive', fontSize: '10px'}}>
                Security Platform
              </span>
            </div>
          </Link>
          <div className="w-10 h-10 bg-slate-100 rounded-full border border-slate-200"></div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-200/50 h-18" style={{borderRadius: '0 0 40px 40px'}}>
        <div className="container mx-auto px-6 py-3 flex items-center justify-between h-full">
          {/* Logo Extraordinaire */}
          <Link
            to="/"
            className="flex items-center space-x-4 group transition-all duration-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white rounded-2xl p-2"
          >
            {/* Logo ISP avec effet magnifique */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-125 group-hover:rotate-6 group-hover:shadow-blue-500/40 border border-white/20">
                {/* Effet de brillance animé */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                {/* Initiales ISP stylisées */}
                <span className="relative z-10 text-white font-black text-lg tracking-tighter group-hover:text-blue-100 transition-colors duration-300 drop-shadow-lg">
                  ISP
                </span>
                {/* Points décoratifs animés */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg animate-pulse opacity-80"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-md animate-bounce opacity-70" style={{animationDelay: '0.5s'}}></div>
              </div>
              {/* Glow effect magique */}
              <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl scale-110 opacity-0 group-hover:opacity-60 transition-all duration-500"></div>
            </div>
            
            {/* Texte "Opérations" avec style premium */}
            <div className="flex flex-col justify-center">
              <span className="text-slate-800 text-2xl font-black tracking-tight leading-none group-hover:text-blue-700 transition-all duration-300">
                Opérations
              </span>
              <span className="text-slate-400 font-medium tracking-wide opacity-70 group-hover:text-blue-500 group-hover:opacity-90 transition-all duration-300" style={{fontFamily: 'Dancing Script, cursive', fontSize: '10px'}}>
                Security Platform
              </span>
            </div>
          </Link>

          {/* Menu principal centré */}
          <div className="flex items-center justify-center space-x-2 hidden md:flex absolute left-1/2 transform -translate-x-1/2">
            {!isRoleLoaded && (
              <div className="flex items-center space-x-2">
                <div className="animate-pulse bg-slate-200 h-10 w-20 rounded-xl"></div>
                <div className="animate-pulse bg-slate-200 h-10 w-24 rounded-xl"></div>
                <div className="animate-pulse bg-slate-200 h-10 w-20 rounded-xl"></div>
              </div>
            )}

            {isRoleLoaded && (
              <>
                {/* Données Opérations */}
                <Link 
                  to="/menu/donnees"
                  onClick={() => handleNavClick('donnees')}
                  className={`sidebar-item py-3 px-5 text-sm ease-nav-brand flex items-center whitespace-nowrap rounded-2xl transition-all duration-500 font-semibold cursor-pointer h-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white group hover:scale-105 ${
                    activeNavItem === 'donnees' || getActiveNavItem(location.pathname) === 'donnees'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl border border-blue-300/60 font-bold transform scale-105' 
                      : 'text-slate-600 bg-transparent hover:bg-transparent hover:border-blue-500 border border-slate-200/50 hover:text-slate-700 focus:bg-transparent focus:border-blue-500 focus:text-slate-700'
                  }`}
                >
                  <div className={`sidebar-icon shadow-xl mr-4 flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ${
                    activeNavItem === 'donnees' || getActiveNavItem(location.pathname) === 'donnees' ? 'bg-white/20 scale-110 rotate-6' : 'bg-slate-100 group-hover:bg-blue-500 group-focus:bg-blue-500 group-hover:shadow-lg'
                  }`}>
                    <Database className={`w-5 h-5 drop-shadow-sm transition-colors duration-500 ${
                      activeNavItem === 'donnees' || getActiveNavItem(location.pathname) === 'donnees' ? 'text-white' : 'text-slate-600 group-hover:text-white group-focus:text-white'
                    }`} />
                  </div>
                  <span className="sidebar-label font-bold tracking-wide">Données</span>
                </Link>

                {/* Statistiques */}
                <Link 
                  to="/menu/statistiques"
                  onClick={() => handleNavClick('statistiques')}
                  className={`sidebar-item py-3 px-5 text-sm ease-nav-brand flex items-center whitespace-nowrap rounded-2xl transition-all duration-500 font-semibold cursor-pointer h-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white group hover:scale-105 ${
                    activeNavItem === 'statistiques' || getActiveNavItem(location.pathname) === 'statistiques'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl border border-blue-300/60 font-bold transform scale-105' 
                      : 'text-slate-600 bg-transparent hover:bg-transparent hover:border-blue-500 border border-slate-200/50 hover:text-slate-700 focus:bg-transparent focus:border-blue-500 focus:text-slate-700'
                  }`}
                >
                  <div className={`sidebar-icon shadow-xl mr-4 flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ${
                    activeNavItem === 'statistiques' || getActiveNavItem(location.pathname) === 'statistiques' ? 'bg-white/20 scale-110 rotate-6' : 'bg-slate-100 group-hover:bg-blue-500 group-focus:bg-blue-500 group-hover:shadow-lg'
                  }`}>
                    <TrendingUp className={`w-5 h-5 drop-shadow-sm transition-colors duration-500 ${
                      activeNavItem === 'statistiques' || getActiveNavItem(location.pathname) === 'statistiques' ? 'text-white' : 'text-slate-600 group-hover:text-white group-focus:text-white'
                    }`} />
                  </div>
                  <span className="sidebar-label font-bold tracking-wide">Statistiques</span>
                </Link>

                {/* Paramètres (admin seulement) */}
                {userRole === "admin" && (
                  <Link 
                    to="/menu/parametres"
                    onClick={() => handleNavClick('parametres')}
                    className={`sidebar-item py-3 px-5 text-sm ease-nav-brand flex items-center whitespace-nowrap rounded-2xl transition-all duration-500 font-semibold cursor-pointer h-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white group hover:scale-105 ${
                      activeNavItem === 'parametres' || getActiveNavItem(location.pathname) === 'parametres'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl border border-blue-300/60 font-bold transform scale-105' 
                        : 'text-slate-600 bg-transparent hover:bg-transparent hover:border-blue-500 border border-slate-200/50 hover:text-slate-700 focus:bg-transparent focus:border-blue-500 focus:text-slate-700'
                    }`}
                  >
                    <div className={`sidebar-icon shadow-xl mr-4 flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ${
                      activeNavItem === 'parametres' || getActiveNavItem(location.pathname) === 'parametres' ? 'bg-white/20 scale-110 rotate-6' : 'bg-slate-100 group-hover:bg-blue-500 group-focus:bg-blue-500 group-hover:shadow-lg'
                    }`}>
                      <Cog className={`w-5 h-5 drop-shadow-sm transition-colors duration-500 ${
                        activeNavItem === 'parametres' || getActiveNavItem(location.pathname) === 'parametres' ? 'text-white' : 'text-slate-600 group-hover:text-white group-focus:text-white'
                      }`} />
                    </div>
                    <span className="sidebar-label font-bold tracking-wide">Paramètres</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Menu utilisateur */}
          <div className="relative group">
            <button className="flex items-center space-x-3 bg-blue-50/60 hover:bg-blue-100/80 backdrop-blur-sm px-4 py-2.5 rounded-xl transition-all duration-300 border border-blue-200/40 hover:border-blue-300/60 shadow-soft-xl hover:shadow-soft-2xl h-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white group-hover:scale-[1.02]">
              <span className="text-slate-700 font-medium hidden sm:block max-w-32 truncate text-sm group-hover:text-blue-700 transition-colors duration-300">
                {user?.email || "Utilisateur"}
              </span>
              <div className="relative">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User"
                    className="w-8 h-8 rounded-full border-2 border-blue-200/50 group-hover:border-blue-300 transition-all duration-300 shadow-sm"
                    onError={(e) => {
                      e.target.src = defaultAvatar;
                    }}
                  />
                ) : (
                  <img
                    src={defaultAvatar}
                    alt="User"
                    className="w-8 h-8 rounded-full border-2 border-blue-200/50 group-hover:border-blue-300 transition-all duration-300 shadow-sm"
                  />
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 transition-transform duration-300 group-hover:rotate-180" />
            </button>
            
            {/* Dropdown amélioré */}
            <div className="absolute right-0 mt-2 w-80 bg-white/98 backdrop-blur-2xl rounded-2xl shadow-lg z-[110] border border-slate-200/60 animate-in fade-in slide-in-from-top-5 duration-300 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5rem)] overflow-hidden hidden group-hover:block before:content-[''] before:absolute before:w-full before:h-4 before:-top-4 before:bg-transparent">
              <div className="p-0">
                {/* Header avec background bleu */}
                <div className="bg-blue-600 p-6 rounded-t-2xl">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {user?.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="User"
                          className="w-12 h-12 rounded-full border-3 border-white/60 shadow-lg"
                          onError={(e) => {
                            e.target.src = defaultAvatar;
                          }}
                        />
                      ) : (
                        <img
                          src={defaultAvatar}
                          alt="User"
                          className="w-12 h-12 rounded-full border-3 border-white/60 shadow-lg"
                        />
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/80 uppercase tracking-wider font-medium mb-1">
                        Connecté en tant que
                      </p>
                      <p className="text-white font-semibold text-base truncate leading-tight">
                        {user?.email || "Utilisateur"}
                      </p>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                        <span className="text-white/90 text-xs font-medium">En ligne</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Menu items */}
                <div className="p-3">
                  {userRole === "admin" && (
                    <Link
                      to="/users"
                      className="flex items-center px-3 py-3 text-slate-700 hover:bg-blue-50/80 hover:text-blue-700 transition-all duration-300 text-sm group rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-blue-50/80 w-full"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-all duration-300 flex-shrink-0">
                        <Users className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="font-medium block leading-tight">Utilisateurs</span>
                        <span className="text-xs text-slate-500 group-hover:text-blue-600 leading-tight">Gestion des comptes</span>
                      </div>
                    </Link>
                  )}
                  
                  <button
                    onClick={handleOpenChangePasswordModal}
                    className="flex items-center w-full px-3 py-3 text-slate-700 hover:bg-blue-50/80 hover:text-blue-700 transition-all duration-300 text-sm group rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-blue-50/80"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 transition-all duration-300 flex-shrink-0">
                      <Settings className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-medium block leading-tight">Paramètres</span>
                      <span className="text-xs text-slate-500 group-hover:text-blue-600 leading-tight">Mise à jour du compte</span>
                    </div>
                  </button>
                </div>
                
                {/* Footer avec bouton déconnexion */}
                <div className="border-t border-slate-100 p-3">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-3 text-red-600 hover:bg-red-50/80 hover:text-red-700 transition-all duration-300 text-sm group rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-red-50/80"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200 transition-all duration-300 flex-shrink-0">
                      <LogOut className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-medium block leading-tight">Déconnexion</span>
                      <span className="text-xs text-slate-500 group-hover:text-red-600 leading-tight">Se déconnecter du système</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={handleCloseChangePasswordModal}
      />
      
      <style>{`
        /* Police Poppins pour toute la navbar */
        nav {
          font-family: 'Poppins', sans-serif;
        }
        
        /* Couleurs uniformes en bleu */
        .bg-blue-500 {
          background-color: #3b82f6;
        }
        
        .bg-blue-600 {
          background-color: #2563eb;
        }
        
        /* Shadows personnalisées */
        .shadow-soft-xl {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .shadow-soft-2xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        /* Transition ease personnalisée */
        .ease-nav-brand {
          transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        /* Styles pour les items de navigation */
        .sidebar-item {
          position: relative;
        }
        
        .sidebar-item:hover .sidebar-icon {
          transform: scale(1.05);
        }
        
        .sidebar-label {
          font-weight: 500;
          letter-spacing: 0.025em;
        }
        
        /* Animation pour les icônes */
        .sidebar-icon {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        /* États focus améliorés */
        .sidebar-item:focus {
          transform: translateY(-1px);
        }
        
        /* Animations des dropdown items */
        .group:hover .group {
          animation: slideInFromTop 0.3s ease-out;
        }
        
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Border personnalisée pour les avatars */
        .border-3 {
          border-width: 3px;
        }
        
        /* Optimisations pour éviter les flashs visuels */
        .sidebar-item {
          will-change: background-color, color, transform, box-shadow;
        }
        
        .sidebar-icon {
          will-change: transform;
        }
        
        /* Préchargement des états hover */
        .sidebar-item:not(.bg-blue-50\/80):not(.bg-green-50\/80):not(.bg-orange-50\/80):hover {
          background-color: rgba(148, 163, 184, 0.08);
        }
        
        /* Animations extraordinaires pour le logo ISP */
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        
        /* Effet de rotation fluide */
        .logo-hover-rotate {
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        /* Effet shimmer sur le texte */
        .text-shimmer {
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        /* Hauteur navbar ajustée */
        .h-18 {
          height: 4.5rem;
        }
        
        /* Animation floating pour les points décoratifs */
        .floating-dot {
          animation: float 3s ease-in-out infinite;
        }
        
        .floating-dot:nth-child(2) {
          animation-delay: 1s;
        }
      `}</style>
    </>
  );
}

export default Navbar;