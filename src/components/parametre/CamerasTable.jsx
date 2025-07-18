import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import {
  Camera,
  PlusCircle,
  Edit3,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Upload,
} from "lucide-react";
import CameraFormModal from "./CameraFormModal";

function CamerasTable() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editCameraId, setEditCameraId] = useState(null);
  const [importError, setImportError] = useState(null);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "cameras"));
      const camerasList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        siteCamera: doc.data().siteCamera || "N/A",
        idCamera: doc.data().idCamera || "N/A",
        active: doc.data().active !== false,
      }));
      setCameras(camerasList);
    } catch (error) {
      console.error("Erreur lors de la récupération des caméras:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const handleEdit = (cameraId) => {
    setEditCameraId(cameraId);
    setModalOpen(true);
  };

  const handleNewCamera = () => {
    setEditCameraId(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditCameraId(null);
    fetchCameras();
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
            if (!item.siteCamera || !item.idCamera) {
              errors.push(
                `Entrée ignorée : ${JSON.stringify(item)} (champs manquants)`
              );
              continue;
            }

            // Vérifier l'unicité de idCamera
            const q = query(
              collection(db, "cameras"),
              where("idCamera", "==", item.idCamera.toUpperCase())
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              errors.push(`ID caméra déjà utilisé : ${item.idCamera}`);
              continue;
            }

            const cameraData = {
              siteCamera: item.siteCamera.toUpperCase(),
              idCamera: item.idCamera.toUpperCase(),
              active: item.active !== false,
            };

            try {
              await setDoc(doc(collection(db, "cameras")), cameraData);
            } catch (err) {
              errors.push(
                `Erreur lors de l'importation de ${item.idCamera}: ${err.message}`
              );
            }
          }

          if (errors.length > 0) {
            setImportError(errors.join("; "));
            console.error("Erreurs d'importation:", errors);
          }
          fetchCameras();
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

  const filteredCameras = cameras.filter((camera) => {
    const matchesSearch =
      camera.siteCamera.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camera.idCamera.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && camera.active) ||
      (filterStatus === "inactive" && !camera.active);
    return matchesSearch && matchesStatus;
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
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Caméras</h1>
                <p className="text-gray-600 text-sm">Gestion des caméras</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleNewCamera}
                className="flex items-center space-x-1 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nouvelle caméra</span>
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
                placeholder="Rechercher par site ou ID caméra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>
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
          </div>
          <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">
                {cameras.filter((c) => c.active).length} actives
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs text-gray-600">
                {cameras.filter((c) => !c.active).length} inactives
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
          {filteredCameras.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                {searchTerm || filterStatus !== "all"
                  ? "Aucune caméra trouvée"
                  : "Aucune caméra"}
              </h3>
              <p className="text-gray-600 text-sm">
                {searchTerm || filterStatus !== "all"
                  ? "Modifiez vos critères de recherche"
                  : "Créez votre première caméra"}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <button
                  onClick={handleNewCamera}
                  className="mt-4 flex items-center space-x-1 mx-auto bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Créer une caméra</span>
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
                        <Camera className="w-4 h-4" />
                        <span>Site</span>
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      ID Caméra
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
                  {filteredCameras.map((camera) => (
                    <tr
                      key={camera.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700">
                            {camera.siteCamera.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {camera.siteCamera}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {camera.idCamera}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                            ${
                              camera.active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                        >
                          {camera.active ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>{camera.active ? "Active" : "Inactive"}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleEdit(camera.id)}
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

        {filteredCameras.length > 0 && (
          <div className="mt-4 text-center text-gray-600 text-sm">
            Affichage de {filteredCameras.length} caméra
            {filteredCameras.length > 1 ? "s" : ""}
            {cameras.length !== filteredCameras.length &&
              ` sur ${cameras.length} au total`}
          </div>
        )}

        <CameraFormModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          cameraId={editCameraId}
          isEditMode={!!editCameraId}
        />
      </div>
    </div>
  );
}

export default CamerasTable;
