import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  Users,
  UserPlus,
  Edit3,
  UserCheck,
  UserX,
  Shield,
  User,
  Mail,
  Search,
  Filter,
  Briefcase,
} from "lucide-react";
import UserFormModal from "./UserFormModal";

function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProfile, setFilterProfile] = useState("all");
  const [filterEmailProfil, setFilterEmailProfil] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        nom: doc.data().nom || "N/A",
        email: doc.data().email || "N/A",
        profil: doc.data().profil || "user",
        emailProfil: doc.data().emailProfil || "niveau1",
        fonction: doc.data().fonction || "N/A",
        active: doc.data().active !== false,
      }));
      setUsers(usersList);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (userId) => {
    setEditUserId(userId);
    setModalOpen(true);
  };

  const handleNewUser = () => {
    setEditUserId(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditUserId(null);
    fetchUsers();
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fonction.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.active) ||
      (filterStatus === "inactive" && !user.active);
    const matchesProfile =
      filterProfile === "all" || user.profil === filterProfile;
    const matchesEmailProfil =
      filterEmailProfil === "all" || user.emailProfil === filterEmailProfil;
    return (
      matchesSearch && matchesStatus && matchesProfile && matchesEmailProfil
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Utilisateurs
                </h1>
                <p className="text-gray-600 text-sm">Gestion des comptes</p>
              </div>
            </div>
            <button
              onClick={handleNewUser}
              className="flex items-center space-x-1 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nouvel utilisateur</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou fonction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-8 pr-6 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">Tous statuts</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>
              </div>
              <select
                value={filterProfile}
                onChange={(e) => setFilterProfile(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Tous profils</option>
                <option value="admin">Administrateur</option>
                <option value="superviseur">Superviseur</option>
                <option value="user">Utilisateur</option>
              </select>
              <select
                value={filterEmailProfil}
                onChange={(e) => setFilterEmailProfil(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">Tous email profils</option>
                <option value="niveau1">Niveau 1</option>
                <option value="niveau2">Niveau 2</option>
                <option value="niveau3">Niveau 3</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">
                {users.filter((u) => u.active).length} actifs
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs text-gray-600">
                {users.filter((u) => !u.active).length} inactifs
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3 text-blue-600" />
              <span className="text-xs text-gray-600">
                {users.filter((u) => u.profil === "admin").length} admins
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3 text-purple-600" />
              <span className="text-xs text-gray-600">
                {users.filter((u) => u.profil === "superviseur").length}{" "}
                superviseurs
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-gray-600">
                {users.filter((u) => u.emailProfil === "niveau1").length} niveau
                1
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-gray-600">
                {users.filter((u) => u.emailProfil === "niveau2").length} niveau
                2
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="w-3 h-3 text-blue-300" />
              <span className="text-xs text-gray-600">
                {users.filter((u) => u.emailProfil === "niveau3").length} niveau
                3
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">
                {searchTerm ||
                filterStatus !== "all" ||
                filterProfile !== "all" ||
                filterEmailProfil !== "all"
                  ? "Aucun utilisateur trouvé"
                  : "Aucun utilisateur"}
              </h3>
              <p className="text-gray-600 text-sm">
                {searchTerm ||
                filterStatus !== "all" ||
                filterProfile !== "all" ||
                filterEmailProfil !== "all"
                  ? "Modifiez vos critères de recherche"
                  : "Créez votre premier utilisateur"}
              </p>
              {!searchTerm &&
                filterStatus === "all" &&
                filterProfile === "all" &&
                filterEmailProfil === "all" && (
                  <button
                    onClick={handleNewUser}
                    className="mt-4 flex items-center space-x-1 mx-auto bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Créer un utilisateur</span>
                  </button>
                )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>Utilisateur</span>
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Profil
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Email Profil
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      <div className="flex items-center space-x-1">
                        <Briefcase className="w-4 h-4" />
                        <span>Fonction</span>
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Statut
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium
                            ${
                              user.profil === "admin"
                                ? "bg-gradient-to-r from-blue-600 to-blue-700"
                                : user.profil === "superviseur"
                                ? "bg-gradient-to-r from-purple-500 to-purple-600"
                                : "bg-gradient-to-r from-gray-500 to-gray-600"
                            }`}
                          >
                            {user.nom.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.nom}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                            ${
                              user.profil === "admin"
                                ? "bg-blue-100 text-blue-800"
                                : user.profil === "superviseur"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {user.profil === "admin" ? (
                            <Shield className="w-3 h-3" />
                          ) : user.profil === "superviseur" ? (
                            <Shield className="w-3 h-3" />
                          ) : (
                            <User className="w-3 h-3" />
                          )}
                          <span>
                            {user.profil === "admin"
                              ? "Administrateur"
                              : user.profil === "superviseur"
                              ? "Superviseur"
                              : "Utilisateur"}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                            ${
                              user.emailProfil === "niveau1"
                                ? "bg-blue-100 text-blue-800"
                                : user.emailProfil === "niveau2"
                                ? "bg-blue-200 text-blue-900"
                                : "bg-blue-300 text-blue-900"
                            }`}
                        >
                          <Mail className="w-3 h-3" />
                          <span>
                            {user.emailProfil === "niveau1"
                              ? "Niveau 1"
                              : user.emailProfil === "niveau2"
                              ? "Niveau 2"
                              : "Niveau 3"}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {user.fonction}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                            ${
                              user.active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                        >
                          {user.active ? (
                            <UserCheck className="w-3 h-3" />
                          ) : (
                            <UserX className="w-3 h-3" />
                          )}
                          <span>{user.active ? "Actif" : "Inactif"}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleEdit(user.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all duration-200 text-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Modifier</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filteredUsers.length > 0 && (
          <div className="mt-4 text-center text-gray-600 text-sm">
            Affichage de {filteredUsers.length} utilisateur
            {filteredUsers.length > 1 ? "s" : ""}
            {users.length !== filteredUsers.length &&
              ` sur ${users.length} au total`}
          </div>
        )}

        <UserFormModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          userId={editUserId}
          isEditMode={!!editUserId}
        />
      </div>
    </div>
  );
}

export default UsersTable;
