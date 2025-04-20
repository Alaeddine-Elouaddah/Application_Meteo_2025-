import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import Dashboard from "./Dashboard";
import ProfileView from "./Profile/ProfileView";
import ProfileEdit from "./Profile/ProfileEdit";
import UsersManagement from "./Users/UsersManagement";
import ProjectsManagement from "./Projects/ProjectsManagement";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "profile":
        return <ProfileView />;
      case "edit-profile":
        return <ProfileEdit />;
      case "users":
        return <UsersManagement />;
      case "projects":
        return <ProjectsManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? "dark" : ""}`}>
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader darkMode={darkMode} setDarkMode={setDarkMode} />

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Admin;
