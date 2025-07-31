import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, where, orderBy, doc, deleteDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Search,
  Filter,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
} from "lucide-react";
import IndividusInterpellesFormModal from "./IndividusInterpellesFormModal";
import * as XLSX from 'xlsx';

function IndividusInterpellesTable() {
  const [individus, setIndividus] = useState([]);
  const [zones, setZones] = useState([]);
  const [lieux, setLieux] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [motifsSaisie, setMotifsSaisie] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterZone, setFilterZone] = useState("all");
  const [filterLieu, setFilterLieu] = useState("all");
  const [filterEquipe, setFilterEquipe] = useState("all");
  const [filterMotif, setFilterMotif] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndividu, setEditingIndividu] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [user] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState(null);

  const fetchUserProfile = async () => {
    if (user) {
      const userDoc = await doc(db, "users", user.uid);
      const userSnapshot = await getDocs(query(collection(db, "users"), where("__name__", "==", user.uid)));
      if (!userSnapshot.empty) {
        setUserProfile(userSnapshot.docs[0].data());
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

  const fetchLieux = async () => {
    const querySnapshot = await getDocs(collection(db, "lieux"));
    const lieuxList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nomLieu: doc.data().nomLieu || "N/A",
      zone: doc.data().zone || "",
    }));
    setLieux(lieuxList.sort((a, b) => a.nomLieu.localeCompare(b.nomLieu)));
  };

  const fetchEquipes = async () => {
    const querySnapshot = await getDocs(collection(db, "equipes"));
    const equipesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nomEquipe: doc.data().nomEquipe || "N/A",
      zone: doc.data().zone || "",
    }));
    setEquipes(equipesList.sort((a, b) => a.nomEquipe.localeCompare(b.nomEquipe)));
  };

  const fetchMotifsSaisie = async () => {
    const querySnapshot = await getDocs(collection(db, "motifSaisie"));
    const motifsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      motif: doc.data().motif || "N/A",
    }));
    setMotifsSaisie(motifsList.sort((a, b) => a.motif.localeCompare(b.motif)));
  };

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nom: doc.data().nom || "N/A",
    }));
    setUsers(usersList);
  };

  const fetchIndividus = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(
        query(collection(db, "individusInterpelles"), orderBy("dateLong", "desc"))
      );
      const individusList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIndividus(individusList);
    } catch (error) {
      console.error("Erreur lors de la récupération des individus:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        await fetchUserProfile();
        await Promise.all([
          fetchZones(),
          fetchLieux(),
          fetchEquipes(),
          fetchMotifsSaisie(),
          fetchUsers(),
        ]);
        await fetchIndividus();
      }
    };
    loadData();
  }, [user]);

  const canEdit = (individu) => {
    if (userProfile?.profil === "admin") return true;
    if (userProfile?.profil === "superviseur") return true;
    if (userProfile?.profil === "user" && individu.enregistrePar === user.uid) return true;
    return false;
  };

  const handleNewIndividu = () => {
    setEditingIndividu(null);
    setIsEditMode(false);
    setModalOpen(true);
  };

  const handleEdit = (individuId) => {
    setEditingIndividu(individuId);
    setIsEditMode(true);
    setModalOpen(true);
  };

  const handleDuplicate = (individu) => {
    setEditingIndividu(individu);
    setIsEditMode(false);
    setModalOpen(true);
  };

  const handleDelete = async (individuId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet individu interpellé ?")) {
      try {
        await deleteDoc(doc(db, "individusInterpelles", individuId));
        fetchIndividus();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingIndividu(null);
    setIsEditMode(false);
    fetchIndividus();
  };

  const getZoneName = (zoneId) => {
    const zone = zones.find(z => z.id === zoneId);
    return zone ? zone.nomZone : "N/A";
  };

  const getLieuName = (lieuId) => {
    const lieu = lieux.find(l => l.id === lieuId);
    return lieu ? lieu.nomLieu : "N/A";
  };

  const getEquipeName = (equipeId) => {
    const equipe = equipes.find(e => e.id === equipeId);
    return equipe ? equipe.nomEquipe : "N/A";
  };

  const getMotifName = (motifId) => {
    const motif = motifsSaisie.find(m => m.id === motifId);
    return motif ? motif.motif : "N/A";
  };

  const getUserName = (userId) => {
    const userItem = users.find(u => u.id === userId);
    return userItem ? userItem.nom : "N/A";
  };

  const exportToExcel = () => {
    const excelData = filteredIndividus.map(individu => ({
      'Date/Heure Alerte': individu.dateHeureAlerte ? new Date(individu.dateHeureAlerte).toLocaleString("fr-FR") : "N/A",
      'Vacation': individu.vacation || "N/A",
      'Zone': getZoneName(individu.zone),
      'Lieu': getLieuName(individu.lieu),
      'Équipe': getEquipeName(individu.equipe),
      'Motif': getMotifName(individu.motif),
      'Nom Individu': individu.nomIndividu || "N/A",
      'Primo Intervenant': individu.primoIntervenant || "N/A",
      'Date/Heure Intervention': individu.dateHeureIntervention ? new Date(individu.dateHeureIntervention).toLocaleString("fr-FR") : "N/A",
      'Validé': individu.valider ? "Oui" : "Non",
      'Enregistré par': getUserName(individu.enregistrePar),
      'Date Enregistrement': individu.dateEnregistrement ? new Date(individu.dateEnregistrement).toLocaleString("fr-FR") : "N/A"
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    const colWidths = [
      { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 25 },
      { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 20 }, { wch: 20 }
    ];
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, "Individus Interpelles");
    const fileName = `individus_interpelles_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const filteredIndividus = individus.filter((individu) => {
    const matchesSearch = 
      getZoneName(individu.zone).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLieuName(individu.lieu).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getEquipeName(individu.equipe).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getMotifName(individu.motif).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (individu.primoIntervenant && individu.primoIntervenant.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (individu.nomIndividu && individu.nomIndividu.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesZone = filterZone === "all" || individu.zone === filterZone;
    const matchesLieu = filterLieu === "all" || individu.lieu === filterLieu;
    const matchesEquipe = filterEquipe === "all" || individu.equipe === filterEquipe;
    const matchesMotif = filterMotif === "all" || individu.motif === filterMotif;

    const individuDate = individu.dateHeureAlerte || individu.dateHeureIntervention;
    const matchesDateFrom = !filterDateFrom || (individuDate && new Date(individuDate).toISOString().split('T')[0] >= filterDateFrom);
    const matchesDateTo = !filterDateTo || (individuDate && new Date(individuDate).toISOString().split('T')[0] <= filterDateTo);

    return matchesSearch && matchesZone && matchesLieu && matchesEquipe && matchesMotif && matchesDateFrom && matchesDateTo;
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
              <h1 className="text-lg font-medium text-gray-600">Data/Individus Interpellés</h1>
              <p className="text-gray-600 text-sm">Gestion des individus interpellés</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleNewIndividu}
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
                <span>Nouvel individu</span>
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
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par zone, lieu, équipe, motif, primo, nom individu..."
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
              <select
                value={filterLieu}
                onChange={(e) => setFilterLieu(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Tous lieux</option>
                {lieux
                  .filter(lieu => filterZone === "all" || lieu.zone === filterZone)
                  .map((lieu) => (
                    <option key={lieu.id} value={lieu.id}>
                      {lieu.nomLieu}
                    </option>
                  ))}
              </select>
              <select
                value={filterEquipe}
                onChange={(e) => setFilterEquipe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Toutes équipes</option>
                {equipes
                  .filter(equipe => filterZone === "all" || equipe.zone === filterZone)
                  .map((equipe) => (
                    <option key={equipe.id} value={equipe.id}>
                      {equipe.nomEquipe}
                    </option>
                  ))}
              </select>
              <select
                value={filterMotif}
                onChange={(e) => setFilterMotif(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Tous motifs</option>
                {motifsSaisie.map((motif) => (
                  <option key={motif.id} value={motif.id}>
                    {motif.motif}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredIndividus.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                {searchTerm || filterZone !== "all" || filterLieu !== "all" || filterEquipe !== "all" || filterMotif !== "all" || filterDateFrom || filterDateTo
                  ? "Aucun individu trouvé"
                  : "Aucun individu interpellé"}
              </h3>
              <p className="text-gray-600 text-sm">
                {searchTerm || filterZone !== "all" || filterLieu !== "all" || filterEquipe !== "all" || filterMotif !== "all" || filterDateFrom || filterDateTo
                  ? "Modifiez vos critères de recherche"
                  : "Créez votre premier enregistrement"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">Date/Heure Alerte</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">Vacation</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">Zone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">Lieu</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">Équipe</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">Motif</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">Nom Individu</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">Date/Heure Intervention</th>
                    {(userProfile?.profil === "admin" || userProfile?.profil === "superviseur") && (
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">Validé</th>
                    )}
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">Enregistré par</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">Date Enregistrement</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredIndividus.map((individu) => (
                    <tr key={individu.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-3 px-4 max-w-36">
                        <div className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis" title={individu.dateHeureAlerte ? new Date(individu.dateHeureAlerte).toLocaleString("fr-FR") : "N/A"}>
                          {individu.dateHeureAlerte ? new Date(individu.dateHeureAlerte).toLocaleString("fr-FR") : "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-20">
                        {individu.vacation ? (
                          <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                            individu.vacation === 'Jour' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {individu.vacation}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-600 whitespace-nowrap">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-24">
                        <div className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis" title={getZoneName(individu.zone)}>
                          {getZoneName(individu.zone)}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-32">
                        <div className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis" title={getLieuName(individu.lieu)}>
                          {getLieuName(individu.lieu)}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-24">
                        <div className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis" title={getEquipeName(individu.equipe)}>
                          {getEquipeName(individu.equipe)}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-32">
                        <div className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis" title={getMotifName(individu.motif)}>
                          {getMotifName(individu.motif)}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-32">
                        <div className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis" title={individu.nomIndividu || "N/A"}>
                          {individu.nomIndividu || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-36">
                        <div className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis" title={individu.dateHeureIntervention ? new Date(individu.dateHeureIntervention).toLocaleString("fr-FR") : "N/A"}>
                          {individu.dateHeureIntervention ? new Date(individu.dateHeureIntervention).toLocaleString("fr-FR") : "N/A"}
                        </div>
                      </td>
                      {(userProfile?.profil === "admin" || userProfile?.profil === "superviseur") && (
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {individu.valider ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        </td>
                      )}
                      <td className="py-3 px-4 max-w-32">
                        <div className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis" title={getUserName(individu.enregistrePar)}>
                          {getUserName(individu.enregistrePar)}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-36">
                        <div className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis" title={individu.dateEnregistrement ? new Date(individu.dateEnregistrement).toLocaleString("fr-FR") : "N/A"}>
                          {individu.dateEnregistrement ? new Date(individu.dateEnregistrement).toLocaleString("fr-FR") : "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1">
                          {canEdit(individu) && (
                            <>
                              <button
                                onClick={() => handleEdit(individu.id)}
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
                                onClick={() => handleDuplicate(individu)}
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
                                onClick={() => handleDelete(individu.id)}
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

        {filteredIndividus.length > 0 && (
          <div className="mt-4 text-center text-gray-600 text-sm">
            Affichage de {filteredIndividus.length} individu{filteredIndividus.length > 1 ? "s" : ""}
            {individus.length !== filteredIndividus.length &&
              ` sur ${individus.length} au total`}
          </div>
        )}
      </div>

      <IndividusInterpellesFormModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        individuId={editingIndividu}
        isEditMode={isEditMode}
      />
    </div>
  );
}

export default IndividusInterpellesTable;