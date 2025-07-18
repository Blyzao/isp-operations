import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import Auth from "./components/Auth.jsx";
import Navbar from "./components/Navbar.jsx";
import UsersTable from "./components/UsersTable.jsx";
import ZonesTable from "./components/parametre/ZonesTable.jsx";
import LieuxTable from "./components/parametre/LieuxTable.jsx";
import FirstConnectionPasswordForm from "./components/FirstConnectionPasswordForm.jsx";
import EquipesTable from "./components/parametre/EquipesTable.jsx";
import PersonnelsTable from "./components/parametre/PersonnelsTable.jsx";
import PatrouilleursTable from "./components/parametre/PatrouilleursTable.jsx";
import CamerasTable from "./components/parametre/CamerasTable.jsx";
import VehiculesTable from "./components/parametre/VehiculesTable.jsx";
import EmbarcationsTable from "./components/parametre/EmbarcationsTable.jsx";
import TypesMaterielTable from "./components/parametre/TypesMaterielTable.jsx";
import ResultatsAlerteTable from "./components/parametre/ResultatsAlerteTable.jsx";
import TypesDocumentTable from "./components/parametre/TypesDocumentTable.jsx";
import MotifsSaisieTable from "./components/parametre/MotifsSaisieTable.jsx";
import TypesIncidentTable from "./components/parametre/TypesIncidentTable.jsx";
import TypesCargaisonTable from "./components/parametre/TypesCargaisonTable.jsx";
import TypesProduitExportationTable from "./components/parametre/TypesProduitExportationTable.jsx";
import TypesProduitAvitaillementTable from "./components/parametre/TypesProduitAvitaillementTable.jsx";
import IncidentsTable from "./components/data/IncidentsTable.jsx";
import IncidentForm from "./components/data/IncidentForm.jsx";

const ProtectedRoute = ({ children, user, requiredRoles }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (requiredRoles) {
      const checkRole = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (
          !userDoc.exists() ||
          (Array.isArray(requiredRoles)
            ? !requiredRoles.includes(userDoc.data().profil)
            : userDoc.data().profil !== requiredRoles)
        ) {
          navigate("/");
        }
      };
      checkRole();
    }
  }, [user, requiredRoles, navigate]);
  return user ? children : null;
};

function App() {
  const [user] = useAuthState(auth);
  const [userProfile, setUserProfile] = useState(null);
  const [isFirstConnection, setIsFirstConnection] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showFirstConnection, setShowFirstConnection] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      setLoadingProfile(false);
      setShowFirstConnection(false);
      return;
    }

    const checkUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);
          const isFirstConnect = userData.firstConnect === true;
          setIsFirstConnection(isFirstConnect);
          setShowFirstConnection(isFirstConnect);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du profil:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    checkUserProfile();
  }, [user, navigate]);

  const handleFirstConnectionComplete = () => {
    setIsFirstConnection(false);
    setShowFirstConnection(false);
    navigate("/");
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (user && showFirstConnection) {
    return (
      <FirstConnectionPasswordForm
        user={user}
        onComplete={handleFirstConnectionComplete}
      />
    );
  }

  const Layout = ({ children }) => (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      <div className="container mx-auto px-4 pt-20 pb-6">{children}</div>
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
                  Plateforme sécurisée de gestion des données des opérations de
                  sûreté
                </p>
              </div>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute user={user} requiredRoles="admin">
            <Layout>
              <UsersTable />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parametres/zones"
        element={
          <ProtectedRoute user={user} requiredRoles={["admin", "superviseur"]}>
            <Layout>
              <ZonesTable />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parametres/lieux"
        element={
          <ProtectedRoute user={user} requiredRoles={["admin", "superviseur"]}>
            <Layout>
              <LieuxTable />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parametres/equipe"
        element={
          <ProtectedRoute user={user} requiredRoles={["admin", "superviseur"]}>
            <Layout>
              <EquipesTable />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parametres/personnels"
        element={
          <ProtectedRoute user={user} requiredRoles={["admin", "superviseur"]}>
            <Layout>
              <PersonnelsTable />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parametres/patrouilleurs"
        element={
          <ProtectedRoute user={user} requiredRoles={["admin", "superviseur"]}>
            <Layout>
              <PatrouilleursTable />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parametres/cameras"
        element={
          <ProtectedRoute user={user} requiredRoles={["admin", "superviseur"]}>
            <Layout>
              <CamerasTable />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parametres/vehicule"
        element={
          <ProtectedRoute user={user} requiredRoles={["admin", "superviseur"]}>
            <Layout>
              <VehiculesTable />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parametres/type-embarcations"
        element={
          <ProtectedRoute user={user} requiredRoles={["admin", "superviseur"]}>
            <Layout>
              <EmbarcationsTable />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parametres/type-materiel"
        element={
          <ProtectedRoute user={user} requiredRoles={["admin", "superviseur"]}>
            <Layout>
              <TypesMaterielTable />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parametres/resultats-alerte"
        element={
          <ProtectedRoute user={user} requiredRoles={["admin", "superviseur"]}>
            <Layout>
              <ResultatsAlerteTable />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parametres/type-document"
        element={
          <ProtectedRoute user={user} requiredRoles={["admin", "superviseur"]}>
            <Layout>
              <TypesDocumentTable />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parametres/motifs-saisie"
        element={
          <ProtectedRoute user={user} requiredRoles={["admin", "superviseur"]}>
            <Layout>
              <MotifsSaisieTable />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parametres/type-incident"
        element={
          <ProtectedRoute user={user} requiredRoles={["admin", "superviseur"]}>
            <Layout>
              <TypesIncidentTable />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parametres/type-cargaison"
        element={
          <ProtectedRoute user={user} requiredRoles={["admin", "superviseur"]}>
            <Layout>
              <TypesCargaisonTable />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parametres/type-produits-exportation"
        element={
          <ProtectedRoute user={user} requiredRoles={["admin", "superviseur"]}>
            <Layout>
              <TypesProduitExportationTable />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/parametres/type-provision-bord"
        element={
          <ProtectedRoute user={user} requiredRoles={["admin", "superviseur"]}>
            <Layout>
              <TypesProduitAvitaillementTable />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/operations/incidents"
        element={
          <ProtectedRoute
            user={user}
            requiredRoles={["admin", "superviseur", "user"]}
          >
            <Layout>
              <IncidentsTable />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/operations/incidents/new"
        element={
          <ProtectedRoute
            user={user}
            requiredRoles={["admin", "superviseur", "user"]}
          >
            <Layout>
              <IncidentForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/operations/incidents/edit/:id"
        element={
          <ProtectedRoute
            user={user}
            requiredRoles={["admin", "superviseur", "user"]}
          >
            <Layout>
              <IncidentForm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/operations/incidents/view/:id"
        element={
          <ProtectedRoute
            user={user}
            requiredRoles={["admin", "superviseur", "user"]}
          >
            <Layout>
              <IncidentForm />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
