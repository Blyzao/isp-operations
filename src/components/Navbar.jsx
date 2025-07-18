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

  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);

  const handleOpenChangePasswordModal = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleCloseChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
  };

  if (!user) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 shadow-lg border-b border-blue-500/30 h-16 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center h-full">
          <Link
            to="/"
            className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-2xl font-black tracking-tight group-hover:text-blue-100 transition-colors duration-300">
              Nexion
            </span>
          </Link>
          <div className="w-10 h-10 bg-white/10 rounded-full border border-white/20"></div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 shadow-lg border-b border-blue-500/30 h-16 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between h-full">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg group-hover:shadow-xl group-hover:bg-white/25 transition-all duration-300">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-2xl font-black tracking-tight group-hover:text-blue-100 transition-colors duration-300">
              Nexion
            </span>
          </Link>

          {/* Menu principal centré */}
          <div className="flex items-center justify-center space-x-2 hidden md:flex absolute left-1/2 transform -translate-x-1/2">
            {!isRoleLoaded && (
              <div className="flex items-center space-x-2">
                <div className="animate-pulse bg-white/20 h-10 w-20 rounded-xl"></div>
                <div className="animate-pulse bg-white/20 h-10 w-24 rounded-xl"></div>
                <div className="animate-pulse bg-white/20 h-10 w-20 rounded-xl"></div>
              </div>
            )}

            {isRoleLoaded && (
              <>
                {/* Données Opérations */}
                <div className="relative group">
                  <button className="text-white/90 hover:text-white hover:bg-white/15 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm flex items-center backdrop-blur-sm border border-transparent hover:border-white/20 shadow-sm hover:shadow-md h-10">
                    <Database className="w-4 h-4 mr-2" />
                    Données
                    <ChevronDown className="w-4 h-4 ml-2 text-white/70 transition-transform duration-300 group-hover:rotate-180" />
                  </button>
                  <div className="absolute left-1/2 transform -translate-x-1/2 mt-1 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl z-[110] border border-blue-200/60 animate-in fade-in slide-in-from-top-5 duration-300 w-[900px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5rem)] overflow-y-auto hidden group-hover:block before:content-[''] before:absolute before:w-full before:h-3 before:-top-3 before:bg-transparent">
                    <div className="p-1">
                      <div className="grid grid-cols-2 gap-6 p-6">
                        <div className="space-y-1">
                          <div className="flex items-center mb-3 pb-2 border-b border-gray-100">
                            <Shield className="w-4 h-4 mr-2 text-blue-600" />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                              Sécurité
                            </h3>
                          </div>
                          <Link
                            to="/operations/incidents"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-xl group backdrop-blur-sm"
                          >
                            <AlertCircle className="w-4 h-4 mr-3 text-red-500 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">Incidents</span>
                          </Link>
                          <Link
                            to="/operations/individus-interpelles"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-xl group backdrop-blur-sm"
                          >
                            <UserX className="w-4 h-4 mr-3 text-orange-500 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">
                              Individus interpellés
                            </span>
                          </Link>
                          <Link
                            to="/operations/titres-acces-saisis"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-xl group backdrop-blur-sm"
                          >
                            <Lock className="w-4 h-4 mr-3 text-purple-500 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">
                              Titres d'accès saisis
                            </span>
                          </Link>
                          <Link
                            to="/operations/cargaisons-saisies"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-xl group backdrop-blur-sm"
                          >
                            <Truck className="w-4 h-4 mr-3 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">
                              Cargaisons saisies
                            </span>
                          </Link>
                          <Link
                            to="/operations/alertes"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-xl group backdrop-blur-sm"
                          >
                            <Siren className="w-4 h-4 mr-3 text-red-600 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">Alertes</span>
                          </Link>
                          <Link
                            to="/operations/controle-acces"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-xl group backdrop-blur-sm"
                          >
                            <CheckSquare className="w-4 h-4 mr-3 text-green-500 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">
                              Contrôle d'accès
                            </span>
                          </Link>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center mb-3 pb-2 border-b border-gray-100">
                            <Activity className="w-4 h-4 mr-2 text-green-600" />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                              Ressources
                            </h3>
                          </div>
                          <Link
                            to="/operations/effectifs"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-xl group backdrop-blur-sm"
                          >
                            <UsersIcon className="w-4 h-4 mr-3 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">Effectifs</span>
                          </Link>
                          <Link
                            to="/operations/kilometrages"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-xl group backdrop-blur-sm"
                          >
                            <Car className="w-4 h-4 mr-3 text-gray-500 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">Kilométrages</span>
                          </Link>
                          <Link
                            to="/operations/produits-exportation"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-xl group backdrop-blur-sm"
                          >
                            <Package className="w-4 h-4 mr-3 text-green-600 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">
                              Produits à l'exportation
                            </span>
                          </Link>
                          <Link
                            to="/operations/materiels"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-xl group backdrop-blur-sm"
                          >
                            <Box className="w-4 h-4 mr-3 text-purple-600 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">Matériels</span>
                          </Link>
                          <Link
                            to="/operations/provision-bord"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-xl group backdrop-blur-sm"
                          >
                            <Ship className="w-4 h-4 mr-3 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">
                              Provision de bord
                            </span>
                          </Link>
                          <Link
                            to="/operations/evenements"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-xl group backdrop-blur-sm"
                          >
                            <Calendar className="w-4 h-4 mr-3 text-orange-500 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">Événements</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="relative group">
                  <button className="text-white/90 hover:text-white hover:bg-white/15 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm flex items-center backdrop-blur-sm border border-transparent hover:border-white/20 shadow-sm hover:shadow-md h-10">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Statistiques
                    <ChevronDown className="w-4 h-4 ml-2 text-white/70 transition-transform duration-300 group-hover:rotate-180" />
                  </button>
                  <div className="absolute left-1/2 transform -translate-x-1/2 mt-1 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl z-[110] border border-blue-200/60 animate-in fade-in slide-in-from-top-5 duration-300 w-[500px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5rem)] overflow-y-auto hidden group-hover:block before:content-[''] before:absolute before:w-full before:h-3 before:-top-3 before:bg-transparent">
                    <div className="p-1">
                      <div className="p-6">
                        <div className="flex items-center mb-4 pb-3 border-b border-gray-100">
                          <BarChart className="w-5 h-5 mr-3 text-blue-600" />
                          <h3 className="text-lg font-bold text-gray-900">
                            Tableaux de bord
                          </h3>
                        </div>
                        <div className="space-y-1">
                          <Link
                            to="/statistiques/incidents"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-xl group backdrop-blur-sm"
                          >
                            <AlertCircle className="w-4 h-4 mr-3 text-red-500 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">Incidents</span>
                          </Link>
                          <Link
                            to="/statistiques/individus-interpelles"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-xl group backdrop-blur-sm"
                          >
                            <UserX className="w-4 h-4 mr-3 text-orange-500 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">
                              Individus interpellés
                            </span>
                          </Link>
                          <Link
                            to="/statistiques/alertes"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-xl group backdrop-blur-sm"
                          >
                            <Siren className="w-4 h-4 mr-3 text-red-600 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">Alertes</span>
                          </Link>
                          <Link
                            to="/statistiques/titres-acces-saisis"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-xl group backdrop-blur-sm"
                          >
                            <Lock className="w-4 h-4 mr-3 text-purple-500 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">
                              Titres d'accès saisis
                            </span>
                          </Link>
                          <Link
                            to="/statistiques/effectifs"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-xl group backdrop-blur-sm"
                          >
                            <UsersIcon className="w-4 h-4 mr-3 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">Effectifs</span>
                          </Link>
                          <Link
                            to="/statistiques/kilometrage"
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-xl group backdrop-blur-sm"
                          >
                            <Car className="w-4 h-4 mr-3 text-gray-500 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">Kilométrage</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paramètres (admin seulement) */}
                {userRole === "admin" && (
                  <div className="relative group">
                    <button className="text-white/90 hover:text-white hover:bg-white/15 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm flex items-center backdrop-blur-sm border border-transparent hover:border-white/20 shadow-sm hover:shadow-md h-10">
                      <Cog className="w-4 h-4 mr-2" />
                      Paramètres
                      <ChevronDown className="w-4 h-4 ml-2 text-white/70 transition-transform duration-300 group-hover:rotate-180" />
                    </button>
                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-1 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl z-[110] border border-blue-200/60 animate-in fade-in slide-in-from-top-5 duration-300 w-[1200px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5rem)] overflow-y-auto hidden group-hover:block before:content-[''] before:absolute before:w-full before:h-3 before:-top-3 before:bg-transparent">
                      <div className="p-1">
                        <div className="grid grid-cols-4 gap-6 p-6">
                          <div className="space-y-1">
                            <div className="flex items-center mb-3 pb-2 border-b border-gray-100">
                              <MapPin className="w-4 h-4 mr-2 text-green-600" />
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                Lieux
                              </h3>
                            </div>
                            <Link
                              to="/parametres/zones"
                              className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-lg group backdrop-blur-sm"
                            >
                              <MapPin className="w-4 h-4 mr-3 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                              <span className="font-medium">Zones</span>
                            </Link>
                            <Link
                              to="/parametres/lieux"
                              className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-lg group backdrop-blur-sm"
                            >
                              <MapPin className="w-4 h-4 mr-3 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
                              <span className="font-medium">Lieux</span>
                            </Link>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center mb-3 pb-2 border-b border-gray-100">
                              <UsersIcon className="w-4 h-4 mr-2 text-purple-600" />
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                RH
                              </h3>
                            </div>
                            <Link
                              to="/parametres/personnels"
                              className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-lg group backdrop-blur-sm"
                            >
                              <UsersIcon className="w-4 h-4 mr-3 text-green-500 group-hover:scale-110 transition-transform duration-200" />
                              <span className="font-medium">Personnels</span>
                            </Link>
                            <Link
                              to="/parametres/patrouilleurs"
                              className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-lg group backdrop-blur-sm"
                            >
                              <Shield className="w-4 h-4 mr-3 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                              <span className="font-medium">Patrouilleurs</span>
                            </Link>
                            <Link
                              to="/parametres/equipe"
                              className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-lg group backdrop-blur-sm"
                            >
                              <UsersIcon className="w-4 h-4 mr-3 text-purple-500 group-hover:scale-110 transition-transform duration-200" />
                              <span className="font-medium">Équipe</span>
                            </Link>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center mb-3 pb-2 border-b border-gray-100">
                              <Car className="w-4 h-4 mr-2 text-blue-600" />
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                Matériels
                              </h3>
                            </div>
                            <Link
                              to="/parametres/cameras"
                              className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-lg group backdrop-blur-sm"
                            >
                              <Camera className="w-4 h-4 mr-3 text-gray-500 group-hover:scale-110 transition-transform duration-200" />
                              <span className="font-medium">Caméras</span>
                            </Link>
                            <Link
                              to="/parametres/vehicule"
                              className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-lg group backdrop-blur-sm"
                            >
                              <Car className="w-4 h-4 mr-3 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
                              <span className="font-medium">Véhicules</span>
                            </Link>
                            <Link
                              to="/parametres/type-embarcations"
                              className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-lg group backdrop-blur-sm"
                            >
                              <Ship className="w-4 h-4 mr-3 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                              <span className="font-medium">Embarcations</span>
                            </Link>
                            <Link
                              to="/parametres/type-materiel"
                              className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-lg group backdrop-blur-sm"
                            >
                              <Box className="w-4 h-4 mr-3 text-purple-600 group-hover:scale-110 transition-transform duration-200" />
                              <span className="font-medium">Type matériel</span>
                            </Link>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center mb-3 pb-2 border-b border-gray-100">
                              <FileText className="w-4 h-4 mr-2 text-orange-600" />
                              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                Données
                              </h3>
                            </div>
                            <Link
                              to="/parametres/resultats-alerte"
                              className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-lg group backdrop-blur-sm"
                            >
                              <Flag className="w-4 h-4 mr-3 text-red-500 group-hover:scale-110 transition-transform duration-200" />
                              <span className="font-medium">
                                Résultats alerte
                              </span>
                            </Link>
                            <Link
                              to="/parametres/type-document"
                              className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-lg group backdrop-blur-sm"
                            >
                              <FileText className="w-4 h-4 mr-3 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                              <span className="font-medium">Type document</span>
                            </Link>
                            <Link
                              to="/parametres/motifs-saisie"
                              className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-lg group backdrop-blur-sm"
                            >
                              <Lock className="w-4 h-4 mr-3 text-purple-500 group-hover:scale-110 transition-transform duration-200" />
                              <span className="font-medium">Motifs saisie</span>
                            </Link>
                            <Link
                              to="/parametres/type-incident"
                              className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-lg group backdrop-blur-sm"
                            >
                              <Lock className="w-4 h-4 mr-3 text-green-500 group-hover:scale-110 transition-transform duration-200" />
                              <span className="font-medium">
                                Type d'incident
                              </span>
                            </Link>
                            <Link
                              to="/parametres/type-cargaison"
                              className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-lg group backdrop-blur-sm"
                            >
                              <Truck className="w-4 h-4 mr-3 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
                              <span className="font-medium">
                                Type cargaison
                              </span>
                            </Link>
                            <Link
                              to="/parametres/type-produits-exportation"
                              className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-lg group backdrop-blur-sm"
                            >
                              <Package className="w-4 h-4 mr-3 text-green-600 group-hover:scale-110 transition-transform duration-200" />
                              <span className="font-medium">
                                Produits export
                              </span>
                            </Link>
                            <Link
                              to="/parametres/type-provision-bord"
                              className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm rounded-lg group backdrop-blur-sm"
                            >
                              <Ship className="w-4 h-4 mr-3 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                              <span className="font-medium">
                                Provision bord
                              </span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Menu utilisateur */}
          <div className="relative group">
            <button className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30 shadow-sm hover:shadow-md h-10">
              <span className="text-white font-medium hidden sm:block max-w-32 truncate text-sm">
                {user?.email || "Utilisateur"}
              </span>
              <div className="relative">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User"
                    className="w-8 h-8 rounded-full border-2 border-white/30 group-hover:border-white/50 transition-all duration-300 shadow-sm"
                    onError={(e) => {
                      e.target.src = defaultAvatar;
                    }}
                  />
                ) : (
                  <img
                    src={defaultAvatar}
                    alt="User"
                    className="w-8 h-8 rounded-full border-2 border-white/30 group-hover:border-white/50 transition-all duration-300 shadow-sm"
                  />
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
              </div>
              <ChevronDown className="w-4 h-4 text-white/70 transition-transform duration-300 group-hover:rotate-180" />
            </button>
            <div className="absolute right-0 mt-1 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl z-[110] border border-blue-200/60 animate-in fade-in slide-in-from-top-5 duration-300 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-5rem)] overflow-y-auto hidden group-hover:block before:content-[''] before:absolute before:w-full before:h-3 before:-top-3 before:bg-transparent">
              <div className="p-1">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Connecté en tant que
                  </p>
                  <p className="text-sm font-bold text-gray-900 truncate mt-1 flex items-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2 inline-block"></span>
                    {user?.email || "Utilisateur"}
                  </p>
                </div>
                <div className="py-2">
                  {userRole === "admin" && (
                    <Link
                      to="/users"
                      className="flex items-center px-5 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm group rounded-xl mx-2 backdrop-blur-sm"
                    >
                      <Users className="w-4 h-4 mr-3 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                      <span className="font-medium">
                        Liste des utilisateurs
                      </span>
                    </Link>
                  )}
                  <button
                    onClick={handleOpenChangePasswordModal}
                    className="flex items-center w-full px-5 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-blue-100/80 hover:text-blue-700 transition-all duration-200 text-sm group rounded-xl mx-2 backdrop-blur-sm"
                  >
                    <Settings className="w-4 h-4 mr-3 text-gray-500 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">Mise à jour du compte</span>
                  </button>
                </div>
                <div className="border-t border-gray-100 py-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-5 py-3 text-red-600 hover:bg-gradient-to-r hover:from-red-50/80 hover:to-red-100/80 hover:text-red-700 transition-all duration-200 text-sm group rounded-xl mx-2 backdrop-blur-sm"
                  >
                    <LogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">Déconnexion</span>
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
    </>
  );
}

export default Navbar;
