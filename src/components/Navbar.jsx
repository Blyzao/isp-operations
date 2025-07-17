import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";

function Navbar({ user }) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [operationsDropdownOpen, setOperationsDropdownOpen] = useState(false);
  const [statsDropdownOpen, setStatsDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [userRole, setUserRole] = useState("user");
  const navigate = useNavigate();

  const defaultAvatar =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTUiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxMiIgcj0iNSIgZmlsbD0iIzZCNzI4MCIvPgo8cGF0aCBkPSJNNSAyNC41QzUgMjAuMzU3OSA4LjM1NzkgMTcgMTIuNSAxN0gxNy41QzIxLjY0MjEgMTcgMjUgMjAuMzU3OSAyNSAyNC41VjI1SDVWMjQuNVoiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+";

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
        }
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".relative.group")) {
        setUserDropdownOpen(false);
        setOperationsDropdownOpen(false);
        setStatsDropdownOpen(false);
        setSettingsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleDropdown = (setter, state) => (e) => {
    e.stopPropagation();
    setUserDropdownOpen(false);
    setOperationsDropdownOpen(false);
    setStatsDropdownOpen(false);
    setSettingsDropdownOpen(false);
    setter(!state);
  };

  const handleOpenChangePasswordModal = () => {
    setUserDropdownOpen(false);
    setIsChangePasswordModalOpen(true);
  };

  const handleCloseChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
  };

  if (!user) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-blue-900 to-blue-700 shadow-md border-b border-blue-500/30 h-16">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center space-x-2 group transition-all duration-300 hover:scale-105"
          >
            <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xl font-extrabold tracking-tight group-hover:text-blue-200">
              Nexion
            </span>
          </Link>
          <div className="w-8 h-8 bg-white/20 rounded-full"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-blue-900 to-blue-700 shadow-md border-b border-blue-500/30 h-16">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center space-x-2 group transition-all duration-300 hover:scale-105"
        >
          <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-xl font-extrabold tracking-tight group-hover:text-blue-200">
            Nexion
          </span>
        </Link>

        <div className="flex items-center space-x-6">
          <div className="relative group hidden md:block">
            <button
              onClick={toggleDropdown(
                setOperationsDropdownOpen,
                operationsDropdownOpen
              )}
              className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-300 font-medium text-sm flex items-center"
            >
              <FileText className="w-4 h-4 mr-2" />
              Données Opérations
              <ChevronDown
                className={`w-4 h-4 ml-2 text-white/70 transition-transform duration-300 ${
                  operationsDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {operationsDropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl z-[110] border border-gray-200/50 animate-in fade-in slide-in-from-top-2 duration-200 max-w-7xl mx-auto">
                <div className="grid grid-cols-3 gap-4 p-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Sécurité
                    </h3>
                    <Link
                      to="/operations/incidents"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                      onClick={() => setOperationsDropdownOpen(false)}
                    >
                      <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                      Incidents
                    </Link>
                    <Link
                      to="/operations/individus-interpelles"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                      onClick={() => setOperationsDropdownOpen(false)}
                    >
                      <UserX className="w-4 h-4 mr-2 text-orange-500" />
                      Individus interpellés
                    </Link>
                    <Link
                      to="/operations/titres-acces-saisis"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                      onClick={() => setOperationsDropdownOpen(false)}
                    >
                      <Lock className="w-4 h-4 mr-2 text-purple-500" />
                      Titres d'accès saisis
                    </Link>
                    <Link
                      to="/operations/cargaisons-saisies"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                      onClick={() => setOperationsDropdownOpen(false)}
                    >
                      <Truck className="w-4 h-4 mr-2 text-blue-500" />
                      Cargaisons saisies
                    </Link>
                    <Link
                      to="/operations/alertes"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                      onClick={() => setOperationsDropdownOpen(false)}
                    >
                      <Siren className="w-4 h-4 mr-2 text-red-600" />
                      Alertes
                    </Link>
                    <Link
                      to="/operations/controle-acces"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                      onClick={() => setOperationsDropdownOpen(false)}
                    >
                      <CheckSquare className="w-4 h-4 mr-2 text-green-500" />
                      Contrôle d'accès
                    </Link>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Ressources
                    </h3>
                    <Link
                      to="/operations/effectifs"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                      onClick={() => setOperationsDropdownOpen(false)}
                    >
                      <UsersIcon className="w-4 h-4 mr-2 text-blue-600" />
                      Effectifs
                    </Link>
                    <Link
                      to="/operations/kilometrages"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                      onClick={() => setOperationsDropdownOpen(false)}
                    >
                      <Car className="w-4 h-4 mr-2 text-gray-500" />
                      Kilométrages
                    </Link>
                    <Link
                      to="/operations/produits-exportation"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                      onClick={() => setOperationsDropdownOpen(false)}
                    >
                      <Package className="w-4 h-4 mr-2 text-green-600" />
                      Produits à l'exportation
                    </Link>
                    <Link
                      to="/operations/materiels"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                      onClick={() => setOperationsDropdownOpen(false)}
                    >
                      <Box className="w-4 h-4 mr-2 text-purple-600" />
                      Matériels
                    </Link>
                    <Link
                      to="/operations/provision-bord"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                      onClick={() => setOperationsDropdownOpen(false)}
                    >
                      <Ship className="w-4 h-4 mr-2 text-blue-500" />
                      Provision de bord
                    </Link>
                    <Link
                      to="/operations/evenements"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                      onClick={() => setOperationsDropdownOpen(false)}
                    >
                      <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                      Événements
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative group hidden md:block">
            <button
              onClick={toggleDropdown(setStatsDropdownOpen, statsDropdownOpen)}
              className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-300 font-medium text-sm flex items-center"
            >
              <BarChart className="w-4 h-4 mr-2" />
              Statistiques
              <ChevronDown
                className={`w-4 h-4 ml-2 text-white/70 transition-transform duration-300 ${
                  statsDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {statsDropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl z-[110] border border-gray-200/50 animate-in fade-in slide-in-from-top-2 duration-200 max-w-7xl mx-auto">
                <div className="grid grid-cols-3 gap-4 p-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Statistiques
                    </h3>
                    <Link
                      to="/statistiques/incidents"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                      onClick={() => setStatsDropdownOpen(false)}
                    >
                      <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                      Incidents
                    </Link>
                    <Link
                      to="/statistiques/individus-interpelles"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                      onClick={() => setStatsDropdownOpen(false)}
                    >
                      <UserX className="w-4 h-4 mr-2 text-orange-500" />
                      Individus interpellés
                    </Link>
                    <Link
                      to="/statistiques/alertes"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                      onClick={() => setStatsDropdownOpen(false)}
                    >
                      <Siren className="w-4 h-4 mr-2 text-red-600" />
                      Alertes
                    </Link>
                    <Link
                      to="/statistiques/titres-acces-saisis"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                      onClick={() => setStatsDropdownOpen(false)}
                    >
                      <Lock className="w-4 h-4 mr-2 text-purple-500" />
                      Titres d'accès saisis
                    </Link>
                    <Link
                      to="/statistiques/effectifs"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                      onClick={() => setStatsDropdownOpen(false)}
                    >
                      <UsersIcon className="w-4 h-4 mr-2 text-blue-600" />
                      Effectifs
                    </Link>
                    <Link
                      to="/statistiques/kilometrage"
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                      onClick={() => setStatsDropdownOpen(false)}
                    >
                      <Car className="w-4 h-4 mr-2 text-gray-500" />
                      Kilométrage
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {userRole === "admin" && (
            <div className="relative group hidden md:block">
              <button
                onClick={toggleDropdown(
                  setSettingsDropdownOpen,
                  settingsDropdownOpen
                )}
                className="text-white/90 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all duration-300 font-medium text-sm flex items-center"
              >
                <Settings className="w-4 h-4 mr-2" />
                Paramètres
                <ChevronDown
                  className={`w-4 h-4 ml-2 text-white/70 transition-transform duration-300 ${
                    settingsDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {settingsDropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl z-[110] border border-gray-200/50 animate-in fade-in slide-in-from-top-2 duration-200 max-w-7xl mx-auto">
                  <div className="grid grid-cols-4 gap-4 p-6">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Lieux
                      </h3>
                      <Link
                        to="/parametres/zones"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                        onClick={() => setSettingsDropdownOpen(false)}
                      >
                        <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                        Zones
                      </Link>
                      <Link
                        to="/parametres/lieux"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                        onClick={() => setSettingsDropdownOpen(false)}
                      >
                        <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                        Lieux
                      </Link>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Ressources Humaines
                      </h3>
                      <Link
                        to="/parametres/personnels"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                        onClick={() => setSettingsDropdownOpen(false)}
                      >
                        <UsersIcon className="w-4 h-4 mr-2 text-green-500" />
                        Personnels
                      </Link>
                      <Link
                        to="/parametres/patrouilleurs"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                        onClick={() => setSettingsDropdownOpen(false)}
                      >
                        <Shield className="w-4 h-4 mr-2 text-blue-500" />
                        Patrouilleurs
                      </Link>
                      <Link
                        to="/parametres/equipe"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                        onClick={() => setSettingsDropdownOpen(false)}
                      >
                        <UsersIcon className="w-4 h-4 mr-2 text-purple-500" />
                        Équipe
                      </Link>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Matériel & Véhicules
                      </h3>
                      <Link
                        to="/parametres/cameras"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                        onClick={() => setSettingsDropdownOpen(false)}
                      >
                        <Camera className="w-4 h-4 mr-2 text-gray-500" />
                        Caméras
                      </Link>
                      <Link
                        to="/parametres/vehicule"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                        onClick={() => setSettingsDropdownOpen(false)}
                      >
                        <Car className="w-4 h-4 mr-2 text-blue-600" />
                        Véhicule
                      </Link>
                      <Link
                        to="/parametres/type-embarcations"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                        onClick={() => setSettingsDropdownOpen(false)}
                      >
                        <Ship className="w-4 h-4 mr-2 text-blue-500" />
                        Type d'embarcations
                      </Link>
                      <Link
                        to="/parametres/type-materiel"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                        onClick={() => setSettingsDropdownOpen(false)}
                      >
                        <Box className="w-4 h-4 mr-2 text-purple-600" />
                        Type de matériel
                      </Link>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        Données
                      </h3>
                      <Link
                        to="/parametres/resultats-alerte"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                        onClick={() => setSettingsDropdownOpen(false)}
                      >
                        <Flag className="w-4 h-4 mr-2 text-red-500" />
                        Résultats alerte
                      </Link>
                      <Link
                        to="/parametres/type-document"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                        onClick={() => setSettingsDropdownOpen(false)}
                      >
                        <FileText className="w-4 h-4 mr-2 text-blue-500" />
                        Type de document
                      </Link>
                      <Link
                        to="/parametres/motifs-saisie"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                        onClick={() => setSettingsDropdownOpen(false)}
                      >
                        <Lock className="w-4 h-4 mr-2 text-purple-500" />
                        Motifs de saisie
                      </Link>
                      <Link
                        to="/parametres/usagers"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                        onClick={() => setSettingsDropdownOpen(false)}
                      >
                        <UsersIcon className="w-4 h-4 mr-2 text-green-500" />
                        Usagers
                      </Link>
                      <Link
                        to="/parametres/type-cargaison"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                        onClick={() => setSettingsDropdownOpen(false)}
                      >
                        <Truck className="w-4 h-4 mr-2 text-blue-600" />
                        Type de cargaison
                      </Link>
                      <Link
                        to="/parametres/type-produits-exportation"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                        onClick={() => setSettingsDropdownOpen(false)}
                      >
                        <Package className="w-4 h-4 mr-2 text-green-600" />
                        Type produits exportation
                      </Link>
                      <Link
                        to="/parametres/type-provision-bord"
                        className="flex items-center px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                        onClick={() => setSettingsDropdownOpen(false)}
                      >
                        <Ship className="w-4 h-4 mr-2 text-blue-500" />
                        Type provision de bord
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="relative group">
            <button
              onClick={toggleDropdown(setUserDropdownOpen, userDropdownOpen)}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg transition-all duration-300"
            >
              <span className="text-white font-medium hidden sm:block max-w-28 truncate text-sm">
                {user?.email || "Utilisateur"}
              </span>
              <div className="relative">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User"
                    className="w-8 h-8 rounded-full border-2 border-white/30 group-hover:border-white/50 transition-all duration-300"
                    onError={(e) => {
                      e.target.src = defaultAvatar;
                    }}
                  />
                ) : (
                  <img
                    src={defaultAvatar}
                    alt="User"
                    className="w-8 h-8 rounded-full border-2 border-white/30 group-hover:border-white/50 transition-all duration-300"
                  />
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-white/70 transition-transform duration-300 ${
                  userDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-xl z-[110] border border-gray-200/50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-200/50">
                  <p className="text-xs text-gray-500">Connecté en tant que</p>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email || "Utilisateur"}
                  </p>
                </div>

                {userRole === "admin" && (
                  <Link
                    to="/users"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <Users className="w-4 h-4 mr-2 text-blue-500" />
                    Liste des utilisateurs
                  </Link>
                )}

                <button
                  onClick={handleOpenChangePasswordModal}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-sm"
                >
                  <Settings className="w-4 h-4 mr-2 text-gray-500" />
                  Mise à jour du compte
                </button>

                <div className="border-t border-gray-200/50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 text-sm"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={handleCloseChangePasswordModal}
      />
    </nav>
  );
}

export default Navbar;
