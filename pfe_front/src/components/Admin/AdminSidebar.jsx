import React, { useState } from "react";
import {
  Home,
  Users,
  Briefcase,
  FileText,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
} from "lucide-react";
import OCPLogo from "../../assets/ocp.png";
const ProfessionalSidebar = ({ activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      id: "dashboard",
      icon: <Home size={20} />,
      label: "Tableau de bord",
    },
    {
      id: "user-management",
      icon: <Users size={20} />,
      label: "Utilisateurs",
    },
    {
      id: "documents",
      icon: <FileText size={20} />,
      label: "Documents",
    },
    {
      id: "projects",
      icon: <Briefcase size={20} />,
      label: "Projets",
    },
    {
      id: "messages",
      icon: <MessageSquare size={20} />,
      label: "Messagerie",
    },
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const expandedWidth = "w-64";
  const collapsedWidth = "w-20";

  return (
    <div
      className={`fixed h-screen flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
        isCollapsed ? collapsedWidth : expandedWidth
      }`}
    >
      {/* Header avec logo et bouton de réduction */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed ? (
          <div className="flex items-center">
            <img src={OCPLogo} alt="OCP Logo" className="w-8 h-8" />
            <span className="ml-2 text-xl font-semibold text-gray-800 dark:text-white">
              Admin OCP
            </span>
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <img src={OCPLogo} alt="OCP Logo" className="w-8 h-8" />
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu principal */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => !isCollapsed && setActiveTab(item.id)}
                className={`w-full flex items-center rounded-lg p-3 transition-colors duration-200 ${
                  activeTab === item.id && !isCollapsed
                    ? "bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-medium"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                } ${isCollapsed ? "justify-center" : "justify-start"}`}
                disabled={isCollapsed}
                title={isCollapsed ? "" : item.label}
              >
                <span className={`${!isCollapsed ? "mr-3" : ""}`}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer avec bouton de déconnexion */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          className={`w-full flex items-center rounded-lg p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
            isCollapsed ? "justify-center" : "justify-start"
          }`}
          disabled={isCollapsed}
          title={isCollapsed ? "" : "Déconnexion"}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="ml-3 truncate">Déconnexion</span>}
        </button>
      </div>
    </div>
  );
};

export default ProfessionalSidebar;
