import AdminCard from "./shared/AdminCard"; // Chemin corrigé

const Dashboard = () => {
  const stats = [
    { title: "Utilisateurs", value: 124, change: "+12%", icon: "users" },
    { title: "Projets", value: 24, change: "+5%", icon: "projects" },
    { title: "Documents", value: 56, change: "+3%", icon: "documents" },
    { title: "Tâches", value: 78, change: "-2%", icon: "tasks" },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 dark:text-white">
        Vue d'ensemble
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <AdminCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
