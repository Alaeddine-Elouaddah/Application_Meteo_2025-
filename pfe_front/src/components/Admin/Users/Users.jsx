import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

// Icônes
import {
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaPlus,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

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
    newPassword: "",
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
        `${API_BASE_URL}/users/${userId}/toggle-status`,
        { isActive: !currentStatus },
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
      newPassword: "",
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
        newPassword: "",
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

    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    if (!currentUser && !formData.password) {
      newErrors.password = "Le mot de passe est requis";
    } else if (!currentUser && formData.password.length < 8) {
      newErrors.password =
        "Le mot de passe doit contenir au moins 8 caractères";
    }

    if (
      currentUser &&
      formData.newPassword &&
      formData.newPassword.length < 8
    ) {
      newErrors.newPassword =
        "Le nouveau mot de passe doit contenir au moins 8 caractères";
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
        const updateData = {
          username: formData.username,
          email: formData.email,
        };

        if (formData.newPassword) {
          updateData.password = formData.newPassword;
        }

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
        try {
          await axios.get(
            `${API_BASE_URL}/users/check-email/${formData.email}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          await axios.post(
            `${API_BASE_URL}/users`,
            {
              username: formData.username,
              email: formData.email,
              password: formData.password,
              role: "user",
              isActive: true,
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

  const formatDate = (dateString) => {
    if (!dateString) return "Jamais connecté";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const filteredUsers = users.filter((user) => {
    if (!user) return false;

    const searchFields = [
      user.username || "",
      user.email || "",
      user.role || "",
      user.isActive ? "actif" : "inactif",
      formatDate(user.lastLogin),
    ]
      .join(" ")
      .toLowerCase();

    return searchFields.includes(searchTerm.toLowerCase());
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
      className={`container mx-auto px-2 sm:px-4 py-4 min-h-screen ${
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
        className={`text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        Gestion des Utilisateurs
      </h1>

      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2 sm:gap-4">
        <div className="relative w-full sm:w-64 md:w-96">
          <input
            type="text"
            placeholder="Rechercher..."
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "border-gray-300"
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute right-3 top-2.5 text-gray-400" />
        </div>
        <button
          onClick={() => openUserModal()}
          className="px-3 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap flex items-center justify-center gap-2"
          data-tooltip-id="action-tooltip"
          data-tooltip-content="Ajouter un nouvel utilisateur"
        >
          <FaPlus className="text-xs sm:text-sm" />
          <span className="hidden sm:inline">Ajouter un utilisateur</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      <div
        className={`rounded-lg shadow overflow-x-auto ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
            <tr>
              <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium uppercase tracking-wider">
                <span className={darkMode ? "text-gray-300" : "text-gray-500"}>
                  Nom
                </span>
              </th>
              <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium uppercase tracking-wider hidden sm:table-cell">
                <span className={darkMode ? "text-gray-300" : "text-gray-500"}>
                  Email
                </span>
              </th>
              <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell">
                <span className={darkMode ? "text-gray-300" : "text-gray-500"}>
                  Rôle
                </span>
              </th>
              <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium uppercase tracking-wider">
                <span className={darkMode ? "text-gray-300" : "text-gray-500"}>
                  Statut
                </span>
              </th>
              <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium uppercase tracking-wider hidden lg:table-cell">
                <span className={darkMode ? "text-gray-300" : "text-gray-500"}>
                  Dernière connexion
                </span>
              </th>
              <th className="px-2 py-2 sm:px-3 sm:py-3 text-left text-xs font-medium uppercase tracking-wider">
                <span className={darkMode ? "text-gray-300" : "text-gray-500"}>
                  Actions
                </span>
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
                  <td className="px-2 py-3 sm:px-3 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center mr-2 sm:mr-3 ${
                          darkMode ? "bg-gray-600" : "bg-gray-200"
                        }`}
                      >
                        {user?.username?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-none ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {user?.username || "Inconnu"}
                        </span>
                        <span className="text-xs sm:hidden text-gray-500 truncate max-w-[100px]">
                          {user?.email || "Non renseigné"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3 sm:px-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm hidden sm:table-cell">
                    <span
                      className={darkMode ? "text-gray-300" : "text-gray-500"}
                    >
                      {user?.email || "Non renseigné"}
                    </span>
                  </td>
                  <td className="px-2 py-3 sm:px-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
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
                  <td className="px-2 py-3 sm:px-3 sm:py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user?.isActive
                          ? darkMode
                            ? "bg-green-900 text-green-200"
                            : "bg-green-100 text-green-800"
                          : darkMode
                          ? "bg-red-900 text-red-200"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <span className="hidden sm:inline">
                        {user?.isActive ? "Actif" : "Inactif"}
                      </span>
                      <span className="sm:hidden">
                        {user?.isActive ? "A" : "I"}
                      </span>
                    </span>
                  </td>
                  <td className="px-2 py-3 sm:px-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm hidden lg:table-cell">
                    <span
                      className={darkMode ? "text-gray-300" : "text-gray-500"}
                    >
                      {formatDate(user?.lastLogin)}
                    </span>
                  </td>
                  <td className="px-2 py-3 sm:px-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <button
                        onClick={() =>
                          toggleUserStatus(user?._id, user?.isActive)
                        }
                        className={`p-1 sm:p-2 rounded-full transition ${
                          user?.isActive
                            ? darkMode
                              ? "text-orange-400 hover:bg-orange-900"
                              : "text-orange-600 hover:bg-orange-100"
                            : darkMode
                            ? "text-green-400 hover:bg-green-900"
                            : "text-green-600 hover:bg-green-100"
                        }`}
                        data-tooltip-id="action-tooltip"
                        data-tooltip-content={
                          user?.isActive
                            ? "Désactiver l'utilisateur"
                            : "Activer l'utilisateur"
                        }
                      >
                        {user?.isActive ? (
                          <FaToggleOn size={16} />
                        ) : (
                          <FaToggleOff size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => openUserModal(user)}
                        className={`p-1 sm:p-2 rounded-full transition ${
                          darkMode
                            ? "text-blue-400 hover:bg-blue-900"
                            : "text-blue-600 hover:bg-blue-100"
                        }`}
                        data-tooltip-id="action-tooltip"
                        data-tooltip-content="Modifier l'utilisateur"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => confirmDelete(user)}
                        className={`p-1 sm:p-2 rounded-full transition ${
                          darkMode
                            ? "text-red-400 hover:bg-red-900"
                            : "text-red-600 hover:bg-red-100"
                        }`}
                        disabled={user?.role === "admin"}
                        data-tooltip-id="action-tooltip"
                        data-tooltip-content={
                          user?.role === "admin"
                            ? "Impossible de supprimer un admin"
                            : "Supprimer l'utilisateur"
                        }
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className={`px-4 py-4 text-center ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Aucun utilisateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {filteredUsers.length > usersPerPage && (
          <div
            className={`px-2 sm:px-4 py-3 flex items-center justify-between border-t ${
              darkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-3 py-1.5 border rounded-md text-xs font-medium ${
                  darkMode
                    ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                } disabled:opacity-50`}
              >
                Précédent
              </button>
              <span
                className={`px-3 py-1.5 text-xs ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-3 py-1.5 border rounded-md text-xs font-medium ${
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
                  className={`text-xs sm:text-sm ${
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
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-xs sm:text-sm font-medium ${
                      darkMode
                        ? "border-gray-600 text-gray-400 bg-gray-700 hover:bg-gray-600"
                        : "border-gray-300 text-gray-500 bg-white hover:bg-gray-50"
                    } disabled:opacity-50`}
                  >
                    <span className="sr-only">Précédent</span>
                    <FaChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border text-xs sm:text-sm font-medium ${
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
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-xs sm:text-sm font-medium ${
                      darkMode
                        ? "border-gray-600 text-gray-400 bg-gray-700 hover:bg-gray-600"
                        : "border-gray-300 text-gray-500 bg-white hover:bg-gray-50"
                    } disabled:opacity-50`}
                  >
                    <span className="sr-only">Suivant</span>
                    <FaChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
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
          className={`rounded-lg p-4 sm:p-6 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2
            className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Confirmer la suppression
          </h2>
          <p
            className={`mb-4 sm:mb-6 ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur{" "}
            <strong className="text-red-600">{userToDelete?.username}</strong> ?
            Cette action est irréversible.
          </p>
          <div className="flex justify-end space-x-2 sm:space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 border rounded-md text-xs sm:text-sm transition ${
                darkMode
                  ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-xs sm:text-sm"
              disabled={userToDelete?.role === "admin"}
            >
              Supprimer
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
          className={`rounded-lg p-4 sm:p-6 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h2
            className={`text-lg sm:text-xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {currentUser
              ? "Modifier l'utilisateur"
              : "Ajouter un nouvel utilisateur"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3 sm:mb-4">
              <label
                className={`block text-xs sm:text-sm font-bold mb-1 sm:mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Nom d'utilisateur
              </label>
              <input
                type="text"
                className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
            <div className="mb-3 sm:mb-4">
              <label
                className={`block text-xs sm:text-sm font-bold mb-1 sm:mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Email
              </label>
              <input
                type="email"
                className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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

            {!currentUser ? (
              <div className="mb-3 sm:mb-4">
                <label
                  className={`block text-xs sm:text-sm font-bold mb-1 sm:mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Mot de passe (min 8 caractères)
                </label>
                <input
                  type="password"
                  className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
            ) : (
              <div className="mb-3 sm:mb-4">
                <label
                  className={`block text-xs sm:text-sm font-bold mb-1 sm:mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.newPassword
                      ? "border-red-500"
                      : darkMode
                      ? "border-gray-600 bg-gray-700 text-white"
                      : "border-gray-300"
                  }`}
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  placeholder="Laisser vide pour ne pas modifier"
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>
            )}

            {currentUser && (
              <div className="mb-3 sm:mb-4">
                <label
                  className={`block text-xs sm:text-sm font-bold mb-1 sm:mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Rôle
                </label>
                <div
                  className={`w-full px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border rounded-md ${
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
            <div className="flex justify-end space-x-2 sm:space-x-3">
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 border rounded-md text-xs sm:text-sm transition ${
                  darkMode
                    ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                }`}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-xs sm:text-sm"
              >
                {currentUser ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <Tooltip id="action-tooltip" place="top" effect="solid" />
    </div>
  );
};

export default Users;
