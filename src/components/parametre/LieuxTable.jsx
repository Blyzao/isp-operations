import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import {
  MapPin,
  UserPlus,
  Edit3,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Upload,
} from "lucide-react";
import LieuFormModal from "./LieuFormModal";

function LieuxTable() {
  const [lieux, setLieux] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterZone, setFilterZone] = useState("all");
  const [filterTypeLieu, setFilterTypeLieu] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editLieuId, setEditLieuId] = useState(null);
  const [importError, setImportError] = useState(null);

  const fetchZones = async () => {
    const querySnapshot = await getDocs(collection(db, "zones"));
    const zonesList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      nomZone: doc.data().nomZone || "N/A",
    }));
    setZones(zonesList);
  };

  const fetchLieux = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "lieux"));
      const lieuxList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        nomLieu: doc.data().nomLieu || "N/A",
        zone: doc.data().zone || "N/A",
        localisation: doc.data().localisation || { lat: 0, lng: 0 },
        typeLieu: doc.data().typeLieu || "Autre",
        active: doc.data().active !== false,
        export: doc.data().export || false,
        avitaillement: doc.data().avitaillement || false,
      }));
      setLieux(lieuxList);
    } catch (error) {
      console.error("Erreur lors de la récupération des lieux:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
    fetchLieux();
  }, []);

  const handleEdit = (lieuId) => {
    setEditLieuId(lieuId);
    setModalOpen(true);
  };

  const handleNewLieu = () => {
    setEditLieuId(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditLieuId(null);
    fetchLieux();
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json = JSON.parse(e.target.result);
          if (!Array.isArray(json))
            throw new Error("Le fichier JSON doit être un tableau.");

          const errors = [];
          for (const item of json) {
            if (
              !item.nomLieu ||
              !item.zone ||
              item.latitude == null ||
              item.longitude == null
            ) {
              errors.push(
                `Entrée ignorée : ${JSON.stringify(item)} (champs manquants)`
              );
              continue;
            }

            const zoneDoc = zones.find((z) => z.nomZone === item.zone);
            if (!zoneDoc) {
              errors.push(`Zone non trouvée : ${item.zone}`);
              continue;
            }

            const lieuData = {
              nomLieu: item.nomLieu,
              zone: zoneDoc.id,
              localisation: {
                lat: parseFloat(item.latitude),
                lng: parseFloat(item.longitude),
              },
              typeLieu: ["PC", "ZAR", "Autre"].includes(item.typeLieu)
                ? item.typeLieu
                : "Autre",
              active: true,
              export: Boolean(item.export),
              avitaillement: Boolean(item.avitaillement),
            };

            try {
              await setDoc(doc(collection(db, "lieux")), lieuData);
            } catch (err) {
              errors.push(
                `Erreur lors de l'importation de ${item.nomLieu}: ${err.message}`
              );
            }
          }

          if (errors.length > 0) {
            setImportError(errors.join("; "));
            console.error("Erreurs d'importation:", errors);
          }
          fetchLieux();
        } catch (err) {
          setImportError(
            "Erreur lors de l'importation du fichier JSON: " + err.message
          );
          console.error("Erreur JSON:", err);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setImportError("Erreur lors de la lecture du fichier: " + err.message);
      console.error("Erreur fichier:", err);
    }
  };

  const filteredLieux = lieux.filter((lieu) => {
    const matchesSearch = lieu.nomLieu
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && lieu.active) ||
      (filterStatus === "inactive" && !lieu.active);
    const matchesZone = filterZone === "all" || lieu.zone === filterZone;
    const matchesTypeLieu =
      filterTypeLieu === "all" || lieu.typeLieu === filterTypeLieu;
    return matchesSearch && matchesStatus && matchesZone && matchesTypeLieu;
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
              <div className="p-2 bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Lieux</h1>
                <p className="text-gray-600 text-sm">Gestion des lieux</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleNewLieu}
                className="flex items-center space-x-1 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Nouveau lieu</span>
              </button>
              <label className="flex items-center space-x-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-all duration-200 text-sm cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Importer JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par nom de lieu..."
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
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
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
              <select
                value={filterTypeLieu}
                onChange={(e) => setFilterTypeLieu(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Tous types</option>
                <option value="PC">PC</option>
                <option value="ZAR">ZAR</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">
                {lieux.filter((l) => l.active).length} actifs
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs text-gray-600">
                {lieux.filter((l) => !l.active).length} inactifs
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-blue-600" />
              <span className="text-xs text-gray-600">
                {lieux.filter((l) => l.typeLieu === "PC").length} PC
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-gray-600">
                {lieux.filter((l) => l.typeLieu === "ZAR").length} ZAR
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-gray-600">
                {lieux.filter((l) => l.typeLieu === "Autre").length} Autre
              </span>
            </div>
          </div>
          {importError && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-xs font-medium">{importError}</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredLieux.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                {searchTerm ||
                filterStatus !== "all" ||
                filterZone !== "all" ||
                filterTypeLieu !== "all"
                  ? "Aucun lieu trouvé"
                  : "Aucun lieu"}
              </h3>
              <p className="text-gray-600 text-sm">
                {searchTerm ||
                filterStatus !== "all" ||
                filterZone !== "all" ||
                filterTypeLieu !== "all"
                  ? "Modifiez vos critères de recherche"
                  : "Créez votre premier lieu"}
              </p>
              {!searchTerm &&
                filterStatus === "all" &&
                filterZone === "all" &&
                filterTypeLieu === "all" && (
                  <button
                    onClick={handleNewLieu}
                    className="mt-4 flex items-center space-x-1 mx-auto bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Créer un lieu</span>
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
                        <MapPin className="w-4 h-4" />
                        <span>Lieu</span>
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Zone
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Export
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Avitaillement
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
                  {filteredLieux.map((lieu) => (
                    <tr
                      key={lieu.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700">
                            {lieu.nomLieu.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {lieu.nomLieu}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {zones.find((z) => z.id === lieu.zone)?.nomZone ||
                          "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                            ${
                              lieu.typeLieu === "PC"
                                ? "bg-blue-100 text-blue-800"
                                : lieu.typeLieu === "ZAR"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          <MapPin className="w-3 h-3" />
                          <span>{lieu.typeLieu}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                            ${
                              lieu.export
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {lieu.export ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>{lieu.export ? "Oui" : "Non"}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                            ${
                              lieu.avitaillement
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {lieu.avitaillement ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>{lieu.avitaillement ? "Oui" : "Non"}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                            ${
                              lieu.active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                        >
                          {lieu.active ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>{lieu.active ? "Actif" : "Inactif"}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleEdit(lieu.id)}
                          className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all duration-200"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredLieux.length > 0 && (
          <div className="mt-4 text-center text-gray-600 text-sm">
            Affichage de {filteredLieux.length} lieu
            {filteredLieux.length > 1 ? "x" : ""}
            {lieux.length !== filteredLieux.length &&
              ` sur ${lieux.length} au total`}
          </div>
        )}

        <LieuFormModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          lieuId={editLieuId}
          isEditMode={!!editLieuId}
        />
      </div>
    </div>
  );
}

export default LieuxTable;
