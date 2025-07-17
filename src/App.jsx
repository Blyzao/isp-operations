import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import Auth from "./components/Auth.jsx";
import Navbar from "./components/Navbar.jsx";
import UsersTable from "./components/UsersTable.jsx";

const ProtectedRoute = ({ children, user, requiredRole }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (requiredRole) {
      const checkRole = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists() || userDoc.data().profil !== requiredRole) {
          navigate("/");
        }
      };
      checkRole();
    }
  }, [user, requiredRole, navigate]);
  return user ? children : null;
};

function App() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const Layout = ({ children }) => (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <div className="container mx-auto px-4 py-6">{children}</div>
    </div>
  );

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/"
        element={
          <ProtectedRoute user={user}>
            <Layout>
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  Bienvenue sur Nexion
                </h1>
                <p className="text-gray-600">
                  Plateforme sécurisée de gestion des données des opérations de sûreté
                </p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute user={user} requiredRole="admin">
            <Layout>
              <UsersTable />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
