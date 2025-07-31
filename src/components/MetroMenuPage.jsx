import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  UserX,
  Lock,
  Truck,
  Siren,
  CheckSquare,
  Users as UsersIcon,
  Car,
  Ship,
  Package,
  Box,
  Calendar,
  BarChart,
  MapPin,
  Camera,
  Flag,
  FileText,
  Building2,
  Shield,
  Activity,
  Cog,
  TrendingUp,
  Database
} from 'lucide-react';

const MetroMenuPage = ({ menuType, userRole }) => {
  const menuData = {
    donnees: {
      title: 'Données Opérations',
      icon: Database,
      color: 'from-blue-500 to-blue-600',
      items: [
        { title: 'Alertes', icon: Siren, color: 'from-red-600 to-red-700', href: '/operations/alertes' },
        { title: 'Cargaisons saisies', icon: Truck, color: 'from-blue-500 to-blue-600', href: '/operations/cargaisons-saisies' },
        { title: 'Contrôle d\'accès', icon: CheckSquare, color: 'from-green-500 to-green-600', href: '/operations/controle-acces' },
        { title: 'Effectifs', icon: UsersIcon, color: 'from-blue-600 to-blue-700', href: '/operations/effectifs' },
        { title: 'Événements', icon: Calendar, color: 'from-orange-500 to-orange-600', href: '/operations/evenements' },
        { title: 'Incidents', icon: AlertCircle, color: 'from-red-500 to-red-600', href: '/operations/incidents' },
        { title: 'Individus interpellés', icon: UserX, color: 'from-orange-500 to-orange-600', href: '/operations/individus-interpelles' },
        { title: 'Kilométrages', icon: Car, color: 'from-gray-500 to-gray-600', href: '/operations/kilometrages' },
        { title: 'Matériels', icon: Box, color: 'from-purple-600 to-purple-700', href: '/operations/materiels' },
        { title: 'Produits à l\'exportation', icon: Package, color: 'from-green-600 to-green-700', href: '/operations/produits-exportation' },
        { title: 'Provision de bord', icon: Ship, color: 'from-blue-500 to-blue-600', href: '/operations/provision-bord' },
        { title: 'Titres d\'accès saisis', icon: Lock, color: 'from-purple-500 to-purple-600', href: '/operations/titres-acces-saisis' }
      ]
    },
    statistiques: {
      title: 'Statistiques',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      items: [
        { title: 'Alertes', icon: Siren, color: 'from-red-600 to-red-700', href: '/statistiques/alertes' },
        { title: 'Effectifs', icon: UsersIcon, color: 'from-blue-600 to-blue-700', href: '/statistiques/effectifs' },
        { title: 'Incidents', icon: AlertCircle, color: 'from-red-500 to-red-600', href: '/statistiques/incidents' },
        { title: 'Individus interpellés', icon: UserX, color: 'from-orange-500 to-orange-600', href: '/statistiques/individus-interpelles' },
        { title: 'Kilométrage', icon: Car, color: 'from-gray-500 to-gray-600', href: '/statistiques/kilometrage' },
        { title: 'Titres d\'accès saisis', icon: Lock, color: 'from-purple-500 to-purple-600', href: '/statistiques/titres-acces-saisis' }
      ]
    },
    parametres: {
      title: 'Paramètres',
      icon: Cog,
      color: 'from-purple-500 to-purple-600',
      items: [
        { title: 'Caméras', icon: Camera, color: 'from-gray-500 to-gray-600', href: '/parametres/cameras' },
        { title: 'Embarcations', icon: Ship, color: 'from-blue-500 to-blue-600', href: '/parametres/type-embarcations' },
        { title: 'Entreprise', icon: Building2, color: 'from-indigo-500 to-indigo-600', href: '/parametres/entreprise' },
        { title: 'Équipe', icon: UsersIcon, color: 'from-purple-500 to-purple-600', href: '/parametres/equipe' },
        { title: 'Lieux', icon: MapPin, color: 'from-blue-600 to-blue-700', href: '/parametres/lieux' },
        { title: 'Motifs saisie', icon: Lock, color: 'from-purple-500 to-purple-600', href: '/parametres/motifs-saisie' },
        { title: 'Patrouilleurs', icon: Shield, color: 'from-blue-500 to-blue-600', href: '/parametres/patrouilleurs' },
        { title: 'Personnels', icon: UsersIcon, color: 'from-green-500 to-green-600', href: '/parametres/personnels' },
        { title: 'Produits export', icon: Package, color: 'from-green-600 to-green-700', href: '/parametres/type-produits-exportation' },
        { title: 'Provision bord', icon: Ship, color: 'from-blue-500 to-blue-600', href: '/parametres/type-provision-bord' },
        { title: 'Résultats alerte', icon: Flag, color: 'from-red-500 to-red-600', href: '/parametres/resultats-alerte' },
        { title: 'Type cargaison', icon: Truck, color: 'from-blue-600 to-blue-700', href: '/parametres/type-cargaison' },
        { title: 'Type d\'incident', icon: Lock, color: 'from-green-500 to-green-600', href: '/parametres/type-incident' },
        { title: 'Type document', icon: FileText, color: 'from-blue-500 to-blue-600', href: '/parametres/type-document' },
        { title: 'Type matériel', icon: Box, color: 'from-purple-600 to-purple-700', href: '/parametres/type-materiel' },
        { title: 'Véhicules', icon: Car, color: 'from-blue-600 to-blue-700', href: '/parametres/vehicule' },
        { title: 'Zones', icon: MapPin, color: 'from-blue-500 to-blue-600', href: '/parametres/zones' }
      ]
    }
  };

  const getTileClasses = () => {
    return "metro-tile relative overflow-hidden cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-2xl active:scale-95 h-32 w-full";
  };

  if (!menuType || !menuData[menuType]) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Menu non trouvé</h2>
        <p className="text-gray-600">Le menu demandé n'existe pas.</p>
      </div>
    );
  }

  const currentMenu = menuData[menuType];

  // Calculer les items visibles selon les permissions
  const visibleItems = menuType === 'parametres' && userRole !== 'admin' 
    ? [] 
    : currentMenu.items;

  if (visibleItems.length === 0 && menuType === 'parametres') {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Accès restreint</h2>
        <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à ce menu.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-140px)] bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-center">
        {/* Metro tiles grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 w-full justify-items-center">
          {visibleItems.map((item, itemIndex) => {
            const Icon = item.icon;
            return (
              <Link
                key={itemIndex}
                to={item.href}
                className={`${getTileClasses()} tile-animate`}
                style={{ 
                  animationDelay: `${itemIndex * 0.1}s`
                }}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color}`}>
                  {/* Overlay pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white rounded-full transform translate-x-10 -translate-y-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full transform -translate-x-8 translate-y-8"></div>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between p-4 text-white">
                  {/* Icon */}
                  <div className="flex justify-end">
                    <Icon className="w-6 h-6 opacity-80" />
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="font-semibold text-sm leading-tight tracking-wide">
                      {item.title}
                    </h3>
                  </div>

                  {/* Active indicator */}
                  <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-white rounded-full opacity-60"></div>
                </div>

                {/* Metro-style border effect */}
                <div className="absolute inset-0 border-2 border-transparent hover:border-white hover:border-opacity-30 transition-all duration-300"></div>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        .metro-tile {
          position: relative;
          border-radius: 0;
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          min-width: 160px;
          width: 100%;
          max-width: 200px;
        }
        
        /* Animation d'apparition progressive */
        .tile-animate {
          opacity: 0;
          transform: translateY(20px);
          animation: tileAppear 0.6s ease-out forwards;
        }
        
        @keyframes tileAppear {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default MetroMenuPage;