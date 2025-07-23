import React from "react";
import { Mail, Send, ArrowLeft, KeyRound } from "lucide-react";

function ForgotPasswordForm({
  email,
  setEmail,
  isLoading,
  setIsLoading,
  setError,
  setShowForgotPassword,
}) {
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format d'email invalide");
      setIsLoading(false);
      return;
    }

    try {
      console.log("🔵 Envoi de demande de réinitialisation pour:", email);
      
      const response = await fetch('https://us-central1-isp-operations.cloudfunctions.net/sendPasswordResetEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email })
      });
      
      const result = await response.json();
      console.log("✅ Résultat:", result);
      
      if (response.ok) {
        alert(
          "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans quelques minutes."
        );
        setShowForgotPassword(false);
      } else {
        throw new Error(result.error || "Erreur lors de l'envoi");
      }
    } catch (err) {
      console.error("❌ Erreur lors de la demande de réinitialisation:", err);
      let errorMessage = "Erreur lors de l'envoi de la demande.";
      
      if (err.message.includes("USER_NOT_FOUND")) {
        errorMessage = "Utilisateur non trouvé avec cet email.";
      } else if (err.message.includes("INVALID_EMAIL")) {
        errorMessage = "Format d'email invalide.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Mot de passe oublié
            </h2>
            <p className="text-blue-100 text-sm">
              Réinitialisez votre mot de passe
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            Saisissez votre adresse email et nous vous enverrons un lien pour
            réinitialiser votre mot de passe.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleForgotPassword}>
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4" />
              <span>Adresse email</span>
            </label>
            <input
              type="email"
              placeholder="exemple@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 placeholder-gray-500"
              required
              style={{ color: '#111827 !important' }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl ${
              isLoading
                ? "bg-gradient-to-r from-blue-400 to-blue-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5"
            } text-white`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Envoyer l'email de réinitialisation</span>
              </>
            )}
          </button>

          <div className="pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1 w-full"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à la connexion</span>
            </button>
          </div>
        </form>
      </div>
      
      <style>{`
        /* Force la couleur du texte dans les champs d'authentification */
        .auth-form input[type="email"],
        .auth-form input[type="password"],
        .auth-form input[type="text"] {
          color: #111827 !important;
          -webkit-text-fill-color: #111827 !important;
        }
        .auth-form input::placeholder {
          color: #6b7280 !important;
          opacity: 1 !important;
        }
        .auth-form input:-webkit-autofill,
        .auth-form input:-webkit-autofill:hover,
        .auth-form input:-webkit-autofill:focus {
          -webkit-text-fill-color: #111827 !important;
          -webkit-box-shadow: 0 0 0px 1000px #f9fafb inset !important;
          transition: background-color 5000s ease-in-out 0s !important;
        }
      `}</style>
    </div>
  );
}

export default ForgotPasswordForm;
