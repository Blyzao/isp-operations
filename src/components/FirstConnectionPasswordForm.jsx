import React, { useState } from "react";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

function FirstConnectionPasswordForm({ user, onComplete }) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const passwordRequirements = [
    { regex: /.{8,}/, text: "Au moins 8 caractères" },
    { regex: /[A-Z]/, text: "Au moins une majuscule" },
    { regex: /[a-z]/, text: "Au moins une minuscule" },
    { regex: /[0-9]/, text: "Au moins un chiffre" },
    { regex: /[^A-Za-z0-9]/, text: "Au moins un caractère spécial" },
  ];

  const checkPasswordRequirement = (password, regex) => {
    return regex.test(password);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation des champs requis
    if (!formData.currentPassword) {
      setError("Le mot de passe actuel est requis.");
      setLoading(false);
      return;
    }

    // Validation des mots de passe
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    // Vérification des exigences de mot de passe
    const allRequirementsMet = passwordRequirements.every((req) =>
      checkPasswordRequirement(formData.newPassword, req.regex)
    );

    if (!allRequirementsMet) {
      setError("Le mot de passe ne respecte pas toutes les exigences de sécurité.");
      setLoading(false);
      return;
    }

    try {
      // Ré-authentification avec le mot de passe actuel
      const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Mise à jour du mot de passe dans Firebase Auth
      await updatePassword(user, formData.newPassword);

      // Mise à jour du champ firstConnect dans Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        firstConnect: false,
      });

      onComplete();
    } catch (err) {
      console.error("Erreur lors du changement de mot de passe:", err);
      let errorMessage = "Erreur lors du changement de mot de passe.";
      
      switch (err.code) {
        case "auth/weak-password":
          errorMessage = "Le mot de passe est trop faible.";
          break;
        case "auth/requires-recent-login":
          errorMessage = "Veuillez vous reconnecter et réessayer.";
          break;
        case "auth/wrong-password":
          errorMessage = "Le mot de passe actuel est incorrect.";
          break;
        case "auth/invalid-credential":
          errorMessage = "Le mot de passe actuel est incorrect.";
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-4xl">
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-6 py-4 rounded-t-xl text-center">
          <h1 className="text-xl font-bold text-white mb-1">
            Première connexion
          </h1>
          <p className="text-blue-200 text-sm">
            Veuillez définir un nouveau mot de passe sécurisé
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Colonne des champs */}
              <div className="space-y-4">
                <div>
                  <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4" />
                    <span>Mot de passe actuel</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Saisir le mot de passe actuel"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4" />
                    <span>Nouveau mot de passe</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Saisir le nouveau mot de passe"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-1 text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4" />
                    <span>Confirmer le mot de passe</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Confirmer le nouveau mot de passe"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Colonne des exigences */}
              <div className="space-y-4">
                {/* Exigences de mot de passe */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Exigences du mot de passe :
                  </h3>
                  <div className="space-y-2">
                    {passwordRequirements.map((req, index) => {
                      const isValid = checkPasswordRequirement(
                        formData.newPassword,
                        req.regex
                      );
                      return (
                        <div
                          key={index}
                          className={`flex items-center space-x-2 text-xs transition-all duration-300 ${
                            isValid ? "text-green-600" : "text-gray-500"
                          }`}
                          style={{
                            transform: isValid ? "scale(1.02)" : "scale(1)",
                            transition: "all 0.3s ease"
                          }}
                        >
                          <div className={`transition-all duration-300 ${isValid ? "scale-110" : "scale-100"}`}>
                            {isValid ? (
                              <CheckCircle className="w-3 h-3 animate-pulse" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                          </div>
                          <span className={`transition-all duration-300 ${isValid ? "font-medium" : "font-normal"}`}>
                            {req.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Validation de la correspondance */}
                {formData.confirmPassword && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Vérification :
                    </h3>
                    <div
                      className={`flex items-center space-x-2 text-xs transition-all duration-300 ${
                        formData.newPassword === formData.confirmPassword
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                      style={{
                        transform: formData.newPassword === formData.confirmPassword ? "scale(1.02)" : "scale(1)",
                        transition: "all 0.3s ease"
                      }}
                    >
                      <div className={`transition-all duration-300 ${formData.newPassword === formData.confirmPassword ? "scale-110" : "scale-100"}`}>
                        {formData.newPassword === formData.confirmPassword ? (
                          <CheckCircle className="w-3 h-3 animate-pulse" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                      </div>
                      <span className={`transition-all duration-300 ${formData.newPassword === formData.confirmPassword ? "font-medium" : "font-normal"}`}>
                        {formData.newPassword === formData.confirmPassword
                          ? "Les mots de passe correspondent"
                          : "Les mots de passe ne correspondent pas"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !formData.currentPassword || !passwordRequirements.every((req) => checkPasswordRequirement(formData.newPassword, req.regex)) || formData.newPassword !== formData.confirmPassword}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white rounded-lg disabled:from-blue-500 disabled:to-blue-400 transition-all duration-200 font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mise à jour...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Définir le mot de passe</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FirstConnectionPasswordForm;