import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  User,
  X,
  UserPlus,
  Edit3,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

function PatrouilleurFormModal({
  isOpen,
  onClose,
  patrouilleurId,
  isEditMode,
}) {
  const [formData, setFormData] = useState({
    nomPatrouilleur: "",
    zone: "",
    active: true,
  });
  const [zones, setZones] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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

    if (isEditMode && patrouilleurId) {
      const fetchPatrouilleur = async () => {
        try {
          const patrouilleurDoc = await getDoc(
            doc(db, "patrouilleurs", patrouilleurId)
          );
          if (patrouilleurDoc.exists()) {
            const data = patrouilleurDoc.data();
            setFormData({
              nomPatrouilleur: data.nomPatrouilleur || "",
              zone: data.zone || "",
              active: data.active !== false,
            });
          } else {
            setError("Patrouilleur non trouvé.");
          }
        } catch (err) {
          console.error("Erreur lors du chargement des données:", err);
          setError("Erreur lors du chargement des données.");
        }
      };
      fetchPatrouilleur();
    }
  }, [isEditMode, patrouilleurId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const patrouilleurRef = doc(
        db,
        "patrouilleurs",
        isEditMode ? patrouilleurId : doc(collection(db, "patrouilleurs")).id
      );
      await setDoc(
        patrouilleurRef,
        {
          nomPatrouilleur: formData.nomPatrouilleur,
          zone: formData.zone,
          active: formData.active,
        },
        { merge: true }
      );
      onClose();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
      setError("Erreur lors de l'enregistrement: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[101] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl border border-gray-100 animate-scale-in mx-4">
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
                  {isEditMode
                    ? "Modifier le patrouilleur"
                    : "Nouveau patrouilleur"}
                </h2>
                <p className="text-blue-200 text-xs">
                  {isEditMode
                    ? "Mettre à jour les informations"
                    : "Créer un nouveau patrouilleur"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <User className="w-3 h-3" />
                  <span>Nom du patrouilleur</span>
                </label>
                <input
                  type="text"
                  name="nomPatrouilleur"
                  value={formData.nomPatrouilleur}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  placeholder="Saisir le nom du patrouilleur"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <User className="w-3 h-3" />
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

              <div className="space-y-1 col-span-2">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  {formData.active ? (
                    <ToggleRight className="w-3 h-3 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-3 h-3 text-gray-400" />
                  )}
                  <span>Statut du patrouilleur</span>
                </label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, active: !prev.active }))
                    }
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
                      {formData.active
                        ? "Patrouilleur actif"
                        : "Patrouilleur désactivé"}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.active
                        ? "Le patrouilleur est utilisable dans l'application"
                        : "Le patrouilleur est désactivé"}
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="col-span-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-xs font-medium">{error}</p>
                </div>
              )}

              <div className="col-span-2 flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
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

export default PatrouilleurFormModal;
