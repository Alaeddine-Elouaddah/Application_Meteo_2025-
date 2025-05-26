import React, { useEffect, useState } from "react";

const TriggeredAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/triggered-alerts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAlerts(data.alerts || []);
      setLoading(false);
    };
    fetchAlerts();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Alertes Reçues</h2>
      {alerts.length === 0 ? (
        <div>Aucune alerte reçue pour le moment.</div>
      ) : (
        <ul className="space-y-4">
          {alerts.map((alert, idx) => (
            <li
              key={idx}
              className="p-4 rounded bg-yellow-100 border-l-4 border-yellow-500"
            >
              <div className="font-semibold">
                {alert.type} : Condition {alert.condition} {alert.value}
              </div>
              <div>Ville : {alert.city}</div>
              <div>Valeur actuelle : {alert.currentValue}</div>
              <div className="text-xs text-gray-500">
                Déclenchée le {new Date(alert.triggeredAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TriggeredAlerts;
