import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, where, orderBy, doc, setDoc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import {
  FileText,
  Calendar,
  Clock,
  MapPin,
  Edit3,
  Trash2,
  Search,
  Filter,
  Plus,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  Building,
  User,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import DocumentsSaisisFormModal from "./DocumentsSaisisFormModal";

function DocumentsSaisisTable() {
  const [documentsSaisis, setDocumentsSaisis] = useState([]);
  const [zones, setZones] = useState([]);
  const [lieux, setLieux] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [usagers, setUsagers] = useState([]);
  const [motifsSaisie, setMotifsSaisie] = useState([]);
  const [typesDocument, setTypesDocument] = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [users, setUsers] = useState([]);
  const [personnels, setPersonnels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVacation, setFilterVacation] = useState("all");
  const [filterValider, setFilterValider] = useState("all");
  // Définir des dates par défaut : début du mois actuel et fin du jour actuel
  const getCurrentMonthStart = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01T00:00`;
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [filterDateFrom, setFilterDateFrom] = useState(getCurrentMonthStart());
  const [filterDateTo, setFilterDateTo] = useState(getCurrentDateTime());
  const [modalOpen, setModalOpen] = useState(false);
  const [editDocumentId, setEditDocumentId] = useState(null);
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
    setZones(zonesList);
  };

  const fetchLieux = async () => {
    const querySnapshot = await getDocs(collection(db, "lieux"));
    const lieuxList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nomLieu: doc.data().nomLieu || "N/A",
      zone: doc.data().zone || "",
    }));
    setLieux(lieuxList);
  };

  const fetchEquipes = async () => {
    const querySnapshot = await getDocs(collection(db, "equipes"));
    const equipesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nomEquipe: doc.data().nomEquipe || "N/A",
      zone: doc.data().zone || "",
    }));
    setEquipes(equipesList);
  };

  const fetchUsagers = async () => {
    const querySnapshot = await getDocs(collection(db, "usagers"));
    const usagersList = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      console.log("Données usager:", data);
      return {
        id: doc.id,
        nomUsagers: data.nomUsagers || data.nomUsager || data.nom || "N/A",
      };
    });
    setUsagers(usagersList);
  };

  const fetchMotifsSaisie = async () => {
    const querySnapshot = await getDocs(collection(db, "motifSaisie"));
    const motifsList = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      console.log("Données motif:", data);
      return {
        id: doc.id,
        nomMotif: data.nomMotif || data.nom || data.motif || "N/A",
      };
    });
    setMotifsSaisie(motifsList);
  };

  const fetchTypesDocument = async () => {
    const querySnapshot = await getDocs(collection(db, "typeDocument"));
    const typesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nomDocument: doc.data().nomDocument || "N/A",
    }));
    setTypesDocument(typesList);
  };

  const fetchEntreprises = async () => {
    const querySnapshot = await getDocs(collection(db, "entreprise"));
    const entreprisesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nomEntreprise: doc.data().nomEntreprise || "N/A",
      active: doc.data().active !== false,
    }));
    setEntreprises(entreprisesList.filter(e => e.active));
  };

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nom: doc.data().nom || "N/A",
    }));
    setUsers(usersList);
  };

  const fetchPersonnels = async () => {
    const querySnapshot = await getDocs(collection(db, "personnels"));
    const personnelsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nomPrenom: doc.data().nomPrenom || "N/A",
      matricule: doc.data().matricule || "N/A",
    }));
    setPersonnels(personnelsList);
  };

  const fetchDocumentsSaisis = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "documentsSaisis"),
        orderBy("dateLong", "desc")
      );
      const querySnapshot = await getDocs(q);
      const documentsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDocumentsSaisis(documentsList);
    } catch (error) {
      console.error("Erreur lors de la récupération des documents saisis:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchUserProfile(),
        fetchZones(),
        fetchLieux(),
        fetchEquipes(),
        fetchUsagers(),
        fetchMotifsSaisie(),
        fetchTypesDocument(),
        fetchEntreprises(),
        fetchUsers(),
        fetchPersonnels(),
        fetchDocumentsSaisis(),
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

  const getLieuName = (lieuId) => {
    const lieu = lieux.find(l => l.id === lieuId);
    return lieu ? lieu.nomLieu : lieuId;
  };

  const getUsagerName = (usagerId) => {
    const usager = usagers.find(u => u.id === usagerId);
    return usager ? usager.nomUsagers : usagerId;
  };

  const getTypeDocumentName = (typeId) => {
    const type = typesDocument.find(t => t.id === typeId);
    return type ? type.nomDocument : typeId;
  };

  const getMotifSaisieName = (motifId) => {
    const motif = motifsSaisie.find(m => m.id === motifId);
    return motif ? motif.nomMotif : motifId;
  };

  const getUserName = (userId) => {
    const userData = users.find(u => u.id === userId);
    return userData ? userData.nom : userId;
  };

  const handleEdit = (documentId) => {
    setEditDocumentId(documentId);
    setModalOpen(true);
  };

  const handleNewDocument = () => {
    setEditDocumentId(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditDocumentId(null);
    fetchDocumentsSaisis();
  };

  const handleToggleValider = async (documentId, currentValue) => {
    try {
      const documentRef = doc(db, "documentsSaisis", documentId);
      await setDoc(documentRef, { valider: !currentValue }, { merge: true });
      fetchDocumentsSaisis();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        const documentRef = doc(db, "documentsSaisis", documentId);
        await setDoc(documentRef, { supprimer: true }, { merge: true });
        fetchDocumentsSaisis();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const canEdit = (document) => {
    if (!userProfile) return false;
    const isAdmin = userProfile.profil === "admin";
    const isSuperviseur = userProfile.profil === "superviseur";
    const isUser = userProfile.profil === "user";
    
    if (isAdmin || isSuperviseur) return true;
    if (isUser && !document.valider) return true;
    return false;
  };

  const exportToExcel = () => {
    const exportData = filteredDocuments.map((document, index) => {
      const intervenantsText = document.intervenants && document.intervenants.length > 0
        ? document.intervenants.map(id => {
            const personnel = personnels.find(p => p.id === id);
            return personnel ? `${personnel.nomPrenom} (${personnel.matricule})` : id;
          }).join('; ')
        : "Aucun intervenant";

      const equipeName = equipes.find(e => e.id === document.equipe)?.nomEquipe || document.equipe;
      const motifName = motifsSaisie.find(m => m.id === document.motifSaisie)?.nomMotif || document.motifSaisie;
      const typeName = typesDocument.find(t => t.id === document.typeDocument)?.nomDocument || document.typeDocument;
      const usagerName = usagers.find(u => u.id === document.TypeUsager)?.nomUsagers || document.TypeUsager;

      return {
        "N°": index + 1,
        "Date": document.date || "",
        "Heure": document.heure || "",
        "Référence": document.reference || "",
        "Vacation": document.vacation || "",
        "Zone": getZoneName(document.zone),
        "Lieu": getLieuName(document.lieu),
        "Équipe": equipeName,
        "Usager": usagerName,
        "Type Document": typeName,
        "Motif Saisie": motifName,
        "Entreprise": document.Entreprise || "",
        "Nom Usager": document.nomUsager || "",
        "Intervenants": intervenantsText,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Documents Saisis");
    
    const fileName = `documents_saisis_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const truncateText = (text, maxLength = 15) => {
    if (typeof text !== 'string') return text;
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const filteredDocuments = documentsSaisis.filter((document) => {
    const matchesSearch = searchTerm === "" || [
      // Nom usager
      document.nomUsager,
      // Entreprise
      document.Entreprise,
      // Type document (nom)
      getTypeDocumentName(document.typeDocument),
      // Zone (nom)
      getZoneName(document.zone),
      // Lieu (nom)
      getLieuName(document.lieu),
      // Motif saisie (nom)
      getMotifSaisieName(document.motifSaisie),
      // Type usager (nom)
      getUsagerName(document.TypeUsager),
      // Équipe (nom)
      equipes.find(e => e.id === document.equipe)?.nomEquipe
    ].some(field => 
      field && field.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesVacation = filterVacation === "all" || document.vacation === filterVacation;
    
    const matchesValider = 
      filterValider === "all" || 
      (filterValider === "valide" && document.valider === true) ||
      (filterValider === "non_valide" && document.valider !== true);

    let matchesDateRange = true;
    if (filterDateFrom || filterDateTo) {
      const docDate = new Date(document.dateLong);
      
      if (filterDateFrom && filterDateTo) {
        const fromDate = new Date(filterDateFrom);
        const toDate = new Date(filterDateTo);
        matchesDateRange = docDate >= fromDate && docDate <= toDate;
      } else if (filterDateFrom) {
        const fromDate = new Date(filterDateFrom);
        matchesDateRange = docDate >= fromDate;
      } else if (filterDateTo) {
        const toDate = new Date(filterDateTo);
        matchesDateRange = docDate <= toDate;
      }
    }

    return matchesSearch && matchesVacation && matchesValider && matchesDateRange;
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
              <div className="p-2 bg-gradient-to-r from-blue-900 to-blue-700 rounded-full">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Documents Saisis</h1>
                <p className="text-gray-600 text-sm">Gestion des titres d'accès saisis</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleNewDocument}
                className="flex items-center space-x-1 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white px-4 py-2 rounded-full transition-all duration-200 text-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau document</span>
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full transition-all duration-200 text-sm cursor-pointer"
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
                placeholder="Nom usager, entreprise, type document, zone, lieu, motif, usager, équipe..."
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
                <option value="jour">Jour</option>
                <option value="nuit">Nuit</option>
              </select>
            </div>

            {/* Validation (si admin/superviseur) */}
            {(userProfile?.profil === "admin" || userProfile?.profil === "superviseur") && (
              <div className="md:col-span-1">
                <select
                  value={filterValider}
                  onChange={(e) => setFilterValider(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">Statuts</option>
                  <option value="valide">Validés</option>
                  <option value="non_valide">Non validés</option>
                </select>
              </div>
            )}

            {/* Date/Heure début */}
            <div className={`${(userProfile?.profil === "admin" || userProfile?.profil === "superviseur") ? "md:col-span-2" : "md:col-span-3"}`}>
              <input
                type="datetime-local"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Date/heure début"
              />
            </div>

            {/* Date/Heure fin */}
            <div className={`${(userProfile?.profil === "admin" || userProfile?.profil === "superviseur") ? "md:col-span-2" : "md:col-span-3"}`}>
              <input
                type="datetime-local"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Date/heure fin"
              />
            </div>
            
            {/* Colonne vide pour équilibrer quand pas d'admin/superviseur */}
            {!(userProfile?.profil === "admin" || userProfile?.profil === "superviseur") && (
              <div className="md:col-span-1"></div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">Aucun document trouvé</h3>
              <p className="text-gray-600 text-sm">Modifiez vos critères de recherche</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Date</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Heure</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Référence</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Vacation</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Zone</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Lieu</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Usager</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Type Doc.</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Motif</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Entreprise</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Nom Usager</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Enregistré par</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Date Enreg.</th>
                    {(userProfile?.profil === "admin" || userProfile?.profil === "superviseur") && (
                      <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Validé</th>
                    )}
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDocuments.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-2 px-2 text-xs">{document.date ? document.date.split('-').reverse().join('-') : ''}</td>
                      <td className="py-2 px-2 text-xs">{document.heure}</td>
                      <td className="py-2 px-2 text-xs font-medium">{truncateText(document.reference)}</td>
                      <td className="py-2 px-2 text-xs">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          document.vacation === 'jour' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {document.vacation}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-xs">
                        {(() => {
                          const zoneName = getZoneName(document.zone);
                          return (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              getZoneColor(zoneName)
                            }`}>
                              {truncateText(zoneName)}
                            </span>
                          );
                        })()} 
                      </td>
                      <td className="py-2 px-2 text-xs">{truncateText(getLieuName(document.lieu))}</td>
                      <td className="py-2 px-2 text-xs">{truncateText(getUsagerName(document.TypeUsager))}</td>
                      <td className="py-2 px-2 text-xs">{truncateText(getTypeDocumentName(document.typeDocument))}</td>
                      <td className="py-2 px-2 text-xs">{truncateText(getMotifSaisieName(document.motifSaisie))}</td>
                      <td className="py-2 px-2 text-xs">{truncateText(document.Entreprise)}</td>
                      <td className="py-2 px-2 text-xs">{truncateText(document.nomUsager)}</td>
                      <td className="py-2 px-2 text-xs">{truncateText(getUserName(document.enregistrePar))}</td>
                      <td className="py-2 px-2 text-xs">{new Date(document.dateEnregistrement).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</td>
                      {(userProfile?.profil === "admin" || userProfile?.profil === "superviseur") && (
                        <td className="py-2 px-2 text-xs">
                          <button
                            onClick={() => handleToggleValider(document.id, document.valider)}
                            className="flex items-center cursor-pointer"
                          >
                            {document.valider ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                          </button>
                        </td>
                      )}
                      <td className="py-2 px-2 text-xs">
                        <div className="flex items-center space-x-1">
                          {canEdit(document) && (
                            <>
                              <button
                                onClick={() => handleEdit(document.id)}
                                className="p-1 hover:bg-blue-100 text-blue-600 rounded cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(document.id)}
                                className="p-1 hover:bg-red-100 text-red-600 rounded cursor-pointer"
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

        {filteredDocuments.length > 0 && (
          <div className="mt-4 text-center text-gray-600 text-sm">
            Affichage de {filteredDocuments.length} document{filteredDocuments.length > 1 ? "s" : ""}
            {documentsSaisis.length !== filteredDocuments.length &&
              ` sur ${documentsSaisis.length} au total`}
          </div>
        )}

        <DocumentsSaisisFormModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          documentId={editDocumentId}
          isEditMode={!!editDocumentId}
        />
      </div>
    </div>
  );
}

export default DocumentsSaisisTable;