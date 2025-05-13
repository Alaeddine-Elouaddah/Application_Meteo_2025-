import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";

const API_BASE_URL = "http://localhost:8000/api/v1";

Modal.setAppElement("#root");

const customModalStyles = (darkMode) => ({
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    maxWidth: "500px",
    width: "90%",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "none",
    padding: "0",
    overflow: "hidden",
    backgroundColor: darkMode ? "#1f2937" : "#ffffff",
    color: darkMode ? "#f3f4f6" : "#111827",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
});

const Users = ({ darkMode }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const usersPerPage = 10;

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData =
        data.data?.users || data.users || (Array.isArray(data) ? data : []);
      setUsers(usersData);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors du chargement des utilisateurs"
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const refreshUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData =
        data.data?.users || data.users || (Array.isArray(data) ? data : []);
      setUsers(usersData);
    } catch (error) {
      toast.error("Erreur lors du rafraîchissement des utilisateurs");
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/users/${userId}/active-status`,
        { active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refreshUsers();
      toast.success(
        `Utilisateur ${!currentStatus ? "activé" : "désactivé"} avec succès`
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du statut"
      );
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
    });
    setErrors({});
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/users/${userToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshUsers();
      toast.success("Utilisateur supprimé avec succès");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la suppression de l'utilisateur"
      );
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const openUserModal = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setFormData({
        username: user.username || "",
        email: user.email || "",
        password: "",
      });
    } else {
      setCurrentUser(null);
      resetForm();
    }
    setErrors({});
    setIsUserModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim())
      newErrors.username = "Le nom d'utilisateur est requis";
    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    if (!currentUser) {
      if (!formData.password) {
        newErrors.password = "Le mot de passe est requis";
      } else if (formData.password.length < 8) {
        newErrors.password =
          "Le mot de passe doit contenir au moins 8 caractères";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentification requise");
        return;
      }

      if (currentUser) {
        // Mise à jour d'un utilisateur existant
        const updateData = {
          username: formData.username,
          ...(formData.password && { password: formData.password }),
        };

        await axios.patch(
          `${API_BASE_URL}/users/${currentUser._id}`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        await refreshUsers();
        toast.success("Utilisateur mis à jour avec succès");
      } else {
        // Création d'un nouvel utilisateur
        try {
          // Vérification de l'email
          await axios.get(
            `${API_BASE_URL}/users/check-email/${formData.email}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          // Création de l'utilisateur
          await axios.post(
            `${API_BASE_URL}/users`,
            {
              username: formData.username,
              email: formData.email,
              password: formData.password,
              role: "user",
              active: true,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          await refreshUsers();
          setSearchTerm("");
          setCurrentPage(1);
          toast.success("Utilisateur créé avec succès");
        } catch (error) {
          if (error.response?.status === 400) {
            toast.error("Cet email est déjà utilisé");
            return;
          }
          throw error;
        }
      }

      setIsUserModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Erreur:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Une erreur s'est produite lors de l'opération";
      toast.error(errorMessage);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!user) return false;
    const username = user.username || "";
    const email = user.email || "";
    return (
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center h-screen ${
          darkMode ? "bg-gray-900" : "bg-white"
        }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`container mx-auto px-4 py-8 min-h-screen ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"
      }`}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
      />

      <h1
        className={`text-3xl font-bold mb-8 ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        Gestion des Utilisateurs
      </h1>

      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "border-gray-300"
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button
          onClick={() => openUserModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
        >
          + Ajouter un utilisateur
        </button>
      </div>

      <div
        className={`rounded-lg shadow overflow-hidden ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
              <tr>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Nom
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Email
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Rôle
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Statut
                </th>
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                darkMode
                  ? "divide-gray-700 bg-gray-800"
                  : "divide-gray-200 bg-white"
              }`}
            >
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <tr
                    key={user?._id}
                    className={
                      darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                            darkMode ? "bg-gray-600" : "bg-gray-200"
                          }`}
                        >
                          {user?.username?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {user?.username || "Inconnu"}
                        </div>
                      </div>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {user?.email || "Non renseigné"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user?.role === "admin"
                            ? darkMode
                              ? "bg-purple-900 text-purple-200"
                              : "bg-purple-100 text-purple-800"
                            : darkMode
                            ? "bg-green-900 text-green-200"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user?.role || "user"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user?.active
                            ? darkMode
                              ? "bg-green-900 text-green-200"
                              : "bg-green-100 text-green-800"
                            : darkMode
                            ? "bg-red-900 text-red-200"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user?.active ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            toggleUserStatus(user?._id, user?.active)
                          }
                          className={`px-3 py-1 text-xs rounded transition ${
                            user?.active
                              ? darkMode
                                ? "bg-orange-900 text-orange-200 hover:bg-orange-800"
                                : "bg-orange-100 text-orange-800 hover:bg-orange-200"
                              : darkMode
                              ? "bg-green-900 text-green-200 hover:bg-green-800"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          {user?.active ? "Désactiver" : "Activer"}
                        </button>
                        <button
                          onClick={() => openUserModal(user)}
                          className={`px-3 py-1 text-xs rounded hover:bg-blue-200 transition ${
                            darkMode
                              ? "bg-blue-900 text-blue-200 hover:bg-blue-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => confirmDelete(user)}
                          className={`px-3 py-1 text-xs rounded hover:bg-red-200 transition ${
                            darkMode
                              ? "bg-red-900 text-red-200 hover:bg-red-800"
                              : "bg-red-100 text-red-800"
                          }`}
                          disabled={user?.role === "admin"}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className={`px-6 py-4 text-center ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredUsers.length > usersPerPage && (
          <div
            className={`px-4 py-3 flex items-center justify-between border-t ${
              darkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            } sm:px-6`}
          >
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
                  darkMode
                    ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                } disabled:opacity-50`}
              >
                Précédent
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
                  darkMode
                    ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                } disabled:opacity-50`}
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Affichage{" "}
                  <span className="font-medium">{indexOfFirstUser + 1}</span> à{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastUser, filteredUsers.length)}
                  </span>{" "}
                  sur{" "}
                  <span className="font-medium">{filteredUsers.length}</span>{" "}
                  résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                      darkMode
                        ? "border-gray-600 text-gray-400 bg-gray-700 hover:bg-gray-600"
                        : "border-gray-300 text-gray-500 bg-white hover:bg-gray-50"
                    } disabled:opacity-50`}
                  >
                    <span className="sr-only">Précédent</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? darkMode
                              ? "z-10 bg-blue-900 border-blue-700 text-blue-100"
                              : "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : darkMode
                            ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                      darkMode
                        ? "border-gray-600 text-gray-400 bg-gray-700 hover:bg-gray-600"
                        : "border-gray-300 text-gray-500 bg-white hover:bg-gray-50"
                    } disabled:opacity-50`}
                  >
                    <span className="sr-only">Suivant</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        style={customModalStyles(darkMode)}
        contentLabel="Confirmer la suppression"
      >
        <div
          className={`rounded-lg p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}
        >
          <h2
            className={`text-xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Confirmer la suppression
          </h2>
          <p className={`mb-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur{" "}
            <strong className="text-red-600">{userToDelete?.username}</strong> ?
            Cette action est irréversible.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className={`px-4 py-2 border rounded-md transition ${
                darkMode
                  ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              disabled={userToDelete?.role === "admin"}
            >
              Confirmer la suppression
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isUserModalOpen}
        onRequestClose={() => setIsUserModalOpen(false)}
        style={customModalStyles(darkMode)}
        contentLabel={
          currentUser ? "Modifier utilisateur" : "Ajouter utilisateur"
        }
      >
        <div
          className={`rounded-lg p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}
        >
          <h2
            className={`text-xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {currentUser
              ? "Modifier l'utilisateur"
              : "Ajouter un nouvel utilisateur"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className={`block text-sm font-bold mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Nom d'utilisateur
              </label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.username
                    ? "border-red-500"
                    : darkMode
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300"
                }`}
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>
            <div className="mb-4">
              <label
                className={`block text-sm font-bold mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Email
              </label>
              <input
                type="email"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email
                    ? "border-red-500"
                    : darkMode
                    ? "border-gray-600 bg-gray-700 text-white"
                    : "border-gray-300"
                }`}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={currentUser !== null}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            {!currentUser && (
              <div className="mb-4">
                <label
                  className={`block text-sm font-bold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Mot de passe (minimum 8 caractères)
                </label>
                <input
                  type="password"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password
                      ? "border-red-500"
                      : darkMode
                      ? "border-gray-600 bg-gray-700 text-white"
                      : "border-gray-300"
                  }`}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>
            )}
            {currentUser && (
              <div className="mb-4">
                <label
                  className={`block text-sm font-bold mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Rôle
                </label>
                <div
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode
                      ? "border-gray-600 bg-gray-700 text-white"
                      : "border-gray-300 bg-gray-100"
                  }`}
                >
                  {currentUser.role === "admin"
                    ? "Administrateur"
                    : "Utilisateur"}
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className={`px-4 py-2 border rounded-md transition ${
                  darkMode
                    ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                }`}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                {currentUser
                  ? "Enregistrer les modifications"
                  : "Créer l'utilisateur"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};
export default Users;
