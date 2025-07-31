import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, query, where, orderBy, doc, setDoc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import {
  AlertTriangle,
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
  Printer,
  FileSpreadsheet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateIncidentPDF } from "../../utils/pdfGenerator";
import * as XLSX from 'xlsx';

function IncidentsTable() {
  const [incidents, setIncidents] = useState([]);
  const [zones, setZones] = useState([]);
  const [lieux, setLieux] = useState([]);
  const [typeIncidents, setTypeIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [personnels, setPersonnels] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategorie, setFilterCategorie] = useState("all");
  const [filterNiveau, setFilterNiveau] = useState("all");
  const [filterMois, setFilterMois] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [user] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();

  const getCategorieColor = (categorie) => {
    switch (categorie) {
      case "Sécurité":
        return "bg-red-100 text-red-800";
      case "Sûreté":
        return "bg-blue-100 text-blue-800";
      case "Informations":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
    }));
    setLieux(lieuxList);
  };

  const fetchTypeIncidents = async () => {
    const querySnapshot = await getDocs(collection(db, "typeIncident"));
    const typeIncidentsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nomIncident: doc.data().nomIncident || "N/A",
    }));
    setTypeIncidents(typeIncidentsList);
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

  const fetchCameras = async () => {
    const querySnapshot = await getDocs(collection(db, "cameras"));
    const camerasList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      idCamera: doc.data().idCamera || "N/A",
    }));
    setCameras(camerasList);
  };

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      let q;
      
      if (userProfile?.profil === "admin") {
        // Admin voit tous les incidents
        q = query(collection(db, "incidents"), orderBy("dateLong", "desc"));
      } else {
        // User et superviseur voient seulement les incidents non supprimés
        q = query(
          collection(db, "incidents"),
          where("supprimer", "==", false),
          orderBy("dateLong", "desc")
        );
      }

      const querySnapshot = await getDocs(q);
      const incidentsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIncidents(incidentsList);
    } catch (error) {
      console.error("Erreur lors de la récupération des incidents:", error);
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
          fetchTypeIncidents(),
          fetchUsers(),
          fetchPersonnels(),
          fetchCameras()
        ]);
      }
    };
    loadData();
  }, [user]);

  useEffect(() => {
    if (userProfile && users.length > 0) {
      fetchIncidents();
    }
  }, [userProfile, users.length]);

  const handleToggleSupprimer = async (incidentId, currentValue) => {
    try {
      await setDoc(
        doc(db, "incidents", incidentId),
        { supprimer: !currentValue },
        { merge: true }
      );
      fetchIncidents();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const handleEdit = (incidentId) => {
    navigate(`/operations/incidents/edit/${incidentId}`);
  };

  const handleView = (incidentId) => {
    navigate(`/operations/incidents/view/${incidentId}`);
  };

  const handleNew = () => {
    navigate("/operations/incidents/new");
  };

  const handlePrint = async (incident) => {
    try {
      console.log("🖨️ Génération PDF pour incident:", incident);
      console.log("📸 Images dans l'incident:", incident.images);
      await generateIncidentPDF(incident);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
    }
  };

  const exportToExcel = () => {
    const excelData = filteredIncidents.map(incident => {
      // Récupérer les données enrichies
      const zoneNom = zones.find(z => z.id === incident.zone)?.nomZone || "N/A";
      const lieuNom = lieux.find(l => l.id === incident.lieu)?.nomLieu || "N/A";
      const typeIncidentNom = typeIncidents.find(t => t.id === incident.typeIncident)?.nomIncident || "N/A";
      const userNom = users.find(u => u.id === incident.user)?.nom || "N/A";
      
      // Construire la liste des intervenants ISP avec noms et matricules
      const intervenantsISP = incident.intervenantsISP && incident.intervenantsISP.length > 0 
        ? incident.intervenantsISP.map(id => {
            const personnel = personnels.find(p => p.id === id);
            return personnel ? `${personnel.nomPrenom} (${personnel.matricule})` : id;
          }).join("; ")
        : "Aucun intervenant ISP";
      
      // Construire la liste des caméras avec idCamera
      const camerasText = incident.cameras && incident.cameras.length > 0 
        ? incident.cameras.map(id => {
            const camera = cameras.find(c => c.id === id);
            return camera ? camera.idCamera : id;
          }).join(", ")
        : "PAS DE CAMERA";

      return {
        'Référence': incident.reference || "",
        'Date': incident.date ? new Date(incident.date).toLocaleDateString("fr-FR") : "",
        'Heure': incident.heure || "",
        'Zone': zoneNom,
        'Lieu': lieuNom,
        'Catégorie': incident.categorie || "",
        'Type d\'incident': typeIncidentNom,
        'Niveau Impact': incident.niveauImpact || "",
        'Primo Intervenant': incident.primo || "",
        'Intervenants ISP': intervenantsISP,
        'Caméras': camerasText,
        'Détails de l\'incident': incident.details || "",
        'Rédigé par': userNom,
        'Date enregistrement': incident.dateEnreg ? new Date(incident.dateEnreg).toLocaleDateString("fr-FR") + " " + new Date(incident.dateEnreg).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }) : ""
      };
    });

    // Créer le workbook et worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Ajuster la largeur des colonnes
    const colWidths = [
      { wch: 20 }, // Référence
      { wch: 12 }, // Date
      { wch: 8 },  // Heure
      { wch: 15 }, // Zone
      { wch: 20 }, // Lieu
      { wch: 12 }, // Catégorie
      { wch: 25 }, // Type d'incident
      { wch: 15 }, // Niveau Impact
      { wch: 15 }, // Primo Intervenant
      { wch: 40 }, // Intervenants ISP
      { wch: 25 }, // Caméras
      { wch: 50 }, // Détails
      { wch: 20 }, // Rédigé par
      { wch: 20 }  // Date enregistrement
    ];
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, "Incidents");
    
    // Télécharger le fichier
    const fileName = `incidents_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };


  const getNiveauColor = (niveau) => {
    switch (niveau) {
      case "Négligeable":
        return "bg-green-100 text-green-800";
      case "Modéré":
        return "bg-yellow-100 text-yellow-800";
      case "Majeur":
        return "bg-orange-100 text-orange-800";
      case "Catastrophique":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.typeIncident?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      zones.find(z => z.id === incident.zone)?.nomZone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lieux.find(l => l.id === incident.lieu)?.nomLieu?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategorie = filterCategorie === "all" || incident.categorie === filterCategorie;
    const matchesNiveau = filterNiveau === "all" || incident.niveauImpact === filterNiveau;
    const matchesMois = filterMois === "all" || incident.mois === filterMois;
    const matchesDateFrom = !filterDateFrom || incident.date >= filterDateFrom;
    const matchesDateTo = !filterDateTo || incident.date <= filterDateTo;

    return matchesSearch && matchesCategorie && matchesNiveau && matchesMois && matchesDateFrom && matchesDateTo;
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
              <h1 className="text-lg font-medium text-gray-600">Data/Incidents</h1>
              <p className="text-gray-600 text-sm">Gestion des incidents</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={exportToExcel}
                className="flex items-center space-x-1 bg-green-600 hover:bg-transparent hover:border hover:border-green-600 hover:text-green-600 text-white px-4 py-2 transition-all duration-200 text-sm cursor-pointer"
                style={{borderRadius: '50px'}}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exporter Excel</span>
              </button>
              <button
                onClick={handleNew}
                className="flex items-center space-x-1 bg-red-600 hover:bg-transparent hover:border hover:border-red-600 hover:text-red-600 text-white px-4 py-2 transition-all duration-200 text-sm cursor-pointer"
                style={{borderRadius: '50px'}}
              >
                <Plus className="w-4 h-4" />
                <span>Nouvel incident</span>
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
                placeholder="Rechercher par référence, type, zone, lieu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="Date du"
                title="Date du"
              />
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="Date au"
                title="Date au"
              />
              <select
                value={filterCategorie}
                onChange={(e) => setFilterCategorie(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              >
                <option value="all">Toutes catégories</option>
                <option value="Sécurité">Sécurité</option>
                <option value="Sûreté">Sûreté</option>
                <option value="Informations">Informations</option>
              </select>
              <select
                value={filterNiveau}
                onChange={(e) => setFilterNiveau(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              >
                <option value="all">Tous niveaux</option>
                <option value="Négligeable">Négligeable</option>
                <option value="Modéré">Modéré</option>
                <option value="Majeur">Majeur</option>
                <option value="Catastrophique">Catastrophique</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredIncidents.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                {searchTerm || filterCategorie !== "all" || filterNiveau !== "all" || filterDateFrom || filterDateTo
                  ? "Aucun incident trouvé"
                  : "Aucun incident"}
              </h3>
              <p className="text-gray-600 text-sm">
                {searchTerm || filterCategorie !== "all" || filterNiveau !== "all" || filterDateFrom || filterDateTo
                  ? "Modifiez vos critères de recherche"
                  : "Créez votre premier incident"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Référence
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Heure
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Zone
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Lieu
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Catégorie
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Type incident
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Enregistré par
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Date enregistrement
                    </th>
                    {userProfile?.profil === "admin" && (
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                        Supprimé
                      </th>
                    )}
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredIncidents.map((incident) => (
                    <tr
                      key={incident.id}
                      className={`hover:bg-gray-50 transition-colors duration-150 ${
                        incident.supprimer ? "opacity-50" : ""
                      }`}
                    >
                      <td className="py-3 px-4 max-w-32">
                        <div className="text-sm font-medium text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis" title={incident.reference}>
                          {incident.reference}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-24">
                        <div className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis" title={incident.date ? new Date(incident.date).toLocaleDateString("fr-FR") : "N/A"}>
                          {incident.date ? new Date(incident.date).toLocaleDateString("fr-FR") : "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-16">
                        <div className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis" title={incident.heure}>
                          {incident.heure}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {(() => {
                          const zoneName = zones.find(z => z.id === incident.zone)?.nomZone;
                          return zoneName ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              getZoneColor(zoneName)
                            }`}>
                              {zoneName}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-600">N/A</span>
                          );
                        })()} 
                      </td>
                      <td className="py-3 px-4 max-w-32">
                        <div className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis" title={lieux.find(l => l.id === incident.lieu)?.nomLieu || "N/A"}>
                          {lieux.find(l => l.id === incident.lieu)?.nomLieu || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {incident.categorie ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getCategorieColor(incident.categorie)
                          }`}>
                            {incident.categorie}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-600">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-40">
                        <div className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis" title={typeIncidents.find(t => t.id === incident.typeIncident)?.nomIncident || "N/A"}>
                          {typeIncidents.find(t => t.id === incident.typeIncident)?.nomIncident || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-32">
                        <div className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis" title={users.find(u => u.id === incident.user)?.nom || "N/A"}>
                          {users.find(u => u.id === incident.user)?.nom || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-36">
                        <div className="text-sm text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis" title={`${new Date(incident.dateEnreg).toLocaleDateString("fr-FR")} ${new Date(incident.dateEnreg).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}`}>
                          {new Date(incident.dateEnreg).toLocaleDateString("fr-FR")} {new Date(incident.dateEnreg).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      {userProfile?.profil === "admin" && (
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleSupprimer(incident.id, incident.supprimer)}
                            className={`flex items-center space-x-1 px-2 py-1 text-xs transition-all duration-200 cursor-pointer ${
                              incident.supprimer
                                ? "bg-red-600 text-white hover:bg-transparent hover:border hover:border-red-600 hover:text-red-600"
                                : "bg-green-600 text-white hover:bg-transparent hover:border hover:border-green-600 hover:text-green-600"
                            }`}
                            style={{borderRadius: '50px'}}
                          >
                            {incident.supprimer ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                            <span>{incident.supprimer ? "Oui" : "Non"}</span>
                          </button>
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleView(incident.id)}
                            className="p-2 bg-gray-600 text-white hover:bg-transparent hover:border hover:border-gray-600 hover:text-gray-600 transition-all duration-200 cursor-pointer"
                            style={{borderRadius: '50px'}}
                            title="Afficher"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrint(incident)}
                            className="p-2 bg-green-600 text-white hover:bg-transparent hover:border hover:border-green-600 hover:text-green-600 transition-all duration-200 cursor-pointer"
                            style={{borderRadius: '50px'}}
                            title="Imprimer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          {userProfile?.profil !== "user" && (
                            <button
                              onClick={() => handleEdit(incident.id)}
                              className="p-2 bg-blue-600 text-white hover:!bg-transparent hover:border hover:border-blue-600 hover:text-blue-600 transition-all duration-200 cursor-pointer"
                              style={{borderRadius: '50px'}}
                              title="Modifier"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {userProfile?.profil === "admin" && (
                            <button
                              onClick={() => handleToggleSupprimer(incident.id, incident.supprimer)}
                              className="p-2 bg-red-600 text-white hover:bg-transparent hover:border hover:border-red-600 hover:text-red-600 transition-all duration-200 cursor-pointer"
                              style={{borderRadius: '50px'}}
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

        {filteredIncidents.length > 0 && (
          <div className="mt-4 text-center text-gray-600 text-sm">
            Affichage de {filteredIncidents.length} incident
            {filteredIncidents.length > 1 ? "s" : ""}
            {incidents.length !== filteredIncidents.length &&
              ` sur ${incidents.length} au total`}
          </div>
        )}
      </div>
    </div>
  );
}

export default IncidentsTable;