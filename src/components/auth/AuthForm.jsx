import React from "react";
import { Mail, Lock, Eye, EyeOff, LogIn, HelpCircle } from "lucide-react";

function AuthForm({
  email,
  setEmail,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  handleAuth,
  isLoading,
  setShowForgotPassword,
  showPassword,
  setShowPassword,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Connexion</h2>
            <p className="text-blue-100 text-sm">Accédez à votre compte</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-8">
        <form className="space-y-6" onSubmit={handleAuth}>
          {/* Email */}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Lock className="w-4 h-4" />
              <span>Mot de passe</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center relative group">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-md cursor-pointer transition-all duration-200"
            />
            <label
              htmlFor="rememberMe"
              className="text-gray-700 text-sm cursor-pointer select-none font-medium flex items-center space-x-2"
            >
              <span>Se souvenir de moi</span>
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </label>
            <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-xl p-3 -top-14 left-0 whitespace-nowrap opacity-95 shadow-lg transition-all duration-200 transform group-hover:-translate-y-1 z-10">
              <div className="relative">
                Ne cochez pas sur un appareil partagé
                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
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
                <span>Connexion en cours...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Se connecter</span>
              </>
            )}
          </button>

          {/* Forgot Password */}
          <div className="pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1 w-full"
              disabled={isLoading}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Mot de passe oublié ?</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthForm;
