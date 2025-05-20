import React, { useState, useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import ProfileEdit from "../Admin/Profile/ProfileEdit";
import Comparisons from "./Comparisons/Comparisons";
import Alert from "./Alert/Alert";
import Userss from "./Users/Users";
import Param from "./Param/Param";
import Dashboard from "./Dashboard/Dashboard";
import {
  LayoutDashboard,
  Bell,
  Users,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  User,
  AlertTriangle,
  Settings,
  House,
  Sliders,
  Home,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
} from "lucide-react";

// Hook personnalisé pour gérer le dark mode
const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("darkMode");
      if (savedMode !== null) return savedMode === "true";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setIsDarkMode(mediaQuery.matches);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return [isDarkMode, setIsDarkMode];
};

const SidebarItem = ({ icon: Icon, label, to, active, sidebarOpen }) => {
  return (
    <Link
      to={to}
      className={`flex items-center p-3 rounded-lg transition-all whitespace-nowrap overflow-hidden group ${
        active
          ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600 dark:bg-gray-700 dark:text-blue-300 dark:border-blue-300"
          : "hover:bg-gray-50 text-gray-600 hover:text-blue-600 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-blue-300"
      } ${sidebarOpen ? "pl-4" : "pl-3 justify-center"}`}
    >
      <Icon
        className={`w-5 h-5 flex-shrink-0 ${
          sidebarOpen ? "mr-3" : "mr-0"
        } group-hover:scale-110 transition-transform`}
      />
      {sidebarOpen && (
        <span className="text-sm font-medium truncate">{label}</span>
      )}
    </Link>
  );
};

const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activePath, setActivePath] = useState("");
  const [darkMode, setDarkMode] = useDarkMode();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: "Nouvelle comparaison effectuée",
      read: false,
      time: "10 min",
    },
    { id: 2, text: "Alerte météo déclenchée", read: false, time: "1h" },
    { id: 3, text: "Mise à jour disponible", read: true, time: "2j" },
  ]);
  const location = useLocation();

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleMobileSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out flex flex-col z-50 h-full ${
          sidebarOpen ? "w-64" : "w-20"
        } ${mobileSidebarOpen ? "left-0" : "-left-full lg:left-0"}`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-8">
            {sidebarOpen ? (
              <div className="flex items-center justify-between w-full">
                <Link
                  to="/admin"
                  className="text-xl font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Admin Panel
                </Link>
                <button
                  onClick={toggleMobileSidebar}
                  className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <Link
                  to="/admin"
                  className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  <Home className="w-5 h-5 text-white" />
                </Link>
                <button
                  onClick={toggleMobileSidebar}
                  className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="hidden lg:block p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarItem
              icon={House}
              label="Tableau de bord"
              to="/admin"
              active={activePath === "/admin"}
              sidebarOpen={sidebarOpen}
            />
            <SidebarItem
              icon={ChartNoAxesCombined}
              label="Comparaisons"
              to="/admin/comparisons"
              active={activePath.startsWith("/admin/comparisons")}
              sidebarOpen={sidebarOpen}
            />
            <SidebarItem
              icon={AlertTriangle}
              label="Alertes météo"
              to="/admin/alerts"
              active={activePath.startsWith("/admin/alerts")}
              sidebarOpen={sidebarOpen}
            />
            <SidebarItem
              icon={Users}
              label="Utilisateurs"
              to="/admin/users"
              active={activePath.startsWith("/admin/users")}
              sidebarOpen={sidebarOpen}
            />
            <SidebarItem
              icon={Settings}
              label="Paramètres"
              to="/admin/settings"
              active={activePath.startsWith("/admin/settings")}
              sidebarOpen={sidebarOpen}
            />
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center transition-colors duration-200">
          <div className="flex items-center">
            <button
              onClick={toggleMobileSidebar}
              className="lg:hidden p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-200">
              {activePath === "/admin" && "Tableau de bord"}
              {activePath.startsWith("/admin/comparisons") && "Comparaisons"}
              {activePath.startsWith("/admin/alerts") && "Alertes météo"}
              {activePath.startsWith("/admin/users") && "Utilisateurs"}
              {activePath.startsWith("/admin/settings") && "Paramètres"}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200"
              aria-label={
                darkMode ? "Passer en mode clair" : "Passer en mode sombre"
              }
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileMenuOpen(false);
                }}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 relative transition-colors duration-200"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 transition-colors duration-200">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200">
                      Notifications
                    </h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                            !notification.read
                              ? "bg-blue-50 dark:bg-gray-700"
                              : ""
                          }`}
                          onClick={() =>
                            markNotificationAsRead(notification.id)
                          }
                        >
                          <p className="text-sm text-gray-800 dark:text-gray-200">
                            {notification.text}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        Aucune notification
                      </div>
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-200 dark:border-gray-600 text-center">
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      Voir toutes les notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setProfileMenuOpen(!profileMenuOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center space-x-2 focus:outline-none"
                aria-label="Menu profil"
              >
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white">
                  AU
                </div>
              </button>

              {profileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 transition-colors duration-200"
                  style={{
                    zIndex: 1000,
                  }}
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Admin
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      admin@gmail.com
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/admin/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Profil
                      </div>
                    </Link>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center transition-colors duration-200"
                      onClick={async () => {
                        try {
                          const response = await fetch(
                            "http://localhost:8000/api/auth/logout",
                            {
                              method: "POST",
                              headers: {
                                Authorization: `Bearer ${localStorage.getItem(
                                  "token"
                                )}`,
                                "Content-Type": "application/json",
                              },
                            }
                          );

                          if (response.ok) {
                            localStorage.removeItem("token");
                            window.location.href = "/";
                          } else {
                            console.error("Échec de la déconnexion");
                          }
                        } catch (error) {
                          console.error(
                            "Erreur lors de la déconnexion:",
                            error
                          );
                        }
                        setProfileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6 max-w-7xl mx-auto transition-colors duration-200">
          <Routes>
            <Route index element={<Dashboard darkMode={darkMode} />} />
            <Route
              path="comparisons"
              element={<Comparisons darkMode={darkMode} />}
            />
            <Route path="alerts" element={<Alert darkMode={darkMode} />} />
            <Route path="users" element={<Userss darkMode={darkMode} />} />
            <Route path="settings" element={<Param darkMode={darkMode} />} />
            <Route
              path="profile"
              element={<ProfileEdit darkMode={darkMode} />}
            />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default Admin;
