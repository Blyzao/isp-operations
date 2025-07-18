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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function IncidentsTable() {
  const [incidents, setIncidents] = useState([]);
  const [zones, setZones] = useState([]);
  const [lieux, setLieux] = useState([]);
  const [typeIncidents, setTypeIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategorie, setFilterCategorie] = useState("all");
  const [filterNiveau, setFilterNiveau] = useState("all");
  const [filterMois, setFilterMois] = useState("all");
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
          fetchUsers()
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

    return matchesSearch && matchesCategorie && matchesNiveau && matchesMois;
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
              <div className="p-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Incidents</h1>
                <p className="text-gray-600 text-sm">Gestion des incidents</p>
              </div>
            </div>
            <button
              onClick={handleNew}
              className="flex items-center space-x-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel incident</span>
            </button>
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
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterCategorie}
                onChange={(e) => setFilterCategorie(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              >
                <option value="all">Toutes catégories</option>
                <option value="Sécurité">Sécurité</option>
                <option value="Sureté">Sureté</option>
              </select>
              <select
                value={filterNiveau}
                onChange={(e) => setFilterNiveau(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
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
                {searchTerm || filterCategorie !== "all" || filterNiveau !== "all"
                  ? "Aucun incident trouvé"
                  : "Aucun incident"}
              </h3>
              <p className="text-gray-600 text-sm">
                {searchTerm || filterCategorie !== "all" || filterNiveau !== "all"
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
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">
                          {incident.reference}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {incident.date ? new Date(incident.date).toLocaleDateString("fr-FR") : "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {incident.heure}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {zones.find(z => z.id === incident.zone)?.nomZone || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {lieux.find(l => l.id === incident.lieu)?.nomLieu || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {typeIncidents.find(t => t.id === incident.typeIncident)?.nomIncident || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {users.find(u => u.id === incident.user)?.nom || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {new Date(incident.dateEnreg).toLocaleDateString("fr-FR")} {new Date(incident.dateEnreg).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      {userProfile?.profil === "admin" && (
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleSupprimer(incident.id, incident.supprimer)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs transition-all duration-200 ${
                              incident.supprimer
                                ? "bg-red-50 text-red-700 hover:bg-red-100"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
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
                            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-all duration-200"
                            title="Afficher"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {userProfile?.profil !== "user" && (
                            <button
                              onClick={() => handleEdit(incident.id)}
                              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all duration-200"
                              title="Modifier"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {userProfile?.profil === "admin" && (
                            <button
                              onClick={() => handleToggleSupprimer(incident.id, incident.supprimer)}
                              className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-all duration-200"
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