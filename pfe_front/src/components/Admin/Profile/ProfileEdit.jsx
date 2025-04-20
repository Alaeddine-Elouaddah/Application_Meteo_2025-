import { useState } from "react";
import { Mail, User, Briefcase } from "lucide-react";

const ProfileEdit = ({ profile, onSave }) => {
  const [formData, setFormData] = useState(profile);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">Modifier le Profil</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="block mb-1">Nom complet</label>
          <div className="flex items-center border rounded-lg px-3 py-2">
            <User className="mr-2 text-gray-500" size={18} />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-transparent"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="block mb-1">Email</label>
          <div className="flex items-center border rounded-lg px-3 py-2">
            <Mail className="mr-2 text-gray-500" size={18} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-transparent"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="block mb-1">Poste</label>
          <div className="flex items-center border rounded-lg px-3 py-2">
            <Briefcase className="mr-2 text-gray-500" size={18} />
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full bg-transparent"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Enregistrer
        </button>
      </form>
    </div>
  );
};

export default ProfileEdit;
