import React, { useState } from "react";
import { auth } from "../firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { Lock, X, Loader2, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ChangePasswordModal({
  isOpen,
  onClose,
  isResetMode = false,
  oobCode = "",
  setError,
}) {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setLocalError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setError(null);
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      setLocalError("Les mots de passe ne correspondent pas.");
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      const db = getFirestore();
      if (isResetMode) {
        if (!oobCode) {
          throw new Error("Code de réinitialisation manquant.");
        }
        const email = await verifyPasswordResetCode(auth, oobCode);
        await confirmPasswordReset(auth, oobCode, formData.newPassword);
        await addDoc(collection(db, "passwordChanges"), {
          email: email,
          timestamp: new Date(),
        });
        alert(
          "Mot de passe réinitialisé avec succès. Veuillez vous connecter."
        );
        onClose();
        navigate("/auth", { replace: true });
      } else {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("Aucun utilisateur connecté.");
        }
        const credential = EmailAuthProvider.credential(
          user.email,
          formData.oldPassword
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, formData.newPassword);
        await addDoc(collection(db, "passwordChanges"), {
          email: user.email,
          timestamp: new Date(),
        });
        alert("Mot de passe changé avec succès. Veuillez vous reconnecter.");
        onClose();
        navigate("/auth");
      }
    } catch (err) {
      console.error("Erreur lors du changement de mot de passe:", err);
      let errorMessage =
        "Une erreur est survenue lors du changement de mot de passe.";
      if (err.code) {
        switch (err.code) {
          case "auth/wrong-password":
            errorMessage = "L'ancien mot de passe est incorrect.";
            break;
          case "auth/weak-password":
            errorMessage =
              "Le nouveau mot de passe est trop faible (minimum 6 caractères).";
            break;
          case "auth/requires-recent-login":
            errorMessage =
              "Veuillez vous reconnecter pour effectuer cette action.";
            break;
          case "auth/invalid-action-code":
            errorMessage = "Lien de réinitialisation invalide ou expiré.";
            break;
          case "auth/expired-action-code":
            errorMessage = "Le lien de réinitialisation a expiré.";
            break;
          default:
            errorMessage = err.message || errorMessage;
        }
      }
      setLocalError(errorMessage);
      setError(errorMessage);
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
      className="fixed inset-0 z-101 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 animate-scale-in mx-4 overflow-hidden">
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isResetMode
                    ? "Réinitialiser le mot de passe"
                    : "Changer le mot de passe"}
                </h2>
                <p className="text-blue-100 text-sm">
                  {isResetMode
                    ? "Définir un nouveau mot de passe"
                    : "Mettre à jour votre mot de passe"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors duration-200 group"
            >
              <X className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isResetMode && (
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Lock className="w-4 h-4" />
                  <span>Ancien mot de passe</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Saisir l'ancien mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showOldPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Lock className="w-4 h-4" />
                <span>Nouveau mot de passe</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Minimum 6 caractères"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Lock className="w-4 h-4" />
                <span>Confirmer le mot de passe</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Confirmer le nouveau mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors duration-200 font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl disabled:from-blue-400 disabled:to-blue-500 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
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

export default ChangePasswordModal;
