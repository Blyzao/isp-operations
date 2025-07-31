import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AiOutlineEnvironment,
  AiOutlineTool,
  AiOutlineDesktop,
  AiOutlineTeam,
  AiOutlineBank,
  AiOutlineCheckCircle,
  AiOutlineClockCircle,
  AiOutlineAppstore
} from 'react-icons/ai';

const Settings = ({ userProfile }) => {
  const navigate = useNavigate();
  const settingsItems = [
    {
      id: 'sites',
      title: 'Sites',
      subtitle: 'Gestion des sites',
      icon: AiOutlineEnvironment,
      color: 'from-blue-500 to-blue-600',
      href: '/settings/sites'
    },
    {
      id: 'equipment-types',
      title: 'Types Équipements',
      subtitle: 'Catégories matériel',
      icon: AiOutlineTool,
      color: 'from-green-500 to-green-600',
      href: '/settings/equipment-types'
    },
    {
      id: 'equipment',
      title: 'Équipements',
      subtitle: 'Inventaire général',
      icon: AiOutlineDesktop,
      color: 'from-purple-500 to-purple-600',
      href: '/settings/equipment'
    },
    {
      id: 'users',
      title: 'Utilisateurs',
      subtitle: 'Gestion des comptes',
      icon: AiOutlineTeam,
      color: 'from-orange-500 to-orange-600',
      href: '/settings/users'
    },
    {
      id: 'departments',
      title: 'Départements',
      subtitle: 'Organisation',
      icon: AiOutlineBank,
      color: 'from-teal-500 to-teal-600',
      href: '/settings/departments'
    },
    {
      id: 'status',
      title: 'Status',
      subtitle: 'États système',
      icon: AiOutlineCheckCircle,
      color: 'from-emerald-500 to-emerald-600',
      href: '/settings/status'
    },
    {
      id: 'sla',
      title: 'SLA',
      subtitle: 'Accords de service',
      icon: AiOutlineClockCircle,
      color: 'from-red-500 to-red-600',
      href: '/settings/sla'
    },
    {
      id: 'categories',
      title: 'Catégories',
      subtitle: 'Classification',
      icon: AiOutlineAppstore,
      color: 'from-indigo-500 to-indigo-600',
      href: '/settings/categories'
    }
  ];

  const getTileClasses = () => {
    return "metro-tile relative overflow-hidden cursor-pointer transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-2xl active:scale-95 h-40";
  };

  const handleTileClick = (item) => {
    if (item.id === 'users') {
      // Navigation vers le composant UsersTable
      navigate('/settings/users');
    } else if (item.id === 'departments') {
      // Navigation vers le composant DepartmentsTable
      navigate('/settings/departments');
    } else if (item.id === 'categories') {
      // Navigation vers le composant CategoriesTable
      navigate('/settings/categories');
    } else if (item.id === 'sites') {
      // Navigation vers le composant SitesTable
      navigate('/settings/sites');
    } else if (item.id === 'equipment-types') {
      // Navigation vers le composant TypeEquipementTable
      navigate('/settings/equipment-types');
    } else if (item.id === 'equipment') {
      // Navigation vers le composant EquipementsTable
      navigate('/settings/equipment');
    } else {
      console.log(`Navigation vers: ${item.href}`);
      // TODO: Implement navigation for other items
      navigate(item.href);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-140px)] bg-gray-50 flex items-center justify-center">
      {/* Grille de tuiles Metro - 4 colonnes x 2 lignes, centrée */}
      <div className="grid grid-cols-4 gap-6 max-w-4xl">
        {settingsItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={getTileClasses()}
              onClick={() => handleTileClick(item)}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color}`}>
                {/* Overlay pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full transform -translate-x-12 translate-y-12"></div>
                </div>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-between p-6 text-white">
                {/* Icon */}
                <div className="flex justify-end">
                  <Icon className="w-8 h-8 opacity-80" />
                </div>

                {/* Text */}
                <div>
                  <h3 className="font-bold mb-1 text-lg leading-tight">
                    {item.title}
                  </h3>
                  <p className="opacity-90 font-medium text-xs">
                    {item.subtitle}
                  </p>
                </div>

                {/* Active indicator */}
                <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full opacity-60"></div>
              </div>

              {/* Metro-style border effect */}
              <div className="absolute inset-0 border-2 border-transparent hover:border-white hover:border-opacity-30 transition-all duration-300"></div>
            </div>
          );
        })}
      </div>

      <style>{`
        .metro-tile {
          position: relative;
          border-radius: 0;
          font-family: 'Segoe UI', 'Poppins', sans-serif;
        }
        
        .metro-tile::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.6s;
        }
        
        .metro-tile:hover::before {
          left: 100%;
        }

        /* Responsive grid adjustments */
        @media (max-width: 1024px) {
          .grid {
            grid-template-columns: repeat(3, 1fr);
            max-width: 36rem;
          }
        }
        
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: repeat(2, 1fr);
            max-width: 24rem;
          }
        }
        
        @media (max-width: 480px) {
          .grid {
            grid-template-columns: 1fr;
            max-width: 12rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;