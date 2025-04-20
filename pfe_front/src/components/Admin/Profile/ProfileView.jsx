import { User, Mail, Briefcase } from "lucide-react";

const ProfileView = () => {
  // Ici vous ajouterez la logique de récupération des données

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">Mon Profil</h2>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
              <User size={40} className="text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="text-lg font-semibold">Admin User</h3>
            <p className="text-gray-500 dark:text-gray-400">Administrateur</p>
          </div>
        </div>

        <div className="md:w-2/3 space-y-4">
          <ProfileField
            icon={<Mail />}
            label="Email"
            value="admin@example.com"
          />
          <ProfileField
            icon={<Briefcase />}
            label="Poste"
            value="Admin Principal"
          />
          {/* Ajoutez d'autres champs */}
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({ icon, label, value }) => (
  <div className="flex items-start">
    <span className="mr-3 text-gray-500 dark:text-gray-400">{icon}</span>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-medium dark:text-white">{value}</p>
    </div>
  </div>
);

export default ProfileView;
