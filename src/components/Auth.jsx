import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  applyActionCode,
  verifyPasswordResetCode,
} from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import AuthForm from "./auth/AuthForm";
import ForgotPasswordForm from "./auth/ForgotPasswordForm";
import VerificationMessage from "./auth/VerificationMessage";
import LoadingSpinner from "./auth/LoadingSpinner";
import ErrorMessage from "./auth/ErrorMessage";
import ChangePasswordModal from "./ChangePasswordModal";

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [resetOobCode, setResetOobCode] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const oobCode = query.get("oobCode");
    const mode = query.get("mode");

    if (oobCode) {
      setIsLoading(true);
      if (mode === "resetPassword") {
        verifyPasswordResetCode(auth, oobCode)
          .then((email) => {
            setEmail(email);
            setShowChangePasswordModal(true);
            setResetOobCode(oobCode);
            setError(null);
          })
          .catch((err) => {
            console.error(
              "Erreur lors de la vérification du code de réinitialisation:",
              err
            );
            let errorMessage = "Erreur lors de la vérification du lien.";
            switch (err.code) {
              case "auth/invalid-action-code":
                errorMessage = "Lien de réinitialisation invalide ou expiré.";
                break;
              case "auth/expired-action-code":
                errorMessage = "Le lien de réinitialisation a expiré.";
                break;
              default:
                errorMessage = err.message || errorMessage;
            }
            setError(errorMessage);
          })
          .finally(() => {
            setIsLoading(false);
            navigate("/auth", { replace: true });
          });
      } else if (mode === "verifyEmail") {
        applyActionCode(auth, oobCode)
          .then(() => {
            setError(null);
            setIsSignedUp(false);
            alert(
              "Votre email a été vérifié avec succès. Veuillez vous connecter."
            );
          })
          .catch((err) => {
            console.error("Erreur lors de la vérification de l'email:", err);
            let errorMessage = "Erreur lors de la vérification de l'email.";
            switch (err.code) {
              case "auth/invalid-action-code":
                errorMessage = "Lien de vérification invalide ou expiré.";
                break;
              case "auth/expired-action-code":
                errorMessage = "Le lien de vérification a expiré.";
                break;
              default:
                errorMessage = err.message || errorMessage;
            }
            setError(errorMessage);
          })
          .finally(() => {
            setIsLoading(false);
            navigate("/auth", { replace: true });
          });
      }
    }
  }, [location, navigate, setError]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format d'email invalide");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      setIsLoading(false);
      return;
    }

    try {
      const persistence = rememberMe
        ? browserLocalPersistence
        : browserSessionPersistence;
      await setPersistence(auth, persistence);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (!userCredential.user.emailVerified) {
        setError("Veuillez vérifier votre email avant de vous connecter.");
        await auth.signOut();
        setIsSignedUp(true);
        return;
      }

      console.log("Connexion réussie");
      navigate("/");
    } catch (err) {
      console.error("Erreur de connexion:", err.message);
      let errorMessage = "Une erreur est survenue lors de la connexion.";
      switch (err.code) {
        case "auth/invalid-email":
          errorMessage = "Format d'email invalide.";
          break;
        case "auth/user-disabled":
          errorMessage = "Ce compte a été désactivé.";
          break;
        case "auth/user-not-found":
          errorMessage = "Aucun compte trouvé avec cet email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Mot de passe incorrect.";
          break;
        case "auth/invalid-credential":
          errorMessage = "Email ou mot de passe incorrect.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Trop de tentatives. Réessayez plus tard.";
          break;
        default:
          errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError(null);
    setIsLoading(true);

    try {
      // Utiliser l'email stocké dans le state au lieu de auth.currentUser
      if (email) {
        const db = getFirestore();
        const docRef = await addDoc(collection(db, "emailVerificationRequests"), {
          email: email,
          timestamp: new Date(),
        });
        console.log("Document ajouté avec ID:", docRef.id);
        alert(
          "Email de vérification renvoyé. Vérifiez votre boîte de réception."
        );
      } else {
        setError("Aucun email trouvé. Veuillez vous reconnecter.");
      }
    } catch (err) {
      console.error("Erreur lors de l'ajout du document:", err);
      let errorMessage = "Erreur lors de l'envoi de l'email de vérification.";
      switch (err.code) {
        case "auth/too-many-requests":
          errorMessage = "Trop de tentatives. Réessayez plus tard.";
          break;
        case "auth/user-token-expired":
          errorMessage = "Session expirée. Veuillez vous reconnecter.";
          break;
        case "permission-denied":
          errorMessage = "Permissions insuffisantes. Veuillez vous reconnecter.";
          break;
        default:
          errorMessage = err.message || "Erreur réseau. Réessayez plus tard.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissError = () => {
    setError(null);
  };

  const getPageTitle = () => {
    if (showForgotPassword) return "Mot de passe oublié";
    if (isSignedUp) return "Vérification email";
    if (showChangePasswordModal) return "Réinitialiser le mot de passe";
    return "Connexion";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md -mt-20">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bienvenue</h1>
          <p className="text-gray-600">
            {showForgotPassword
              ? "Réinitialisez votre mot de passe"
              : isSignedUp
              ? "Vérifiez votre email"
              : showChangePasswordModal
              ? "Définissez un nouveau mot de passe"
              : "Connectez-vous à votre compte"}
          </p>
        </div>

        <ErrorMessage error={error} onDismiss={dismissError} />

        {isLoading && (
          <div className="mb-6">
            <LoadingSpinner
              message={
                showForgotPassword
                  ? "Envoi de l'email..."
                  : isSignedUp
                  ? "Envoi de la vérification..."
                  : showChangePasswordModal
                  ? "Vérification en cours..."
                  : "Connexion en cours..."
              }
              size="medium"
            />
          </div>
        )}

        {!showForgotPassword && !isSignedUp && !showChangePasswordModal ? (
          <AuthForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            handleAuth={handleAuth}
            isLoading={isLoading}
            setShowForgotPassword={setShowForgotPassword}
          />
        ) : showForgotPassword ? (
          <ForgotPasswordForm
            email={email}
            setEmail={setEmail}
            setError={setError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setShowForgotPassword={setShowForgotPassword}
          />
        ) : isSignedUp ? (
          <VerificationMessage
            handleResendVerification={handleResendVerification}
            isLoading={isLoading}
            setIsSignedUp={setIsSignedUp}
          />
        ) : (
          <ChangePasswordModal
            isOpen={showChangePasswordModal}
            onClose={() => {
              setShowChangePasswordModal(false);
              setResetOobCode("");
              navigate("/auth", { replace: true });
            }}
            isResetMode={true}
            oobCode={resetOobCode}
            setError={setError}
          />
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            En vous connectant, vous acceptez nos{" "}
            <a href="#" className="text-blue-600 hover:underline">
              conditions d'utilisation
            </a>{" "}
            et notre{" "}
            <a href="#" className="text-blue-600 hover:underline">
              politique de confidentialité
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
