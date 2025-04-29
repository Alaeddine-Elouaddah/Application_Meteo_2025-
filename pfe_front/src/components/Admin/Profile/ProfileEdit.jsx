import { useState, useEffect } from "react";
import { Mail, User, Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileEdit = () => {
  const [authUser, setAuthUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const navigate = useNavigate();

  // État pour les notifications
  const [notifications, setNotifications] = useState([]);

  // Fonction pour afficher une notification
  const showNotification = (message, type) => {
    const id = Date.now();
    const newNotification = { id, message, type };

    setNotifications((prev) => [...prev, newNotification]);

    // Supprimer la notification après 3 secondes
    setTimeout(() => {
      removeNotification(id);
    }, 3000);
  };

  // Fonction pour supprimer une notification
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setAuthUser(null);
    navigate("/login");
    showNotification("Vous avez été déconnecté", "info");
  };

  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [activeTab, setActiveTab] = useState("info");
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/profile/me");
        setFormData({
          username: response.data.data.username,
          email: response.data.data.email,
        });
        setAuthUser(response.data.data);
      } catch (error) {
        if (error.response?.status === 401) {
          showNotification(
            "Session expirée - veuillez vous reconnecter",
            "error"
          );
          logout();
        } else if (error.response?.status === 404) {
          showNotification(
            "Endpoint non trouvé - vérifiez la configuration",
            "error"
          );
        } else {
          showNotification("Erreur lors du chargement du profil", "error");
        }
        console.error("Erreur détaillée:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setProfileLoading(false);
      navigate("/login");
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/profile/update", {
        username: formData.username,
        email: formData.email,
      });
      showNotification("Profil mis à jour avec succès", "success");
    } catch (error) {
      const message =
        error.response?.data?.message || "Erreur lors de la mise à jour";
      showNotification(message, "error");
      console.error("Erreur mise à jour profil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification(
        "Les nouveaux mots de passe ne correspondent pas",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      await api.put("/profile/updatepassword", {
        currentPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      showNotification("Mot de passe mis à jour avec succès", "success");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors du changement de mot de passe";
      showNotification(message, "error");
      console.error("Erreur changement mot de passe:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600 dark:text-gray-300">
          Veuillez vous connecter pour accéder à cette page
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Container pour les notifications */}
      <div
        id="notification-container"
        className="fixed top-4 right-4 z-50 space-y-2"
      >
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification p-4 rounded-md shadow-lg transform transition-all duration-300 ${
              notification.type === "success"
                ? "bg-green-500"
                : notification.type === "error"
                ? "bg-red-500"
                : "bg-blue-500"
            } text-white`}
          >
            {notification.message}
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`flex-1 py-4 px-6 text-center font-medium text-lg ${
              activeTab === "info"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("info")}
          >
            Informations du compte
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium text-lg ${
              activeTab === "password"
                ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("password")}
          >
            Sécurité
          </button>
        </div>

        <div className="p-8">
          {activeTab === "info" ? (
            <>
              <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">
                Informations personnelles
              </h2>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Nom complet
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="text-gray-500" size={20} />
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="pl-12 w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-md h-14 px-4 py-3 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Adresse email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="text-gray-500" size={20} />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled
                        className="pl-12 w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-md h-14 px-4 py-3 cursor-not-allowed transition-colors"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      L'adresse email ne peut pas être modifiée
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-lg transition duration-200 text-lg ${
                      loading
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:bg-blue-700"
                    }`}
                  >
                    {loading
                      ? "Enregistrement..."
                      : "Mettre à jour les informations"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-white">
                Sécurité du compte
              </h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="text-gray-500" size={20} />
                      </div>
                      <input
                        type={showPassword.old ? "text" : "password"}
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        className="pl-12 w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-md h-14 px-4 py-3 transition-colors"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={() => toggleShowPassword("old")}
                      >
                        {showPassword.old ? (
                          <Eye
                            className="text-gray-500 hover:text-gray-700"
                            size={20}
                          />
                        ) : (
                          <EyeOff
                            className="text-gray-500 hover:text-gray-700"
                            size={20}
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="text-gray-500" size={20} />
                      </div>
                      <input
                        type={showPassword.new ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="pl-12 w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-md h-14 px-4 py-3 transition-colors"
                        required
                        minLength="8"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={() => toggleShowPassword("new")}
                      >
                        {showPassword.new ? (
                          <Eye
                            className="text-gray-500 hover:text-gray-700"
                            size={20}
                          />
                        ) : (
                          <EyeOff
                            className="text-gray-500 hover:text-gray-700"
                            size={20}
                          />
                        )}
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Le mot de passe doit contenir au moins 8 caractères
                    </p>
                  </div>

                  <div>
                    <label className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Confirmer le nouveau mot de passe
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="text-gray-500" size={20} />
                      </div>
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="pl-12 w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-md h-14 px-4 py-3 transition-colors"
                        required
                        minLength="8"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={() => toggleShowPassword("confirm")}
                      >
                        {showPassword.confirm ? (
                          <Eye
                            className="text-gray-500 hover:text-gray-700"
                            size={20}
                          />
                        ) : (
                          <EyeOff
                            className="text-gray-500 hover:text-gray-700"
                            size={20}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-6 bg-blue-600 text-white font-medium rounded-lg transition duration-200 text-lg ${
                      loading
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:bg-blue-700"
                    }`}
                  >
                    {loading
                      ? "Enregistrement..."
                      : "Mettre à jour le mot de passe"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileEdit;
