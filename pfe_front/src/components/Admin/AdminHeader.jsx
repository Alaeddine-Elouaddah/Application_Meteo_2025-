import { Moon, Sun, Bell, User, ChevronDown, Mail, LogOut } from "lucide-react";
import { useState } from "react";

const AdminHeader = ({ darkMode, setDarkMode, setActiveTab }) => {
  const [profileOpen, setProfileOpen] = useState(false);

  const handleProfileClick = () => {
    setActiveTab("edit-profile"); // Active la page pour modifier le profil
    setProfileOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 shadow-sm">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          Tableau de bord
        </h1>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200">
            <Bell size={20} className="text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full"></span>
          </button>

          <button className="relative p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200">
            <Mail size={20} className="text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full"></span>
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
          >
            {darkMode ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-gray-600 dark:text-gray-300" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center px-3 py-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <User size={16} className="text-blue-600 dark:text-blue-300" />
              </div>
              <span className="ml-2 text-sm text-gray-800 dark:text-white font-medium">
                Admin
              </span>
              <ChevronDown
                size={16}
                className={`ml-1 transition-transform duration-200 ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-20 py-2 border border-gray-100 dark:border-gray-600">
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-800 transition-colors duration-200"
                >
                  <User size={14} className="mr-2" />
                  Mon Profil
                </button>
                <button className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-800 transition-colors duration-200">
                  <LogOut size={14} className="mr-2" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
