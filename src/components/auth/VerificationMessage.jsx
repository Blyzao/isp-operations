import React from "react";
import { Mail, RefreshCw, ArrowLeft, CheckCircle } from "lucide-react";

function VerificationMessage({
  handleResendVerification,
  isLoading,
  setIsSignedUp,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Vérification email</h2>
            <p className="text-green-100 text-sm">
              Confirmez votre adresse email
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="text-center space-y-6">
          {/* Icon and Message */}
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-600" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Email de vérification envoyé !
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
                Vérifiez votre boîte de réception et cliquez sur le lien de
                confirmation pour activer votre compte.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {/* Resend Button */}
            <button
              onClick={handleResendVerification}
              disabled={isLoading}
              className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl ${
                isLoading
                  ? "bg-gradient-to-r from-green-400 to-green-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transform hover:-translate-y-0.5"
              } text-white`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Renvoyer l'email de vérification</span>
                </>
              )}
            </button>

            {/* Back to Login */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsSignedUp(false)}
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1 w-full"
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour à la connexion</span>
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 leading-relaxed">
              💡 <strong>Astuce :</strong> Vérifiez aussi votre dossier spam si
              vous ne recevez pas l'email dans les prochaines minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificationMessage;
