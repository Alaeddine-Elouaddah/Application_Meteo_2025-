import { Moon, Sun, Bell } from "lucide-react";

const AdminHeader = ({ darkMode, setDarkMode }) => (
  <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
    <div className="flex justify-between items-center">
      <h1 className="text-xl font-semibold dark:text-white">Tableau de Bord</h1>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        {/* Menu utilisateur ici */}
      </div>
    </div>
  </header>
);

export default AdminHeader;
