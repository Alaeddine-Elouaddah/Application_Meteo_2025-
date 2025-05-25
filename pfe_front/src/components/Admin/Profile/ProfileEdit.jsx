import { useState, useEffect } from "react";
import { Mail, User, Lock, Eye, EyeOff, MapPin } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileEdit = ({ darkMode }) => {
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
  const [cityData, setCityData] = useState({
    name: "",
    country: "",
    coordinates: {
      lat: null,
      lon: null,
    },
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
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [cityQuery, setCityQuery] = useState("");

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
        if (response.data.data.city) {
          setCityData(response.data.data.city);
          setCityQuery(response.data.data.city.name);
        }
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

  const handleCityChange = (e) => {
    const { name, value } = e.target;
    setCityData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleCitySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/auth/update-city", {
        cityData: {
          name: cityData.name,
          country: cityData.country,
          coordinates: cityData.coordinates,
        },
      });
      showNotification("Ville mise à jour avec succès", "success");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Erreur lors de la mise à jour de la ville";
      showNotification(message, "error");
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

  const detectLocation = () => {
    if (navigator.geolocation) {
      setDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const API_KEY = "6e601e5bf166b100420a3cf427368540";
            const response = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
            );
            const data = await response.json();

            if (data && data.length > 0) {
              const newCity = {
                name: data[0].name,
                country: data[0].country,
                coordinates: {
                  lat: latitude,
                  lon: longitude,
                },
              };
              setCityData(newCity);
              setCityQuery(data[0].name);
              showNotification("Ville détectée avec succès", "success");

              // Mettre à jour la base de données automatiquement
              const token = localStorage.getItem("token");
              await fetch("http://localhost:8000/api/auth/update-city", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ cityData: newCity }),
              });
              showNotification("Ville mise à jour dans la base", "success");
            } else {
              showNotification("Impossible de déterminer la ville", "error");
            }
          } catch (error) {
            showNotification(
              "Erreur lors de la détection de la ville",
              "error"
            );
          } finally {
            setDetectingLocation(false);
          }
        },
        (error) => {
          showNotification("Erreur de géolocalisation", "error");
          setDetectingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      showNotification("La géolocalisation n'est pas supportée", "error");
    }
  };

  const handleCityInput = async (e) => {
    const value = e.target.value;
    setCityQuery(value);
    setCityData((prev) => ({ ...prev, name: value }));

    if (value.length > 1) {
      const API_KEY = "6e601e5bf166b100420a3cf427368540";
      try {
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${value}&limit=5&appid=${API_KEY}`
        );
        const data = await response.json();
        setCitySuggestions(data);
      } catch (err) {
        setCitySuggestions([]);
      }
    } else {
      setCitySuggestions([]);
    }
  };

  const handleCitySelect = (city) => {
    setCityData({
      name: city.name,
      country: city.country,
      coordinates: {
        lat: city.lat,
        lon: city.lon,
      },
    });
    setCityQuery(city.name);
    setCitySuggestions([]);
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

      <div
        className={`max-w-3xl mx-auto ${
          darkMode ? "bg-gray-800" : "bg-white"
        } rounded-xl shadow-lg overflow-hidden`}
      >
        <div
          className={`flex border-b ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <button
            className={`flex-1 py-4 px-6 text-center font-medium text-lg ${
              activeTab === "info"
                ? darkMode
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-blue-600 border-b-2 border-blue-600"
                : darkMode
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("info")}
          >
            Informations du compte
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium text-lg ${
              activeTab === "location"
                ? darkMode
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-blue-600 border-b-2 border-blue-600"
                : darkMode
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("location")}
          >
            Localisation
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium text-lg ${
              activeTab === "password"
                ? darkMode
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-blue-600 border-b-2 border-blue-600"
                : darkMode
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("password")}
          >
            Sécurité
          </button>
        </div>

        <div className="p-8">
          {activeTab === "info" ? (
            <>
              <h2
                className={`text-2xl font-bold mb-8 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Informations personnelles
              </h2>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label
                      className={`block text-md font-medium mb-3 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
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
                        className={`pl-12 w-full rounded-lg border-2 ${
                          darkMode
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-md h-14 px-4 py-3 transition-colors`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-md font-medium mb-3 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
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
                        className={`pl-12 w-full rounded-lg border-2 ${
                          darkMode
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-gray-100 text-gray-900"
                        } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-md h-14 px-4 py-3 cursor-not-allowed transition-colors`}
                      />
                    </div>
                    <p
                      className={`mt-2 text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
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
          ) : activeTab === "location" ? (
            <form onSubmit={handleCitySubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Ville
                  </label>
                  <div className="mt-1 flex flex-col relative">
                    <input
                      type="text"
                      name="name"
                      value={cityQuery}
                      onChange={handleCityInput}
                      className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-md ${
                        darkMode
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Votre ville"
                      autoComplete="off"
                      required
                    />
                    {citySuggestions.length > 0 && (
                      <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow">
                        {citySuggestions.map((city, idx) => (
                          <li
                            key={idx}
                            className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                            onClick={() => handleCitySelect(city)}
                          >
                            {city.name}, {city.country}
                            {city.state ? `, ${city.state}` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium">Pays</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="country"
                      value={cityData.country}
                      disabled
                      tabIndex={-1}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md bg-gray-100 text-gray-900 border-gray-300 border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-not-allowed select-none"
                      placeholder="Votre pays"
                      style={{ cursor: "not-allowed" }}
                      title="Modification interdite"
                      onMouseDown={(e) => e.preventDefault()}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={detectingLocation}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      detectingLocation ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {detectingLocation
                      ? "Détection en cours..."
                      : "Détecter ma ville"}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? "Mise à jour..." : "Enregistrer la ville"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <>
              <h2
                className={`text-2xl font-bold mb-8 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Sécurité du compte
              </h2>
              <form onSubmit={handlePasswordSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label
                      className={`block text-md font-medium mb-3 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
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
                        className={`pl-12 w-full rounded-lg border-2 ${
                          darkMode
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-md h-14 px-4 py-3 transition-colors`}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={() => toggleShowPassword("old")}
                      >
                        {showPassword.old ? (
                          <Eye
                            className={`${
                              darkMode
                                ? "text-gray-400 hover:text-gray-300"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                            size={20}
                          />
                        ) : (
                          <EyeOff
                            className={`${
                              darkMode
                                ? "text-gray-400 hover:text-gray-300"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                            size={20}
                          />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      className={`block text-md font-medium mb-3 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
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
                        className={`pl-12 w-full rounded-lg border-2 ${
                          darkMode
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-md h-14 px-4 py-3 transition-colors`}
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
                            className={`${
                              darkMode
                                ? "text-gray-400 hover:text-gray-300"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                            size={20}
                          />
                        ) : (
                          <EyeOff
                            className={`${
                              darkMode
                                ? "text-gray-400 hover:text-gray-300"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                            size={20}
                          />
                        )}
                      </button>
                    </div>
                    <p
                      className={`mt-2 text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Le mot de passe doit contenir au moins 8 caractères
                    </p>
                  </div>

                  <div>
                    <label
                      className={`block text-md font-medium mb-3 ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
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
                        className={`pl-12 w-full rounded-lg border-2 ${
                          darkMode
                            ? "border-gray-600 bg-gray-700 text-white"
                            : "border-gray-300 bg-white text-gray-900"
                        } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-md h-14 px-4 py-3 transition-colors`}
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
                            className={`${
                              darkMode
                                ? "text-gray-400 hover:text-gray-300"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                            size={20}
                          />
                        ) : (
                          <EyeOff
                            className={`${
                              darkMode
                                ? "text-gray-400 hover:text-gray-300"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
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
