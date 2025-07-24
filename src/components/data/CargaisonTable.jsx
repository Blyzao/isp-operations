import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, where, orderBy, doc, deleteDoc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import {
  Package,
  Calendar,
  Clock,
  MapPin,
  Edit3,
  Trash2,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Users,
  Building,
  Weight,
  Hash,
  CheckCircle,
  XCircle,
} from "lucide-react";
import CargaisonFormModal from "./CargaisonFormModal";
import * as XLSX from 'xlsx';

function CargaisonTable() {
  const [cargaisons, setCargaisons] = useState([]);
  const [zones, setZones] = useState([]);
  const [lieux, setLieux] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [typesCargaison, setTypesCargaison] = useState([]);
  const [users, setUsers] = useState([]);
  const [personnels, setPersonnels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [filterZone, setFilterZone] = useState("all");
  const [filterValidation, setFilterValidation] = useState("all");
  const [user] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState(null);

  // États pour le modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCargaison, setEditingCargaison] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchUserProfile = async () => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [
        cargaisonsSnapshot,
        zonesSnapshot,
        lieuxSnapshot,
        equipesSnapshot,
        typesCargaisonSnapshot,
        usersSnapshot,
        personnelsSnapshot,
      ] = await Promise.all([
        getDocs(query(collection(db, "saisieCargaison"), orderBy("dateLong", "desc"))),
        getDocs(collection(db, "zones")),
        getDocs(collection(db, "lieux")),
        getDocs(collection(db, "equipes")),
        getDocs(collection(db, "typeCargaison")),
        getDocs(collection(db, "users")),
        getDocs(collection(db, "personnels")),
      ]);

      setCargaisons(cargaisonsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setZones(zonesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLieux(lieuxSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setEquipes(equipesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTypesCargaison(typesCargaisonSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setPersonnels(personnelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        await fetchUserProfile();
        await fetchAllData();
      }
    };
    loadData();
  }, [user]);

  const handleNew = () => {
    setEditingCargaison(null);
    setIsEditMode(false);
    setModalOpen(true);
  };

  const handleEdit = (cargaison) => {
    setEditingCargaison(cargaison.id);
    setIsEditMode(true);
    setModalOpen(true);
  };

  const handleDelete = async (cargaisonId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette cargaison ?")) {
      try {
        await deleteDoc(doc(db, "saisieCargaison", cargaisonId));
        await fetchAllData();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingCargaison(null);
    setIsEditMode(false);
    fetchAllData();
  };

  const truncateText = (text, maxLength = 20) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const getZoneName = (zoneId) => {
    const zone = zones.find(z => z.id === zoneId);
    return zone ? zone.nomZone : "N/A";
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

  const getLieuName = (lieuId) => {
    const lieu = lieux.find(l => l.id === lieuId);
    return lieu ? lieu.nomLieu : "N/A";
  };

  const getEquipeName = (equipeId) => {
    const equipe = equipes.find(e => e.id === equipeId);
    return equipe ? equipe.nomEquipe : "N/A";
  };

  const getTypeCargaisonName = (typeId) => {
    const type = typesCargaison.find(t => t.id === typeId);
    return type ? type.nomCargaison : "N/A";
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.nom : "N/A";
  };

  const getIntervenantsText = (intervenantIds) => {
    if (!intervenantIds || intervenantIds.length === 0) return "Aucun";
    return intervenantIds.map(id => {
      const personnel = personnels.find(p => p.id === id);
      return personnel ? personnel.nomPrenom : id;
    }).join(", ");
  };

  const exportToExcel = () => {
    const excelData = filteredCargaisons.map((cargaison, index) => {
      return {
        'N°': index + 1,
        'Date': cargaison.date || "",
        'Heure': cargaison.heure || "",
        'Vacation': cargaison.vacation || "",
        'Zone': getZoneName(cargaison.zone),
        'Lieu': getLieuName(cargaison.lieu),
        'Équipe': getEquipeName(cargaison.equipe),
        'Type Cargaison': getTypeCargaisonName(cargaison.typeCargaison),
        'Nombre Cargaison': cargaison.nombreCargaison || "",
        'Masse Cargaison (kg)': cargaison.masseCargaison || "",
        'Entreprise': cargaison.entreprise || "",
        'Intervenants': getIntervenantsText(cargaison.intervenants),
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    const colWidths = [
      { wch: 5 },  // N°
      { wch: 12 }, // Date
      { wch: 8 },  // Heure
      { wch: 10 }, // Vacation
      { wch: 15 }, // Zone
      { wch: 20 }, // Lieu
      { wch: 20 }, // Équipe
      { wch: 25 }, // Type Cargaison
      { wch: 15 }, // Nombre
      { wch: 15 }, // Masse
      { wch: 25 }, // Entreprise
      { wch: 40 }, // Intervenants
    ];
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, "Cargaisons");
    
    const fileName = `cargaisons_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const canEditOrDelete = (cargaison) => {
    if (userProfile?.profil === "admin" || userProfile?.profil === "superviseur") {
      return true;
    }
    if (userProfile?.profil === "user" && !cargaison.valider) {
      return true;
    }
    return false;
  };

  const filteredCargaisons = cargaisons.filter((cargaison) => {
    const matchesSearch = 
      getZoneName(cargaison.zone).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLieuName(cargaison.lieu).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTypeCargaisonName(cargaison.typeCargaison).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cargaison.entreprise && cargaison.entreprise.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesZone = filterZone === "all" || cargaison.zone === filterZone;
    const matchesValidation = filterValidation === "all" || 
      (filterValidation === "valide" && cargaison.valider) ||
      (filterValidation === "non_valide" && !cargaison.valider);

    let matchesDateRange = true;
    if (filterDateFrom || filterDateTo) {
      const cargaisonDateTime = new Date(cargaison.dateLong);
      if (filterDateFrom) {
        const fromDateTime = new Date(filterDateFrom);
        matchesDateRange = matchesDateRange && cargaisonDateTime >= fromDateTime;
      }
      if (filterDateTo) {
        const toDateTime = new Date(filterDateTo + "T23:59:59");
        matchesDateRange = matchesDateRange && cargaisonDateTime <= toDateTime;
      }
    }

    return matchesSearch && matchesZone && matchesValidation && matchesDateRange;
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
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Saisie Cargaison</h1>
                <p className="text-gray-600 text-sm">Gestion des cargaisons saisies</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={exportToExcel}
                className="flex items-center space-x-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-full transition-all duration-200 text-sm cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exporter Excel</span>
              </button>
              <button
                onClick={handleNew}
                className="flex items-center space-x-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-full transition-all duration-200 text-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle cargaison</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par zone, lieu, type de cargaison, entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Date du"
                title="Date du"
              />
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Date au"
                title="Date au"
              />
              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Toutes zones</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.nomZone}
                  </option>
                ))}
              </select>
              {(userProfile?.profil === "admin" || userProfile?.profil === "superviseur") && (
                <select
                  value={filterValidation}
                  onChange={(e) => setFilterValidation(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">Tous statuts</option>
                  <option value="valide">Validé</option>
                  <option value="non_valide">Non validé</option>
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredCargaisons.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                {searchTerm || filterZone !== "all" || filterDateFrom || filterDateTo
                  ? "Aucune cargaison trouvée"
                  : "Aucune cargaison"}
              </h3>
              <p className="text-gray-600 text-sm">
                {searchTerm || filterZone !== "all" || filterDateFrom || filterDateTo
                  ? "Modifiez vos critères de recherche"
                  : "Créez votre première saisie de cargaison"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Heure</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Vacation</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Zone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Lieu</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Type Cargaison</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Nombre</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Masse (kg)</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Entreprise</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Enregistré par</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date enregistrement</th>
                    {(userProfile?.profil === "admin" || userProfile?.profil === "superviseur") && (
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Validé</th>
                    )}
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredCargaisons.map((cargaison) => (
                    <tr key={cargaison.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {cargaison.date ? new Date(cargaison.date).toLocaleDateString("fr-FR", { day: '2-digit', month: '2-digit', year: 'numeric' }) : "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {cargaison.heure || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {cargaison.vacation ? (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            cargaison.vacation === 'jour' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {cargaison.vacation}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-600">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {(() => {
                          const zoneName = getZoneName(cargaison.zone);
                          return zoneName !== "N/A" ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              getZoneColor(zoneName)
                            }`}>
                              {truncateText(zoneName)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-600">N/A</span>
                          );
                        })()} 
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {truncateText(getLieuName(cargaison.lieu))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {truncateText(getTypeCargaisonName(cargaison.typeCargaison))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {cargaison.nombreCargaison || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {cargaison.masseCargaison || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {truncateText(cargaison.entreprise || "N/A")}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {truncateText(getUserName(cargaison.enregistrePar))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {cargaison.dateEnregistrement ? new Date(cargaison.dateEnregistrement).toLocaleDateString("fr-FR") + " " + new Date(cargaison.dateEnregistrement).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                        </div>
                      </td>
                      {(userProfile?.profil === "admin" || userProfile?.profil === "superviseur") && (
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {cargaison.valider ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <div className="flex space-x-1">
                          {canEditOrDelete(cargaison) && (
                            <>
                              <button
                                onClick={() => handleEdit(cargaison)}
                                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full transition-all duration-200 cursor-pointer"
                                title="Modifier"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(cargaison.id)}
                                className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-full transition-all duration-200 cursor-pointer"
                                title="Supprimer"
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

        {filteredCargaisons.length > 0 && (
          <div className="mt-4 text-center text-gray-600 text-sm">
            Affichage de {filteredCargaisons.length} cargaison{filteredCargaisons.length > 1 ? "s" : ""}
            {cargaisons.length !== filteredCargaisons.length &&
              ` sur ${cargaisons.length} au total`}
          </div>
        )}
      </div>

      <CargaisonFormModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        cargaisonId={editingCargaison}
        isEditMode={isEditMode}
      />
    </div>
  );
}

export default CargaisonTable;