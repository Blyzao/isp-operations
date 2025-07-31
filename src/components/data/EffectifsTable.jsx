import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, where, orderBy, doc, setDoc, getDoc, addDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Edit3,
  Trash2,
  Search,
  Plus,
  FileSpreadsheet,
  Copy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import EffectifsFormModal from "./EffectifsFormModal";

function EffectifsTable() {
  const [effectifs, setEffectifs] = useState([]);
  const [zones, setZones] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVacation, setFilterVacation] = useState("all");
  
  // Définir des dates par défaut : début du mois actuel et fin du jour actuel
  const getCurrentMonthStart = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  };

  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [filterDateFrom, setFilterDateFrom] = useState(getCurrentMonthStart());
  const [filterDateTo, setFilterDateTo] = useState(getCurrentDate());
  const [modalOpen, setModalOpen] = useState(false);
  const [editEffectifId, setEditEffectifId] = useState(null);
  const [user] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    }
  };

  const fetchZones = async () => {
    const querySnapshot = await getDocs(collection(db, "zones"));
    const zonesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nomZone: doc.data().nomZone || "N/A",
    }));
    setZones(zonesList.sort((a, b) => a.nomZone.localeCompare(b.nomZone)));
  };

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nom: doc.data().nom || "N/A",
    }));
    setUsers(usersList);
  };

  const fetchEffectifs = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "effectifs"),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      const effectifsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEffectifs(effectifsList);
    } catch (error) {
      console.error("Erreur lors de la récupération des effectifs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchUserProfile(),
        fetchZones(),
        fetchUsers(),
        fetchEffectifs(),
      ]);
    };
    loadData();
  }, [user]);

  const getZoneName = (zoneId) => {
    const zone = zones.find(z => z.id === zoneId);
    return zone ? zone.nomZone : zoneId;
  };

  const getZoneColor = (zoneName) => {
    switch (zoneName) {
      case "Zone 2":
        return "bg-blue-100 text-blue-800";
      case "Zone 3":
        return "bg-green-100 text-green-800";
      case "SOC":
        return "bg-purple-100 text-purple-800";
      case "Nautique":
        return "bg-cyan-100 text-cyan-800";
      case "IPC":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUserName = (userId) => {
    const userData = users.find(u => u.id === userId);
    return userData ? userData.nom : userId;
  };

  const handleEdit = (effectifId) => {
    setEditEffectifId(effectifId);
    setModalOpen(true);
  };

  const handleNewEffectif = () => {
    setEditEffectifId(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditEffectifId(null);
    fetchEffectifs();
  };

  const handleDelete = async (effectifId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet effectif ?")) {
      try {
        const effectifRef = doc(db, "effectifs", effectifId);
        await setDoc(effectifRef, { supprimer: true }, { merge: true });
        fetchEffectifs();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const handleDuplicate = async (effectif) => {
    if (window.confirm("Voulez-vous dupliquer cet effectif ?")) {
      try {
        // Créer un nouvel objet sans l'ID et avec une nouvelle dateEnregistrement
        const { id, dateEnregistrement, ...effectifData } = effectif;
        const newEffectif = {
          ...effectifData,
          dateEnregistrement: new Date().toISOString(),
        };
        
        // Ajouter à la collection
        await addDoc(collection(db, "effectifs"), newEffectif);
        fetchEffectifs();
        
        console.log("Effectif dupliqué avec succès");
      } catch (error) {
        console.error("Erreur lors de la duplication:", error);
      }
    }
  };

  const canEdit = (effectif) => {
    if (!userProfile) return false;
    const isAdmin = userProfile.profil === "admin";
    const isSuperviseur = userProfile.profil === "superviseur";
    const isUser = userProfile.profil === "user";
    
    if (isAdmin || isSuperviseur) return true;
    if (isUser && effectif.enregistrePar === user.uid) return true;
    return false;
  };

  const exportToExcel = () => {
    const exportData = filteredEffectifs.map((effectif, index) => {
      return {
        "N°": index + 1,
        "Date": effectif.date || "",
        "Vacation": effectif.vacation || "",
        "Zone": getZoneName(effectif.zone),
        "Effectif Pratique": effectif.effectifPatrique || 0,
        "Congé": effectif.conge || 0,
        "Arrêt Maladie": effectif.arretMaladie || 0,
        "Mise à Pied": effectif.MiseAPied || 0,
        "Permission": effectif.Permission || 0,
        "Absence à Justifier": effectif.AbsenceAJustifier || 0,
        "Enregistré par": getUserName(effectif.enregistrePar),
        "Date Enregistrement": effectif.dateEnregistrement ? new Date(effectif.dateEnregistrement).toLocaleString("fr-FR") : "N/A"
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Effectifs");
    
    const fileName = `effectifs_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const truncateText = (text, maxLength = 15) => {
    if (typeof text !== 'string') return text;
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const filteredEffectifs = effectifs.filter((effectif) => {
    const matchesSearch = searchTerm === "" || 
      getZoneName(effectif.zone).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVacation = filterVacation === "all" || effectif.vacation === filterVacation;

    let matchesDateRange = true;
    if (filterDateFrom || filterDateTo) {
      const docDate = effectif.date; // Format YYYY-MM-DD
      
      if (filterDateFrom && filterDateTo) {
        matchesDateRange = docDate >= filterDateFrom && docDate <= filterDateTo;
      } else if (filterDateFrom) {
        matchesDateRange = docDate >= filterDateFrom;
      } else if (filterDateTo) {
        matchesDateRange = docDate <= filterDateTo;
      }
    }

    return matchesSearch && matchesVacation && matchesDateRange;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-lg font-medium text-gray-600">Data/Effectifs</h1>
              <p className="text-gray-600 text-sm">Gestion des effectifs journaliers</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleNewEffectif}
                className="flex items-center space-x-1 bg-gradient-to-r from-blue-900 to-blue-700 text-white px-4 py-2 transition-all duration-200 text-sm cursor-pointer"
                style={{borderRadius: '50px'}}
                onMouseEnter={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.border = '1px solid #1e40af';
                  e.target.style.color = '#1e40af';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '';
                  e.target.style.border = '';
                  e.target.style.color = '';
                }}
              >
                <Plus className="w-4 h-4" />
                <span>Nouvel effectif</span>
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center space-x-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 transition-all duration-200 text-sm cursor-pointer"
                style={{borderRadius: '50px'}}
                onMouseEnter={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.border = '1px solid #16a34a';
                  e.target.style.color = '#16a34a';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '';
                  e.target.style.border = '';
                  e.target.style.color = '';
                }}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Recherche */}
            <div className="relative md:col-span-5">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par zone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>
            
            {/* Vacation */}
            <div className="md:col-span-1">
              <select
                value={filterVacation}
                onChange={(e) => setFilterVacation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Vacations</option>
                <option value="Jour">Jour</option>
                <option value="Nuit">Nuit</option>
              </select>
            </div>

            {/* Date début */}
            <div className="md:col-span-3">
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Date début"
                title="Date début"
              />
            </div>

            {/* Date fin */}
            <div className="md:col-span-3">
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Date fin"
                title="Date fin"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredEffectifs.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">Aucun effectif trouvé</h3>
              <p className="text-gray-600 text-sm">Modifiez vos critères de recherche</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Date</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Vacation</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Zone</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Eff. Pratique</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Congé</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Arrêt Mal.</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Mise à Pied</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Permission</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Abs. Just.</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Enreg. par</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Date Enreg.</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEffectifs.map((effectif) => (
                    <tr key={effectif.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-2 px-2 text-xs">{effectif.date ? effectif.date.split('-').reverse().join('-') : ''}</td>
                      <td className="py-2 px-2 text-xs">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          effectif.vacation === 'Jour' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {effectif.vacation}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-xs">
                        {(() => {
                          const zoneName = getZoneName(effectif.zone);
                          return (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              getZoneColor(zoneName)
                            }`}>
                              {truncateText(zoneName)}
                            </span>
                          );
                        })()} 
                      </td>
                      <td className="py-2 px-2 text-xs font-medium">{effectif.effectifPatrique || 0}</td>
                      <td className="py-2 px-2 text-xs">{effectif.conge || 0}</td>
                      <td className="py-2 px-2 text-xs">{effectif.arretMaladie || 0}</td>
                      <td className="py-2 px-2 text-xs">{effectif.MiseAPied || 0}</td>
                      <td className="py-2 px-2 text-xs">{effectif.Permission || 0}</td>
                      <td className="py-2 px-2 text-xs">{effectif.AbsenceAJustifier || 0}</td>
                      <td className="py-2 px-2 text-xs">{truncateText(getUserName(effectif.enregistrePar))}</td>
                      <td className="py-2 px-2 text-xs">{new Date(effectif.dateEnregistrement).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</td>
                      <td className="py-2 px-2 text-xs">
                        <div className="flex items-center space-x-1">
                          {canEdit(effectif) && (
                            <>
                              <button
                                onClick={() => handleEdit(effectif.id)}
                                className="p-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white transition-all duration-200 cursor-pointer"
                                style={{borderRadius: '50px'}}
                                onMouseEnter={(e) => {
                                  e.target.style.background = 'transparent';
                                  e.target.style.border = '1px solid #2563eb';
                                  e.target.style.color = '#2563eb';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = '';
                                  e.target.style.border = '';
                                  e.target.style.color = '';
                                }}
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDuplicate(effectif)}
                                className="p-1 bg-gradient-to-r from-green-600 to-green-700 text-white transition-all duration-200 cursor-pointer"
                                style={{borderRadius: '50px'}}
                                title="Dupliquer"
                                onMouseEnter={(e) => {
                                  e.target.style.background = 'transparent';
                                  e.target.style.border = '1px solid #16a34a';
                                  e.target.style.color = '#16a34a';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = '';
                                  e.target.style.border = '';
                                  e.target.style.color = '';
                                }}
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(effectif.id)}
                                className="p-1 bg-gradient-to-r from-red-600 to-red-700 text-white transition-all duration-200 cursor-pointer"
                                style={{borderRadius: '50px'}}
                                onMouseEnter={(e) => {
                                  e.target.style.background = 'transparent';
                                  e.target.style.border = '1px solid #dc2626';
                                  e.target.style.color = '#dc2626';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.background = '';
                                  e.target.style.border = '';
                                  e.target.style.color = '';
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredEffectifs.length > 0 && (
          <div className="mt-4 text-center text-gray-600 text-sm">
            Affichage de {filteredEffectifs.length} effectif{filteredEffectifs.length > 1 ? "s" : ""}
            {effectifs.length !== filteredEffectifs.length &&
              ` sur ${effectifs.length} au total`}
          </div>
        )}

        <EffectifsFormModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          effectifId={editEffectifId}
          isEditMode={!!editEffectifId}
        />
      </div>
    </div>
  );
}

export default EffectifsTable;