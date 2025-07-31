import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  AiOutlineDashboard, 
  AiOutlineAlert, 
  AiOutlineCamera, 
  AiOutlineSetting,
  AiOutlineBook,
  AiOutlineClose
} from 'react-icons/ai';

const Sidebar = ({ userProfile, isOpen, onClose }) => {
  const location = useLocation();
  const canViewDashboard = userProfile?.profil === 'admin';
  const canViewAllIncidents = userProfile?.profil === 'admin' || userProfile?.profil === 'superviseur' || userProfile?.profil === 'technicien';
  const canViewCameras = userProfile?.profil !== 'user';
  const canViewSettings = userProfile?.profil === 'admin' || userProfile?.profil === 'superviseur';

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: AiOutlineDashboard,
      href: '/dashboard',
      visible: canViewDashboard,
      gradient: 'icon-gradient-blue',
      color: 'text-blue-600'
    },
    {
      name: 'Incidents',
      icon: AiOutlineAlert,
      href: '/incidents',
      visible: true,
      gradient: 'icon-gradient-purple',
      color: 'text-purple-600'
    },
    {
      name: 'Caméras',
      icon: AiOutlineCamera,
      href: '/cameras',
      visible: canViewCameras,
      gradient: 'icon-gradient-green',
      color: 'text-green-600'
    },
    {
      name: 'Paramètres',
      icon: AiOutlineSetting,
      href: '/settings',
      visible: canViewSettings,
      gradient: 'icon-gradient-orange',
      color: 'text-orange-600'
    }
  ];

  return (
    <aside className={`sidebar-border max-w-62.5 ease-nav-brand z-990 fixed inset-y-0 my-4 ml-4 block w-full ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex-wrap items-center justify-between overflow-y-auto rounded-2xl border-0 p-0 antialiased shadow-soft-xl transition-transform duration-200 xl:left-0 xl:translate-x-0`}>
      {/* Header avec logo iTech amélioré */}
      <div className="h-19.5 px-4">
        <i 
          className="absolute top-0 right-0 p-4 opacity-50 cursor-pointer text-slate-400 xl:hidden hover:opacity-80 transition-opacity" 
          onClick={onClose}
        >
          <AiOutlineClose className="w-5 h-5" />
        </i>
        <Link to="/" className="block py-6 m-0 whitespace-nowrap">
          <div className="flex items-center">
            <div className="logo-container w-12 h-12 rounded-xl flex items-center justify-center mr-4">
              <span className="text-white font-bold text-xl">iT</span>
            </div>
            <div>
              <span className="text-slate-800 font-bold text-xl tracking-tight">iTech</span>
              <div className="text-xs text-slate-500 font-medium">Gestion Intelligente</div>
            </div>
          </div>
        </Link>
      </div>

      <div className="elegant-separator mx-4"></div>

      {/* Navigation Menu */}
      <div className="items-center block w-auto overflow-auto">
        <ul className="flex flex-col pl-0 mb-0">
          {navigationItems.map((item, index) => {
            if (!item.visible) return null;
            
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.name} className="mt-1 w-full px-3">
                <Link 
                  to={item.href}
                  className={`sidebar-item py-3 text-base ease-nav-brand flex items-center whitespace-nowrap rounded-xl px-4 transition-all duration-300 ${
                    isActive 
                      ? 'shadow-soft-xl bg-white font-semibold text-slate-700 border-l-4 border-indigo-500' 
                      : 'hover:bg-white/50'
                  }`}
                >
                  <div className={`sidebar-icon shadow-soft-2xl mr-4 flex h-11 w-11 items-center justify-center rounded-xl stroke-0 text-center transition-all duration-300 group ${
                    isActive 
                      ? item.gradient 
                      : 'bg-gray-100'
                  }`}>
                    <Icon 
                      className={`w-5 h-5 transition-colors duration-300 ${
                        isActive 
                          ? 'text-white' 
                          : 'text-slate-600'
                      }`}
                    />
                  </div>
                  <span className={`sidebar-label text-slate-700 transition-all duration-300 flex-1 ${
                    isActive ? 'font-semibold' : 'font-medium'
                  }`}>
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Help Card moderne - Positionnée après les items */}
        <div className="mx-4 mt-6 mb-4">
          <div className="help-card p-6 shadow-soft-2xl">
            <div className="relative z-20 text-center text-white">
              <div className="transition-all duration-200 ease-nav-brand">
                <h6 className="mb-2 text-white font-semibold text-lg">Besoin d'aide ?</h6>
                <p className="mb-4 text-sm font-medium text-white/80 leading-relaxed">Consultez notre documentation</p>
                <a 
                  href="#" 
                  className="help-card-button inline-block w-full px-6 py-3 text-sm font-semibold text-slate-700 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  📚 Documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;