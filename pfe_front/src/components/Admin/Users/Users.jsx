const Users = ({ darkMode }) => {
  return (
    <div className={`p-6 ${darkMode ? "dark" : ""}`}>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Users
      </h2>
    </div>
  );
};
export default Users;
