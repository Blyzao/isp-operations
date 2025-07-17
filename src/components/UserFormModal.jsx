import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import {
  User,
  Mail,
  Shield,
  Lock,
  X,
  UserPlus,
  Edit3,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

function UserFormModal({ isOpen, onClose, userId, isEditMode }) {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    profil: "user",
    password: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isEditMode && userId) {
      const fetchUser = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setFormData({
              nom: data.nom || "",
              email: data.email || "",
              profil: data.profil || "user",
              password: "",
            });
          } else {
            setError("Utilisateur non trouvé.");
          }
        } catch (err) {
          console.error("Erreur lors du chargement des données:", err);
          setError("Erreur lors du chargement des données.");
        }
      };
      fetchUser();
    }
  }, [isEditMode, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEditMode) {
        const userRef = doc(db, "users", userId);
        await setDoc(
          userRef,
          {
            nom: formData.nom,
            email: formData.email,
            profil: formData.profil,
          },
          { merge: true }
        );
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const user = userCredential.user;
        await updateProfile(user, { displayName: formData.nom });
        await setDoc(doc(db, "users", user.uid), {
          nom: formData.nom,
          email: formData.email,
          profil: formData.profil,
          active: true,
        });

        // L'email d'activation sera envoyé automatiquement par la Cloud Function
        // sendActivationEmail qui se déclenche lors de la création d'un utilisateur
      }
      onClose();
    } catch (err) {
      console.error("Erreur lors de l'enregistrement:", err);
      let errorMessage = "Erreur lors de l'enregistrement.";
      switch (err.code) {
        case "auth/email-already-in-use":
          errorMessage = "Cet email est déjà utilisé.";
          break;
        case "auth/invalid-email":
          errorMessage = "Email invalide.";
          break;
        case "auth/weak-password":
          errorMessage = "Mot de passe trop faible (minimum 6 caractères).";
          break;
        case "permission-denied":
          errorMessage = "Autorisations insuffisantes.";
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
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
      <div className="bg-white rounded-xl w-full max-w-md shadow-xl border border-gray-100 animate-scale-in mx-4">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4">
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
                  {isEditMode ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
                </h2>
                <p className="text-blue-200 text-xs">
                  {isEditMode
                    ? "Mettre à jour les informations"
                    : "Créer un nouveau compte"}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                <User className="w-3 h-3" />
                <span>Nom complet</span>
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                placeholder="Saisir le nom complet"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                <Mail className="w-3 h-3" />
                <span>Adresse email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="exemple@email.com"
                required
                disabled={isEditMode}
              />
              {isEditMode && (
                <p className="text-xs text-gray-500 flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>Email non modifiable</span>
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                <Shield className="w-3 h-3" />
                <span>Niveau d'accès</span>
              </label>
              <select
                name="profil"
                value={formData.profil}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm"
                required
              >
                <option value="user">👤 Utilisateur</option>
                <option value="superviseur">👷 Superviseur</option>
                <option value="admin">🛡️ Administrateur</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="flex items-center space-x-1 text-xs font-medium text-gray-700">
                <Lock className="w-3 h-3" />
                <span>Mot de passe</span>
                {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder={
                    isEditMode ? "Non modifiable" : "Minimum 6 caractères"
                  }
                  required={!isEditMode}
                  disabled={isEditMode}
                />
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              {isEditMode && (
                <p className="text-xs text-gray-500 flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>Mot de passe non modifiable ici</span>
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-xs font-medium">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
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

export default UserFormModal;
