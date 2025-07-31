import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import {
  Users,
  X,
  Calendar,
  Clock,
  MapPin,
  Shield,
  Save,
  Loader2,
  Hash,
} from "lucide-react";

function EffectifsFormModal({ isOpen, onClose, effectifId, isEditMode }) {
  const [user] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    vacation: "Jour",
    zone: "",
    effectifPatrique: "",
    conge: "",
    arretMaladie: "",
    MiseAPied: "",
    Permission: "",
    AbsenceAJustifier: "",
    enregistrePar: "",
    dateEnregistrement: new Date().toISOString(),
  });

  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchUserProfile();
      fetchCollections();
      if (isEditMode && effectifId) {
        loadEffectifData();
      } else {
        // Mode création
        setFormData({
          date: new Date().toISOString().split("T")[0],
          vacation: "Jour",
          zone: "",
          effectifPatrique: "",
          conge: "",
          arretMaladie: "",
          MiseAPied: "",
          Permission: "",
          AbsenceAJustifier: "",
          enregistrePar: user?.uid || "",
          dateEnregistrement: new Date().toISOString(),
        });
      }
    }
  }, [isOpen, effectifId, isEditMode, user]);

  const fetchUserProfile = async () => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    }
  };

  const fetchCollections = async () => {
    try {
      // Fetch zones
      const zonesSnapshot = await getDocs(collection(db, "zones"));
      const zonesList = zonesSnapshot.docs.map((doc) => ({
        id: doc.id,
        nomZone: doc.data().nomZone,
      }));
      setZones(zonesList.sort((a, b) => a.nomZone.localeCompare(b.nomZone)));

    } catch (error) {
      console.error("Erreur lors du chargement des collections:", error);
    }
  };

  const loadEffectifData = async () => {
    try {
      const effectifDoc = await getDoc(doc(db, "effectifs", effectifId));
      if (effectifDoc.exists()) {
        const data = effectifDoc.data();
        setFormData({
          ...data,
          date: data.date || new Date().toISOString().split("T")[0],
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'effectif:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['date', 'vacation', 'zone', 'effectifPatrique'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setError(`Veuillez remplir les champs obligatoires: ${missingFields.join(', ')}`);
      return false;
    }

    // Validation que effectifPatrique est un nombre
    if (isNaN(formData.effectifPatrique) || formData.effectifPatrique < 0) {
      setError("L'effectif pratique doit être un nombre positif");
      return false;
    }

    // Validation des autres champs numériques
    const numericFields = ['conge', 'arretMaladie', 'MiseAPied', 'Permission', 'AbsenceAJustifier'];
    for (const field of numericFields) {
      if (formData[field] && (isNaN(formData[field]) || formData[field] < 0)) {
        setError(`Le champ ${field} doit être un nombre positif`);
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const effectifData = {
        ...formData,
        // Convertir les champs numériques
        effectifPatrique: parseInt(formData.effectifPatrique) || 0,
        conge: parseInt(formData.conge) || 0,
        arretMaladie: parseInt(formData.arretMaladie) || 0,
        MiseAPied: parseInt(formData.MiseAPied) || 0,
        Permission: parseInt(formData.Permission) || 0,
        AbsenceAJustifier: parseInt(formData.AbsenceAJustifier) || 0,
      };

      if (isEditMode) {
        await setDoc(doc(db, "effectifs", effectifId), effectifData, { merge: true });
      } else {
        await setDoc(doc(db, "effectifs", `effectif_${Date.now()}`), effectifData);
      }

      onClose();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      setError("Erreur lors de l'enregistrement");
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
      className="fixed inset-0 z-[101] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto py-8"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl border border-gray-100 animate-scale-in mx-4 my-8">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {isEditMode ? "Modifier l'effectif" : "Nouvel effectif"}
                </h2>
                <p className="text-blue-200 text-xs">
                  {isEditMode ? "Mettre à jour les informations" : "Créer un nouvel effectif journalier"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors duration-200 cursor-pointer"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <Calendar className="w-3 h-3" />
                  <span>Date <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  required
                />
              </div>

              {/* Vacation */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <Clock className="w-3 h-3" />
                  <span>Vacation <span className="text-red-500">*</span></span>
                </label>
                <select
                  name="vacation"
                  value={formData.vacation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  required
                >
                  <option value="Jour">Jour</option>
                  <option value="Nuit">Nuit</option>
                </select>
              </div>

              {/* Zone */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <MapPin className="w-3 h-3" />
                  <span>Zone <span className="text-red-500">*</span></span>
                </label>
                <select
                  name="zone"
                  value={formData.zone}
                  onChange={handleInputChange}
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

              {/* Effectif Pratique */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <Hash className="w-3 h-3" />
                  <span>Effectif Pratique <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="number"
                  name="effectifPatrique"
                  value={formData.effectifPatrique}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              {/* Congé */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <Hash className="w-3 h-3" />
                  <span>Congé</span>
                </label>
                <input
                  type="number"
                  name="conge"
                  value={formData.conge}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Arrêt Maladie */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <Hash className="w-3 h-3" />
                  <span>Arrêt Maladie</span>
                </label>
                <input
                  type="number"
                  name="arretMaladie"
                  value={formData.arretMaladie}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Mise à Pied */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <Hash className="w-3 h-3" />
                  <span>Mise à Pied</span>
                </label>
                <input
                  type="number"
                  name="MiseAPied"
                  value={formData.MiseAPied}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Permission */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <Hash className="w-3 h-3" />
                  <span>Permission</span>
                </label>
                <input
                  type="number"
                  name="Permission"
                  value={formData.Permission}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Absence à Justifier */}
              <div className="space-y-1">
                <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                  <Hash className="w-3 h-3" />
                  <span>Absence à Justifier</span>
                </label>
                <input
                  type="number"
                  name="AbsenceAJustifier"
                  value={formData.AbsenceAJustifier}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white transition-all duration-200 text-sm cursor-pointer"
                style={{borderRadius: '50px'}}
                onMouseEnter={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.border = '1px solid #6b7280';
                  e.target.style.color = '#6b7280';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '';
                  e.target.style.border = '';
                  e.target.style.color = '';
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 bg-gradient-to-r from-blue-900 to-blue-700 disabled:from-blue-500 disabled:to-blue-400 transition-all duration-200 text-sm cursor-pointer"
                style={{borderRadius: '50px', color: 'white'}}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = 'transparent';
                    e.target.style.border = '1px solid #1e40af';
                    e.target.style.color = '#1e40af';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.background = '';
                    e.target.style.border = '';
                    e.target.style.color = 'white';
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Enregistrer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(-20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>
    </div>
  );
}

export default EffectifsFormModal;