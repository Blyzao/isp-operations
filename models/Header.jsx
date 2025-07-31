import React, { useState } from 'react';
import { AiOutlineUser, AiOutlineLogout, AiOutlineEdit } from 'react-icons/ai';
import { auth } from '../firebase';

const Header = ({ userProfile, pageTitle, pageCategory = "Pages" }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  // Générer les initiales à partir du nom
  const getInitials = (name) => {
    if (!name) return 'UN';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <nav className="relative flex flex-wrap items-center justify-between px-0 py-2 mx-6 transition-all shadow-none duration-250 ease-soft-in rounded-2xl lg:flex-nowrap lg:justify-start">
      <div className="flex items-center justify-between w-full px-4 py-1 mx-auto flex-wrap-inherit">
        
        {/* Section gauche : Breadcrumb + Titre */}
        <nav>
          <ol className="flex flex-wrap pt-1 mr-12 bg-transparent rounded-lg sm:mr-16">
            <li className="leading-normal text-sm">
              <a className="opacity-50 text-slate-700 hover:opacity-70 transition-opacity" href="javascript:;">
                {pageCategory}
              </a>
            </li>
            <li className="text-sm pl-2 capitalize leading-normal text-slate-700 before:float-left before:pr-2 before:text-gray-600 before:content-['/']" aria-current="page">
              {pageTitle}
            </li>
          </ol>
          <h6 className="mb-0 font-bold capitalize text-slate-700 text-lg">
            {pageTitle}
          </h6>
        </nav>
        
        {/* Section droite : Avatar + Menu */}
        <div className="flex items-center mt-2 grow sm:mt-0 sm:mr-6 md:mr-0 lg:flex lg:basis-auto justify-end">
          
          {/* Profil utilisateur modernisé */}
          <div className="flex items-center space-x-3 mr-2">
            {/* Informations utilisateur */}
            <div className="hidden sm:block text-right">
              <div className="text-sm font-semibold text-slate-700 leading-tight">
                {userProfile?.nom || 'Utilisateur'}
              </div>
              <div className="text-xs text-slate-500 font-medium capitalize">
                {userProfile?.profil || 'user'}
              </div>
            </div>
          </div>
          
          {/* Avatar avec menu déroulant */}
          <div className="relative">
            <div 
              className="cursor-pointer sidebar-item"
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              {userProfile?.urlImage ? (
                <img 
                  src={userProfile.urlImage} 
                  alt="Avatar"
                  className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-soft-2xl hover:scale-105 transition-all duration-300 ease-nav-brand"
                />
              ) : (
                <div className="logo-container w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-soft-2xl hover:scale-105 transition-all duration-300 ease-nav-brand border-2 border-white">
                  {getInitials(userProfile?.nom)}
                </div>
              )}
            </div>
            
            {/* Menu déroulant modernisé */}
            <div 
              className={`absolute right-0 top-14 z-50 w-56 sidebar-border bg-white rounded-2xl shadow-soft-3xl transition-all duration-300 ease-nav-brand ${
                showDropdown 
                  ? 'opacity-100 visible transform translate-y-0 scale-100' 
                  : 'opacity-0 invisible transform -translate-y-3 scale-95'
              }`}
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              {/* Header du dropdown */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl px-4 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  {userProfile?.urlImage ? (
                    <img 
                      src={userProfile.urlImage} 
                      alt="Avatar"
                      className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-soft-xl"
                    />
                  ) : (
                    <div className="logo-container w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-soft-xl border-2 border-white">
                      {getInitials(userProfile?.nom)}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-slate-700 leading-tight">
                      {userProfile?.nom || 'Utilisateur'}
                    </div>
                    <div className="text-xs text-slate-500 font-medium capitalize flex items-center space-x-1">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>{userProfile?.profil || 'user'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items du menu */}
              <div className="py-2">
                <button 
                  className="sidebar-item flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50 transition-all duration-300 ease-nav-brand group"
                  onClick={() => {/* TODO: Ouvrir modal profil */}}
                >
                  <div className="w-8 h-8 bg-gradient-to-tl from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                    <AiOutlineEdit className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold">Éditer profil</span>
                </button>
                
                <button 
                  className="sidebar-item flex items-center w-full px-4 py-3 text-sm text-slate-700 hover:bg-red-50 transition-all duration-300 ease-nav-brand group"
                  onClick={handleSignOut}
                >
                  <div className="w-8 h-8 bg-gradient-to-tl from-red-500 to-rose-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                    <AiOutlineLogout className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-red-600">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </nav>
  );
};

export default Header;