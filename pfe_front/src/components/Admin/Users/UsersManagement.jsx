// src/components/Admin/Users/UsersManagement.jsx
import { useState, useEffect } from "react";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiUser,
  FiMail,
  FiLock,
  FiBriefcase,
  FiChevronDown,
  FiCheck,
  FiX,
  FiAlertTriangle,
} from "react-icons/fi";
import axios from "axios";
import { API_URL } from "../../../config";

const UsersManagement = () => {
  // Données des utilisateurs
  const [users, setUsers] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour les modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Animation states
  const [modalAnimation, setModalAnimation] = useState("scale-95 opacity-0");
  const [tableRowAnimation, setTableRowAnimation] = useState("");

  // Notifications
  const [notifications, setNotifications] = useState([]);

  // Formulaire
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Collaborateur",
    supervisor: "",
  });

  // Chargement des données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, collaboratorsRes] = await Promise.all([
          axios.get(`${API_URL}/api/v1/users`),
          axios.get(`${API_URL}/api/v1/users/collaborators`),
        ]);

        setUsers(usersRes.data.data.users);
        setCollaborators(collaboratorsRes.data.data.collaborators);
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.message || "Erreur de chargement des données"
        );
        setLoading(false);
        showNotification(
          err.response?.data?.message || "Erreur de chargement des données",
          "error"
        );
      }
    };

    fetchData();
  }, []);

  // Gestion des notifications
  const showNotification = (message, type) => {
    const id = Date.now();
    const newNotification = { id, message, type };

    setNotifications((prev) => [...prev, newNotification]);

    // Supprimer la notification après 3 secondes
    setTimeout(() => {
      removeNotification(id);
    }, 3000);
  };

  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  // Gestion des changements du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Animation d'ouverture de modal
  const openModal = () => {
    setModalAnimation("scale-95 opacity-0");
    setTimeout(() => {
      setModalAnimation("scale-100 opacity-100");
    }, 10);
  };

  // Animation de fermeture de modal
  const closeModal = (setModal) => {
    setModalAnimation("scale-95 opacity-0");
    setTimeout(() => {
      setModal(false);
    }, 200);
  };

  // Ajouter un utilisateur avec animation
  const handleAddUser = async () => {
    try {
      const response = await axios.post(`${API_URL}/api/v1/users`, formData);

      // Animation d'ajout
      setTableRowAnimation("animate-fadeIn");
      setTimeout(() => {
        setUsers([...users, response.data.data.user]);
        setTableRowAnimation("");
      }, 100);

      showNotification("Utilisateur ajouté avec succès", "success");
      closeModal(setShowAddModal);
      resetForm();
    } catch (err) {
      showNotification(
        err.response?.data?.message ||
          "Erreur lors de l'ajout de l'utilisateur",
        "error"
      );
    }
  };

  // Préparer la modification
  const prepareEdit = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      supervisor: user.supervisor || "",
    });
    setShowEditModal(true);
    openModal();
  };

  // Modifier un utilisateur avec animation
  const handleEditUser = async () => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/v1/users/${currentUser._id}`,
        formData
      );

      // Animation de modification
      setTableRowAnimation("animate-pulse");
      setTimeout(() => {
        setUsers(
          users.map((user) =>
            user._id === currentUser._id ? response.data.data.user : user
          )
        );
        setTableRowAnimation("");
      }, 300);

      showNotification("Utilisateur modifié avec succès", "success");
      closeModal(setShowEditModal);
      resetForm();
    } catch (err) {
      showNotification(
        err.response?.data?.message ||
          "Erreur lors de la modification de l'utilisateur",
        "error"
      );
    }
  };

  // Supprimer un utilisateur avec animation
  const handleDeleteUser = async () => {
    try {
      await axios.delete(`${API_URL}/api/v1/users/${currentUser._id}`);

      // Animation de suppression
      setTableRowAnimation("animate-fadeOut");
      setTimeout(() => {
        setUsers(users.filter((user) => user._id !== currentUser._id));
        setTableRowAnimation("");
      }, 300);

      showNotification("Utilisateur supprimé avec succès", "success");
      closeModal(setShowDeleteModal);
    } catch (err) {
      showNotification(
        err.response?.data?.message ||
          "Erreur lors de la suppression de l'utilisateur",
        "error"
      );
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "Collaborateur",
      supervisor: "",
    });
  };

  // Composant de notification
  const Notification = ({ message, type, onClose }) => {
    const bgColor = {
      success: "bg-green-100 border-green-400 text-green-700",
      error: "bg-red-100 border-red-400 text-red-700",
      warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
    }[type];

    const icon = {
      success: <FiCheck className="mr-2" />,
      error: <FiX className="mr-2" />,
      warning: <FiAlertTriangle className="mr-2" />,
    }[type];

    return (
      <div
        className={`${bgColor} border px-4 py-3 rounded-lg mb-2 flex items-center justify-between animate-fadeIn`}
      >
        <div className="flex items-center">
          {icon}
          <span>{message}</span>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-lg font-semibold opacity-70 hover:opacity-100"
        >
          &times;
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Tailwind animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(10px);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-fadeOut {
          animation: fadeOut 0.3s ease-out forwards;
        }
        .animate-pulse {
          animation: pulse 0.5s ease-in-out;
        }
      `}</style>

      {/* Container des notifications (en haut à droite) */}
      <div className="fixed top-4 right-4 z-50 w-80">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-2 animate-fadeIn">
        Gestion des utilisateurs
      </h1>
      <p className="text-gray-600 mb-6 animate-fadeIn delay-100">
        Ajoutez, modifiez ou supprimez des utilisateurs de la plateforme.
      </p>

      <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">
            Liste des utilisateurs
          </h2>
          <button
            onClick={() => {
              setShowAddModal(true);
              openModal();
            }}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            <FiPlus className="mr-2" /> Ajouter un utilisateur
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Superviseur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className={`${tableRowAnimation} transition-all duration-200 hover:bg-gray-50`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center transition-transform duration-200 hover:scale-110">
                        <FiUser className="text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        user.role === "Administrator"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "Collaborateur"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      } transition-colors duration-200`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.supervisor || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => prepareEdit(user)}
                      className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-200 transform hover:scale-110"
                    >
                      <FiEdit className="inline mr-1" /> Modifier
                    </button>
                    <button
                      onClick={() => {
                        setCurrentUser(user);
                        setShowDeleteModal(true);
                        openModal();
                      }}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200 transform hover:scale-110"
                    >
                      <FiTrash2 className="inline mr-1" /> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-200">
          <div
            className={`bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-200 ${modalAnimation}`}
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FiPlus className="mr-2 text-blue-600 animate-bounce" />
                Ajouter un nouvel utilisateur
              </h3>

              <div className="space-y-5">
                {/* Nom complet */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                    <FiUser className="mr-2 text-blue-500" />
                    Nom complet
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Ex: Jean Dupont"
                    required
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                    <FiMail className="mr-2 text-blue-500" />
                    Adresse email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Ex: jean.dupont@ocp.ma"
                    required
                  />
                </div>

                {/* Mot de passe */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                    <FiLock className="mr-2 text-blue-500" />
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="••••••••"
                    minLength="8"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum 8 caractères
                  </p>
                </div>

                {/* Rôle */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Rôle de l'utilisateur
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white pr-8"
                      required
                    >
                      <option value="Collaborateur">Collaborateur</option>
                      <option value="Stagiaire">Stagiaire</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <FiChevronDown className="text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Superviseur (conditionnel) */}
                {formData.role === "Stagiaire" && (
                  <div className="form-group animate-fadeIn">
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                      <FiBriefcase className="mr-2 text-blue-500" />
                      Superviseur
                    </label>
                    <div className="relative">
                      <select
                        name="supervisor"
                        value={formData.supervisor}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white pr-8"
                        required
                      >
                        <option value="">Sélectionner un superviseur</option>
                        {collaborators.map((collaborator) => (
                          <option
                            key={collaborator._id}
                            value={collaborator.name}
                          >
                            {collaborator.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <FiChevronDown className="text-gray-400" />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Obligatoire pour les stagiaires
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Boutons */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg border-t border-gray-200">
              <button
                type="button"
                onClick={() => closeModal(setShowAddModal)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAddUser}
                className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              >
                Créer l'utilisateur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Modification */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-200">
          <div
            className={`bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-200 ${modalAnimation}`}
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FiEdit className="mr-2 text-blue-600 animate-pulse" />
                Modifier l'utilisateur
              </h3>

              <div className="space-y-5">
                {/* Nom complet */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                    <FiUser className="mr-2 text-blue-500" />
                    Nom complet
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    required
                  />
                </div>

                {/* Email */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                    <FiMail className="mr-2 text-blue-500" />
                    Adresse email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    required
                  />
                </div>

                {/* Mot de passe */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                    <FiLock className="mr-2 text-blue-500" />
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Laisser vide pour ne pas changer"
                    minLength="8"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum 8 caractères
                  </p>
                </div>

                {/* Rôle */}
                <div className="form-group">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Rôle de l'utilisateur
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white pr-8"
                      required
                    >
                      <option value="Collaborateur">Collaborateur</option>
                      <option value="Stagiaire">Stagiaire</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <FiChevronDown className="text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Superviseur (conditionnel) */}
                {formData.role === "Stagiaire" && (
                  <div className="form-group animate-fadeIn">
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center">
                      <FiBriefcase className="mr-2 text-blue-500" />
                      Superviseur
                    </label>
                    <div className="relative">
                      <select
                        name="supervisor"
                        value={formData.supervisor}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white pr-8"
                        required
                      >
                        <option value="">Sélectionner un superviseur</option>
                        {collaborators.map((collaborator) => (
                          <option
                            key={collaborator._id}
                            value={collaborator.name}
                          >
                            {collaborator.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <FiChevronDown className="text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Boutons */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg border-t border-gray-200">
              <button
                type="button"
                onClick={() => closeModal(setShowEditModal)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleEditUser}
                className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              >
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-200">
          <div
            className={`bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-200 ${modalAnimation}`}
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FiTrash2 className="mr-2 text-red-600 animate-pulse" />
                Confirmer la suppression
              </h3>
              <p className="text-gray-600">
                Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
                <span className="font-semibold text-red-600">
                  {currentUser?.name}
                </span>{" "}
                ?
                <br />
                Cette action est irréversible.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg border-t border-gray-200">
              <button
                type="button"
                onClick={() => closeModal(setShowDeleteModal)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
