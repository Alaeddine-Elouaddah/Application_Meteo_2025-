import React from "react";
import { Users, Briefcase, FileText, CheckSquare } from "lucide-react";

const AdminCard = ({ title, value, change, icon }) => {
  const getIcon = () => {
    switch (icon) {
      case "users":
        return <Users className="w-5 h-5" />;
      case "projects":
        return <Briefcase className="w-5 h-5" />;
      case "documents":
        return <FileText className="w-5 h-5" />;
      case "tasks":
        return <CheckSquare className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold mt-1 dark:text-white">{value}</p>
          {change && (
            <p className="text-sm mt-3">
              <span
                className={`font-medium ${
                  change.startsWith("+") ? "text-green-500" : "text-red-500"
                }`}
              >
                {change}
              </span>{" "}
              vs mois dernier
            </p>
          )}
        </div>
        <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 h-12 w-12 rounded-full flex items-center justify-center">
          {getIcon()}
        </div>
      </div>
    </div>
  );
};

export default AdminCard;
