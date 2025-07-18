import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  Users,
  UserPlus,
  Edit3,
  CheckCircle,
  XCircle,
  Search,
  Filter,
} from "lucide-react";
import EquipeFormModal from "./EquipeFormModal";

function EquipesTable() {
  const [equipes, setEquipes] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterZone, setFilterZone] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editEquipeId, setEditEquipeId] = useState(null);

  const fetchZones = async () => {
    const querySnapshot = await getDocs(collection(db, "zones"));
    const zonesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nomZone: doc.data().nomZone || "N/A",
    }));
    setZones(zonesList);
  };

  const fetchEquipes = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "equipes"));
      const equipesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        nomEquipe: doc.data().nomEquipe || "N/A",
        zone: doc.data().zone || "N/A",
        active: doc.data().active !== false,
      }));
      setEquipes(equipesList);
    } catch (error) {
      console.error("Erreur lors de la récupération des équipes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
    fetchEquipes();
  }, []);

  const handleEdit = (equipeId) => {
    setEditEquipeId(equipeId);
    setModalOpen(true);
  };

  const handleNewEquipe = () => {
    setEditEquipeId(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditEquipeId(null);
    fetchEquipes();
  };

  const filteredEquipes = equipes
    .filter((equipe) => {
      const matchesSearch = equipe.nomEquipe
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && equipe.active) ||
        (filterStatus === "inactive" && !equipe.active);
      const matchesZone = filterZone === "all" || equipe.zone === filterZone;
      return matchesSearch && matchesStatus && matchesZone;
    })
    .sort((a, b) =>
      a.nomEquipe.localeCompare(b.nomEquipe, "fr", { sensitivity: "base" })
    );

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
              <div className="p-2 bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Équipes</h1>
                <p className="text-gray-600 text-sm">Gestion des équipes</p>
              </div>
            </div>
            <button
              onClick={handleNewEquipe}
              className="flex items-center space-x-1 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nouvelle équipe</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par nom d'équipe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-8 pr-6 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">Tous statuts</option>
                  <option value="active">Actives</option>
                  <option value="inactive">Inactives</option>
                </select>
              </div>
              <select
                value={filterZone}
                onChange={(e) => setFilterZone(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Toutes zones</option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.nomZone}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">
                {equipes.filter((e) => e.active).length} actives
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs text-gray-600">
                {equipes.filter((e) => !e.active).length} inactives
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredEquipes.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                {searchTerm || filterStatus !== "all" || filterZone !== "all"
                  ? "Aucune équipe trouvée"
                  : "Aucune équipe"}
              </h3>
              <p className="text-gray-600 text-sm">
                {searchTerm || filterStatus !== "all" || filterZone !== "all"
                  ? "Modifiez vos critères de recherche"
                  : "Créez votre première équipe"}
              </p>
              {!searchTerm &&
                filterStatus === "all" &&
                filterZone === "all" && (
                  <button
                    onClick={handleNewEquipe}
                    className="mt-4 flex items-center space-x-1 mx-auto bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Créer une équipe</span>
                  </button>
                )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>Équipe</span>
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Zone
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Statut
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEquipes.map((equipe) => (
                    <tr
                      key={equipe.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700`}
                          >
                            {equipe.nomEquipe.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {equipe.nomEquipe}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {zones.find((z) => z.id === equipe.zone)?.nomZone ||
                          "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                            ${
                              equipe.active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                        >
                          {equipe.active ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>{equipe.active ? "Active" : "Inactive"}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleEdit(equipe.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all duration-200 text-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Modifier</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredEquipes.length > 0 && (
          <div className="mt-4 text-center text-gray-600 text-sm">
            Affichage de {filteredEquipes.length} équipe
            {filteredEquipes.length > 1 ? "s" : ""}
            {equipes.length !== filteredEquipes.length &&
              ` sur ${equipes.length} au total`}
          </div>
        )}

        <EquipeFormModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          equipeId={editEquipeId}
          isEditMode={!!editEquipeId}
        />
      </div>
    </div>
  );
}

export default EquipesTable;
