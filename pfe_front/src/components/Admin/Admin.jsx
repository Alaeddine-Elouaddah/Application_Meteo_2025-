Pour résoudre l'erreur mentionnée dans le composant `<DashboardContent>`, il est nécessaire de s'assurer que toutes les dépendances et les états sont correctement gérés. L'erreur peut survenir si certaines données ne sont pas initialisées ou si des props manquantes sont utilisées.

Voici le code complet corrigé avec des ajustements pour éviter cette erreur :

```javascript
import React, { useState, useEffect } from "react";
import {
  Thermometer,
  Droplet,
  Wind,
  CloudRain,
  AlertTriangle,
  Search,
  MapPin,
  Calendar,
  RefreshCw,
  Users,
  Settings,
  AlertCircle,
  Database,
  BarChart2,
  Shield,
  Bell,
  Mail,
  ChevronRight,
  Eye,
  Trash2,
  Edit,
  Plus,
  GitCompare,
  Sun,
  Moon,
  Cloud,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Configuration des icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Composant principal
const Admin = () => {
  // États principaux
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [showComparePanel, setShowComparePanel] = useState(false);
  const [compareCities, setCompareCities] = useState(["Casablanca", "Rabat"]);
  const [compareData, setCompareData] = useState(null);
  const [weatherData, setWeatherData] = useState({
    temp: 24,
    humidity: 65,
    wind: 12,
    condition: "Ensoleillé",
  });
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      city: "Casablanca",
      type: "tempête",
      severity: "high",
      message: "Vents violents prévus",
      time: "10:30",
      read: false,
    },
    {
      id: 2,
      city: "Marrakech",
      type: "chaleur",
      severity: "medium",
      message: "Canicule extrême",
      time: "09:15",
      read: true,
    },
  ]);
  const [users, setUsers] = useState([
    { id: 1, name: "Admin", role: "admin", lastLogin: "Aujourd'hui, 08:30" },
    { id: 2, name: "Météo 1", role: "meteo", lastLogin: "Hier, 14:20" },
  ]);

  // Villes disponibles pour comparaison
  const cities = [
    "Casablanca",
    "Rabat",
    "Marrakech",
    "Fès",
    "Tanger",
    "Agadir",
    "Meknès",
    "Oujda",
    "El Jadida",
    "Safi",
  ];

  // Données pour graphiques
  const tempData = [
    { name: "Lun", temp: 22 },
    { name: "Mar", temp: 24 },
    { name: "Mer", temp: 26 },
    { name: "Jeu", temp: 23 },
    { name: "Ven", temp: 25 },
    { name: "Sam", temp: 27 },
    { name: "Dim", temp: 24 },
  ];
  const alertData = [
    { name: "Tempête", value: 5 },
    { name: "Chaleur", value: 3 },
    { name: "Pluie", value: 2 },
  ];
  const COLORS = ["#EF4444", "#F59E0B", "#3B82F6"];

  // Charger les données de comparaison
  useEffect(() => {
    if (showComparePanel) {
      // Simulation de chargement des données
      setTimeout(() => {
        setCompareData({
          cities: compareCities,
          data: [
            {
              name: "Température",
              [compareCities[0]]: 24,
              [compareCities[1]]: 22,
            },
            {
              name: "Humidité",
              [compareCities[0]]: 65,
              [compareCities[1]]: 70,
            },
            {
              name: "Vent (km/h)",
              [compareCities[0]]: 12,
              [compareCities[1]]: 8,
            },
            {
              name: "Précipitations",
              [compareCities[0]]: 0,
              [compareCities[1]]: 5,
            },
          ],
        });
      }, 500);
    }
  }, [showComparePanel, compareCities]);

  // Thème dynamique
  const theme = {
    primary: darkMode ? "#3B82F6" : "#2563EB",
    background: darkMode ? "#1F2937" : "#F9FAFB",
    card: darkMode ? "#374151" : "#FFFFFF",
    text: darkMode ? "#F3F4F6" : "#111827",
    border: darkMode ? "#4B5563" : "#E5E7EB",
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-lg flex flex-col`}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Shield className="text-blue-500" /> Admin Météo
          </h1>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <NavItem
            icon={<BarChart2 />}
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          >
            Tableau de bord
          </NavItem>
          <NavItem
            icon={<AlertCircle />}
            active={activeTab === "alerts"}
            onClick={() => setActiveTab("alerts")}
            badge={alerts.filter((a) => !a.read).length}
          >
            Alertes
          </NavItem>
          <NavItem
            icon={<Users />}
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          >
            Utilisateurs
          </NavItem>
          <NavItem
            icon={<Settings />}
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          >
            Paramètres
          </NavItem>
          {/* Section de comparaison */}
          <div className="mt-4 px-6">
            <button
              onClick={() => setShowComparePanel(!showComparePanel)}
              className={`w-full flex items-center justify-between py-3 px-4 rounded-lg ${
                darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <GitCompare size={18} className="text-blue-500" />
                <span>Comparer prévisions</span>
              </div>
              <ChevronRight
                size={18}
                className={`transition-transform ${
                  showComparePanel ? "rotate-90" : ""
                }`}
              />
            </button>
            {showComparePanel && (
              <div className="mt-2 pl-2 ml-6 border-l-2 border-blue-200 space-y-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Ville 1</label>
                  <select
                    value={compareCities[0]}
                    onChange={(e) =>
                      setCompareCities([e.target.value, compareCities[1]])
                    }
                    className={`w-full p-2 rounded border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {cities.map((city) => (
                      <option key={`city1-${city}`} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Ville 2</label>
                  <select
                    value={compareCities[1]}
                    onChange={(e) =>
                      setCompareCities([compareCities[0], e.target.value])
                    }
                    className={`w-full p-2 rounded border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {cities
                      .filter((c) => c !== compareCities[0])
                      .map((city) => (
                        <option key={`city2-${city}`} value={city}>
                          {city}
                        </option>
                      ))}
                  </select>
                </div>
                {compareData && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-sm">
                      Comparaison actuelle:
                    </h4>
                    <div className="text-xs space-y-1">
                      {compareData.data.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.name}:</span>
                          <span>
                            {item[compareData.cities[0]]} vs{" "}
                            {item[compareData.cities[1]]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
        {/* Footer sidebar */}
        <div className="p-4 border-t">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {darkMode ? (
              <>
                <Sun size={16} /> Mode clair
              </>
            ) : (
              <>
                <Moon size={16} /> Mode sombre
              </>
            )}
          </button>
        </div>
      </div>
      {/* Contenu principal */}
      <div className="ml-64 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 pb-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">
              {activeTab === "dashboard" && "Tableau de bord"}
              {activeTab === "alerts" && "Gestion des alertes"}
              {activeTab === "users" && "Gestion des utilisateurs"}
              {activeTab === "settings" && "Paramètres système"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {activeTab === "dashboard" &&
                "Aperçu des données météo et alertes"}
              {activeTab === "alerts" && "Gérez les alertes météorologiques"}
              {activeTab === "users" && "Administrez les comptes utilisateurs"}
              {activeTab === "settings" && "Configurez les paramètres système"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Système opérationnel
            </div>
            <button
              className={`p-2 rounded-lg flex items-center gap-2 ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-white hover:bg-gray-100"
              } shadow`}
              onClick={() => {
                if (activeTab === "dashboard") {
                  setWeatherData({
                    temp: Math.floor(Math.random() * 10) + 20,
                    humidity: Math.floor(Math.random() * 30) + 50,
                    wind: Math.floor(Math.random() * 10) + 5,
                    condition: ["Ensoleillé", "Nuageux", "Pluvieux"][
                      Math.floor(Math.random() * 3)
                    ],
                  });
                }
              }}
            >
              <RefreshCw size={16} />
              <span className="hidden md:inline">Rafraîchir</span>
            </button>
          </div>
        </header>
        {/* Contenu dynamique */}
        {activeTab === "dashboard" && (
          <DashboardContent
            theme={theme}
            darkMode={darkMode}
            weatherData={weatherData}
            tempData={tempData}
            alertData={alertData}
            alerts={alerts}
            setActiveTab={setActiveTab}
            compareData={compareData}
          />
        )}
        {activeTab === "alerts" && (
          <AlertsTab
            theme={theme}
            darkMode={darkMode}
            alerts={alerts}
            setAlerts={setAlerts}
          />
        )}
        {activeTab === "users" && (
          <UsersTab
            theme={theme}
            darkMode={darkMode}
            users={users}
            setUsers={setUsers}
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab theme={theme} darkMode={darkMode} />
        )}
      </div>
    </div>
  );
};

// Composant Dashboard
const DashboardContent = ({
  theme,
  darkMode,
  weatherData,
  tempData,
  alertData,
  alerts,
  setActiveTab,
  compareData,
}) => {
  return (
    <div className="space-y-6">
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Alertes actives"
          value={alerts.filter((a) => !a.read).length}
          icon={<AlertTriangle className="text-red-500" />}
          trend="up"
          darkMode={darkMode}
        />
        <StatCard
          title="Utilisateurs"
          value={users.length}
          icon={<Users className="text-blue-500" />}
          trend="stable"
          darkMode={darkMode}
        />
        <StatCard
          title="Villes surveillées"
          value={12}
          icon={<MapPin className="text-green-500" />}
          trend="up"
          darkMode={darkMode}
        />
        <StatCard
          title="Capteurs"
          value={24}
          icon={<Thermometer className="text-purple-500" />}
          trend="up"
          darkMode={darkMode}
        />
      </div>
      {/* Section météo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`p-6 rounded-xl shadow transition-all hover:shadow-lg ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="text-yellow-500" /> Conditions actuelles
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold">{weatherData.temp}°C</div>
              <div className="text-sm mt-1 capitalize">
                {weatherData.condition.toLowerCase()}
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center justify-end gap-2">
                <Droplet size={16} className="text-blue-400" />
                <span>{weatherData.humidity}%</span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Wind size={16} className="text-gray-400" />
                <span>{weatherData.wind} km/h</span>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`p-6 rounded-xl shadow transition-all hover:shadow-lg col-span-2 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Thermometer className="text-red-400" /> Températures prévues
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tempData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="name" stroke={theme.text} />
                <YAxis stroke={theme.text} />
                <Tooltip
                  contentStyle={
                    darkMode
                      ? {
                          backgroundColor: theme.card,
                          borderColor: theme.border,
                          color: theme.text,
                        }
                      : {}
                  }
                />
                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke="#3B82F6"
                  fill="#93C5FD"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Section comparaison */}
      {compareData && (
        <div
          className={`p-6 rounded-xl shadow ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GitCompare className="text-blue-500" /> Comparaison:{" "}
            {compareData.cities.join(" vs ")}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compareData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="name" stroke={theme.text} />
                <YAxis stroke={theme.text} />
                <Tooltip
                  contentStyle={
                    darkMode
                      ? {
                          backgroundColor: theme.card,
                          borderColor: theme.border,
                          color: theme.text,
                        }
                      : {}
                  }
                />
                <Legend />
                <Bar dataKey={compareData.cities[0]} fill="#3B82F6" />
                <Bar dataKey={compareData.cities[1]} fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* Alertes et carte */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`p-6 rounded-xl shadow transition-all hover:shadow-lg ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="text-red-500" /> Alertes récentes
            </h3>
            <button
              onClick={() => setActiveTab("alerts")}
              className="text-sm text-blue-500 hover:underline flex items-center gap-1"
            >
              Voir tout <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <AlertItem key={alert.id} alert={alert} darkMode={darkMode} />
            ))}
          </div>
        </div>
        <div
          className={`p-6 rounded-xl shadow transition-all hover:shadow-lg ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="text-blue-500" /> Types d'alertes
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={alertData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {alertData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={
                    darkMode
                      ? {
                          backgroundColor: theme.card,
                          borderColor: theme.border,
                          color: theme.text,
                        }
                      : {}
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div
          className={`p-6 rounded-xl shadow transition-all hover:shadow-lg ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="text-green-500" /> Carte des alertes
          </h3>
          <div className="h-64 rounded-lg overflow-hidden">
            <MapContainer
              center={[31.7917, -7.0926]}
              zoom={6}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[33.5731, -7.5898]}>
                <Popup>
                  <div className="text-gray-800">
                    <h4 className="font-bold">Casablanca</h4>
                    <p>Température: 24°C</p>
                    <p className="text-red-500">Alerte: Vents violents</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Alertes
const AlertsTab = ({ theme, darkMode, alerts, setAlerts }) => {
  const markAsRead = (id) => {
    setAlerts(
      alerts.map((alert) =>
        alert.id === id ? { ...alert, read: true } : alert
      )
    );
  };
  return (
    <div
      className={`p-6 rounded-xl shadow ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Gestion des alertes</h3>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2">
          <Plus size={16} /> Nouvelle alerte
        </button>
      </div>
      {/* Filtres */}
      <div className="flex gap-3 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${
            darkMode ? "bg-gray-700" : "bg-gray-100"
          }`}
        >
          Toutes
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            darkMode ? "bg-gray-700" : "bg-gray-100"
          } flex items-center gap-2`}
        >
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          Urgentes
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            darkMode ? "bg-gray-700" : "bg-gray-100"
          } flex items-center gap-2`}
        >
          Non lues
        </button>
      </div>
      {/* Tableau des alertes */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className={`border-b ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <th className="pb-3 text-left">Ville</th>
              <th className="pb-3 text-left">Type</th>
              <th className="pb-3 text-left">Message</th>
              <th className="pb-3 text-left">Date</th>
              <th className="pb-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr
                key={alert.id}
                className={`border-b ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                } ${
                  !alert.read ? (darkMode ? "bg-gray-700" : "bg-yellow-50") : ""
                }`}
              >
                <td className="py-4 font-medium">{alert.city}</td>
                <td className="py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      alert.severity === "high"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {alert.type}
                  </span>
                </td>
                <td className="py-4">{alert.message}</td>
                <td className="py-4">{alert.time}</td>
                <td className="py-4">
                  <div className="flex gap-2">
                    {!alert.read && (
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="p-2 rounded hover:bg-gray-200"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    <button className="p-2 rounded hover:bg-gray-200">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 rounded hover:bg-gray-200">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Composant Utilisateurs
const UsersTab = ({ theme, darkMode, users, setUsers }) => {
  return (
    <div
      className={`p-6 rounded-xl shadow ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Gestion des utilisateurs</h3>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2">
          <Plus size={16} /> Nouvel utilisateur
        </button>
      </div>
      {/* Tableau des utilisateurs */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className={`border-b ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <th className="pb-3 text-left">Nom</th>
              <th className="pb-3 text-left">Rôle</th>
              <th className="pb-3 text-left">Dernière connexion</th>
              <th className="pb-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className={`border-b ${
                  darkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <td className="py-4 font-medium">{user.name}</td>
                <td className="py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="py-4">{user.lastLogin}</td>
                <td className="py-4">
                  <div className="flex gap-2">
                    <button className="p-2 rounded hover:bg-gray-200">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 rounded hover:bg-gray-200">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Composant Paramètres
const SettingsTab = ({ theme, darkMode }) => {
  return (
    <div
      className={`p-6 rounded-xl shadow ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h3 className="text-xl font-semibold mb-6">Paramètres système</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statut des services */}
        <div
          className={`p-6 rounded-lg border ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h4 className="font-semibold mb-4">Statut des services</h4>
          <div className="space-y-4">
            <StatusItem title="API Météo" status="active" darkMode={darkMode} />
            <StatusItem
              title="Base de données"
              status="active"
              darkMode={darkMode}
            />
            <StatusItem
              title="Service de notifications"
              status="warning"
              darkMode={darkMode}
            />
          </div>
        </div>
        {/* Seuils d'alertes */}
        <div
          className={`p-6 rounded-lg border ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h4 className="font-semibold mb-4">Seuils d'alertes</h4>
          <div className="space-y-4">
            <ThresholdInput
              title="Température maximale"
              value={40}
              unit="°C"
              darkMode={darkMode}
            />
            <ThresholdInput
              title="Vitesse du vent"
              value={60}
              unit="km/h"
              darkMode={darkMode}
            />
            <ThresholdInput
              title="Précipitations"
              value={50}
              unit="mm/h"
              darkMode={darkMode}
            />
          </div>
          <button className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
};

// Composants réutilisables
const NavItem = ({ icon, children, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-3 text-left ${
      active ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"
    }`}
  >
    <span className={active ? "text-blue-500" : ""}>{icon}</span>
    <span>{children}</span>
    {badge && (
      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

const StatCard = ({ title, value, icon, trend, darkMode }) => (
  <div
    className={`p-6 rounded-xl shadow transition-all hover:shadow-lg ${
      darkMode ? "bg-gray-800" : "bg-white"
    }`}
  >
    <div className="flex justify-between">
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className="p-3 rounded-lg bg-blue-50 text-blue-500">{icon}</div>
    </div>
    {trend && (
      <p className="text-xs mt-3 flex items-center">
        {trend === "up" && <span className="text-green-500 mr-1">↑ 12%</span>}
        {trend === "down" && <span className="text-red-500 mr-1">↓ 5%</span>}
        {trend === "stable" && (
          <span className="text-gray-500 mr-1">→ Stable</span>
        )}
        vs. semaine dernière
      </p>
    )}
  </div>
);

const AlertItem = ({ alert, darkMode }) => (
  <div
    className={`p-3 rounded-lg border-l-4 ${
      alert.severity === "high" ? "border-red-500" : "border-yellow-500"
    } ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
  >
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-medium">{alert.city}</h4>
        <p className="text-sm">{alert.message}</p>
      </div>
      <span className="text-xs text-gray-500">{alert.time}</span>
    </div>
    {!alert.read && (
      <button className="mt-2 text-xs text-blue-500 hover:underline">
        Marquer comme lu
      </button>
    )}
  </div>
);

const StatusItem = ({ title, status, darkMode }) => (
  <div className="flex items-center justify-between">
    <span>{title}</span>
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          status === "active"
            ? "bg-green-500"
            : status === "warning"
            ? "bg-yellow-500"
            : "bg-red-500"
        }`}
      ></div>
      <span className="text-sm">
        {status === "active"
          ? "Actif"
          : status === "warning"
          ? "Avertissement"
          : "Inactif"}
      </span>
    </div>
  </div>
);

const ThresholdInput = ({ title, value, unit, darkMode }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{title}</label>
    <div className="flex gap-2">
      <input
        type="number"
        defaultValue={value}
        className={`w-full px-3 py