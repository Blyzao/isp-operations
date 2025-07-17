import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from "firebase/firestore";
import {
  MapPin,
  X,
  UserPlus,
  Edit3,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { GoogleMap, LoadScript, Marker, StreetViewPanorama } from "@react-google-maps/api";

function LieuFormModal({ isOpen, onClose, lieuId, isEditMode }) {
  const [formData, setFormData] = useState({
    nomLieu: "",
    zone: "",
    localisation: { lat: 5.304097935599856, lng: -4.023534599916851 }, // Côte d'Ivoire par défaut
    typeLieu: "Autre",
    active: true,
    export: false,
    avitaillement: false,
  });
  const [zones, setZones] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("map"); // "map" ou "satellite"
  const [streetViewError, setStreetViewError] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const mapStyles = { height: "400px", width: "100%" };
  const defaultCenter = { lat: 5.304097935599856, lng: -4.023534599916851 }; // Côte d'Ivoire

  useEffect(() => {
    const fetchZones = async () => {
      const q = query(collection(db, "zones"), where("active", "==", true));
      const querySnapshot = await getDocs(q);
      const zonesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        nomZone: doc.data().nomZone || "N/A",
      }));
      setZones(zonesList);
    };

    fetchZones();

    if (isEditMode && lieuId) {
      const fetchLieu = async () => {
        try {
          const lieuDoc = await getDoc(doc(db, "lieux", lieuId));
          if (lieuDoc.exists()) {
            const data = lieuDoc.data();
            setFormData({
              nomLieu: data.nomLieu || "",
              zone: data.zone || "",
              localisation: data.localisation || { lat: 5.304097935599856, lng: -4.023534599916851 },
              typeLieu: data.typeLieu || "Autre",
              active: data.active !== false,
              export: data.export || false,
              avitaillement: data.avitaillement || false,
            });
          } else {
            setError("Lieu non trouvé.");
          }
        } catch (err) {
          console.error("Erreur lors du chargement des données:", err);
          setError("Erreur lors du chargement des données.");
        }
      };
      fetchLieu();
    }
  }, [isEditMode, lieuId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleMapClick = (e) => {
    setFormData((prev) => ({
      ...prev,
      localisation: { lat: e.latLng.lat(), lng: e.latLng.lng() },
    }));
  };

  const handleStreetViewClick = (e) => {
    if (e.latLng) {
      setFormData((prev) => ({
        ...prev,
        localisation: { lat: e.latLng.lat(), lng: e.latLng.lng() },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEditMode) {
        const lieuRef = doc(db, "lieux", lieuId);
        await setDoc(
          lieuRef,
          {
            nomLieu: formData.nomLieu,
            zone: formData.zone,
            localisation: formData.localisation,
            typeLieu: formData.typeLieu,
            active: formData.active,
            export: formData.export,
            avitaillement: formData.avitaillement,
          },
          { merge: true }
        );
      } else {
        await addDoc(collection(db, "lieux"), {
          nomLieu: formData.nomLieu,
          zone: formData.zone,
          localisation: formData.localisation,
          typeLieu: formData.typeLieu,
          active: formData.active,
          export: formData.export,
          avitaillement: formData.avitaillement,
        });
      }
      handleClose();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
      setError("Erreur lors de l'enregistrement: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    setStreetViewError(false);
    setViewMode("map");
    setIsMapLoaded(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[101] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl w-full max-w-6xl shadow-xl border border-gray-100 animate-scale-in mx-4">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                {isEditMode ? (
                  <Edit3 className="w-5 h-5 text-white" />
                ) : (
                  <UserPlus className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {isEditMode ? "Modifier le lieu" : "Nouveau lieu"}
                </h2>
                <p className="text-blue-200 text-xs">
                  {isEditMode
                    ? "Mettre à jour les informations"
                    : "Créer un nouveau lieu"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                      <MapPin className="w-3 h-3" />
                      <span>Nom du lieu</span>
                    </label>
                    <input
                      type="text"
                      name="nomLieu"
                      value={formData.nomLieu}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                      placeholder="Saisir le nom du lieu"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                      <MapPin className="w-3 h-3" />
                      <span>Zone</span>
                    </label>
                    <select
                      name="zone"
                      value={formData.zone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                      required
                    >
                      <option value="">Sélectionner une zone</option>
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.nomZone}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                      <MapPin className="w-3 h-3" />
                      <span>Type de lieu</span>
                    </label>
                    <select
                      name="typeLieu"
                      value={formData.typeLieu}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                      required
                    >
                      <option value="PC">PC</option>
                      <option value="ZAR">ZAR</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                      {formData.active ? (
                        <ToggleRight className="w-3 h-3 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-3 h-3 text-gray-400" />
                      )}
                      <span>Statut du lieu</span>
                    </label>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleToggle("active")}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          formData.active ? "bg-green-600" : "bg-gray-400"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            formData.active ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <div className="flex-1">
                        <span
                          className={`text-sm font-medium ${
                            formData.active ? "text-green-700" : "text-gray-700"
                          }`}
                        >
                          {formData.active ? "Lieu actif" : "Lieu désactivé"}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.active
                            ? "Le lieu est utilisable dans l'application"
                            : "Le lieu est désactivé"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.localisation.lat}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        localisation: { ...prev.localisation, lat: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                      placeholder="5.304097935599856"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.localisation.lng}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        localisation: { ...prev.localisation, lng: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                      placeholder="-4.023534599916851"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                      {formData.export ? (
                        <ToggleRight className="w-3 h-3 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-3 h-3 text-gray-400" />
                      )}
                      <span>Export</span>
                    </label>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleToggle("export")}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          formData.export ? "bg-green-600" : "bg-gray-400"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            formData.export ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <div className="flex-1">
                        <span
                          className={`text-sm font-medium ${
                            formData.export ? "text-green-700" : "text-gray-700"
                          }`}
                        >
                          {formData.export ? "Export activé" : "Export désactivé"}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.export
                            ? "Ce lieu permet le passage des produits destinés à l'exportation"
                            : "Ce lieu ne permet pas le passage des produits destinés à l'exportation"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                      {formData.avitaillement ? (
                        <ToggleRight className="w-3 h-3 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-3 h-3 text-gray-400" />
                      )}
                      <span>Avitaillement</span>
                    </label>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleToggle("avitaillement")}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          formData.avitaillement ? "bg-green-600" : "bg-gray-400"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            formData.avitaillement
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      </button>
                      <div className="flex-1">
                        <span
                          className={`text-sm font-medium ${
                            formData.avitaillement
                              ? "text-green-700"
                              : "text-gray-700"
                          }`}
                        >
                          {formData.avitaillement
                            ? "Avitaillement activé"
                            : "Avitaillement désactivé"}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.avitaillement
                            ? "Ce lieu permet le passage de produits d'avitaillement"
                            : "Ce lieu ne permet pas le passage de produits d'avitaillement"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-xs font-medium">{error}</p>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white rounded-lg disabled:from-blue-500 disabled:to-blue-400 transition-all duration-200 text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        {isEditMode ? (
                          <Edit3 className="w-4 h-4" />
                        ) : (
                          <UserPlus className="w-4 h-4" />
                        )}
                        <span>Enregistrer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Carte Google Maps à droite */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                    <MapPin className="w-3 h-3" />
                    <span>Localisation sur la carte</span>
                  </label>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode("map")}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                        viewMode === "map"
                          ? "bg-white text-blue-700 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Carte
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("satellite")}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
                        viewMode === "satellite"
                          ? "bg-white text-blue-700 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Satellite
                    </button>
                  </div>
                </div>
                
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <LoadScript
                    googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                    onLoad={() => setIsMapLoaded(true)}
                    onError={() => setStreetViewError(true)}
                  >
                    {isMapLoaded ? (
                      <GoogleMap
                        mapContainerStyle={mapStyles}
                        zoom={viewMode === "satellite" ? 15 : 10}
                        center={formData.localisation}
                        onClick={handleMapClick}
                        mapTypeId={viewMode === "satellite" ? "satellite" : "roadmap"}
                        options={{
                          streetViewControl: false,
                          fullscreenControl: false,
                          mapTypeControl: true,
                          zoomControl: true,
                          rotateControl: false,
                          scaleControl: false,
                        }}
                      >
                        <Marker 
                          position={formData.localisation}
                          draggable={true}
                          onDragEnd={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              localisation: { lat: e.latLng.lat(), lng: e.latLng.lng() },
                            }));
                          }}
                        />
                      </GoogleMap>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-100">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">Chargement de la carte...</p>
                        </div>
                      </div>
                    )}
                  </LoadScript>
                </div>
                
                <p className="text-xs text-gray-500">
                  {viewMode === "map" 
                    ? "Cliquez sur la carte ou déplacez le marqueur pour définir la localisation" 
                    : "Vue satellite - Cliquez sur la carte ou déplacez le marqueur pour une localisation précise"}
                </p>
                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  Latitude: {formData.localisation.lat.toFixed(6)}<br />
                  Longitude: {formData.localisation.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}

export default LieuFormModal;
