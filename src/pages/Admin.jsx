import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Admin() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "Waste Management",
    establishment: "1"
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const checkPageProtection = async () => {
    try {
      const response = await fetch("http://localhost:3000/user/tokendata", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const userData = await response.json();
      if (userData.role !== "admin") {
        setError("Unauthorized access. Redirecting to login...");
        setTimeout(() => navigate("/"), 2000);
        return false;
      }
      return true;
    } catch (error) {
      console.error("User not authenticated:", error);
      setError("Authentication failed. Redirecting to login...");
      setTimeout(() => navigate("/"), 2000);
      return false;
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3000/user", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/user/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.username,
          password: newUser.password,
          role: newUser.role,
          establishmentId: newUser.establishment
        }),
        credentials: "include"
      });
      if (response.ok) {
        fetchUsers();
        setShowModal(false);
        setNewUser({
          username: "",
          password: "",
          role: "Waste Management",
          establishment: "1"
        });
        setError("");
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setError("Failed to create user. Please try again.");
    }
  };

  const deleteUser = async (name, establishmentId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/user/delete/${name}/${establishmentId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        }
      );
      if (response.ok) {
        fetchUsers();
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Failed to delete user. Please try again.");
    }
  };

  useEffect(() => {
    checkPageProtection().then((isAuthorized) => {
      if (isAuthorized) fetchUsers();
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-5">
      <div className="w-full max-w-6xl h-[90vh] bg-white p-6 rounded-lg shadow-lg flex flex-col">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Employees</h1>
            <p className="text-gray-600">Showing data over the last 30 days</p>
          </div>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Search here..."
              className="w-64 p-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600"
            >
              Create User
            </button>
            <button
              onClick={() => navigate("/")}
              className="bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600"
            >
              Logout
            </button>
          </div>
        </header>
        {error && (
          <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-lg">
            {error}
          </div>
        )}
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left font-bold">Username</th>
              <th className="p-4 text-left font-bold">Password</th>
              <th className="p-4 text-left font-bold">Role</th>
              <th className="p-4 text-left font-bold">Establishment</th>
              <th className="p-4 text-left font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={`${user.name}-${user.establishmentId}`}>
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.password}</td>
                <td className="p-4">{user.role}</td>
                <td className="p-4">{user.establishmentId}</td>
                <td className="p-4">
                  <button
                    onClick={() => deleteUser(user.name, user.establishmentId)}
                    className="bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-96 shadow-lg relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-2xl bg-transparent border-none cursor-pointer"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-6">Create New User</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="role" className="block mb-2">
                  Role
                </label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="Waste Management">Waste Management</option>
                  <option value="Product Management">Product Management</option>
                  <option value="Count User">Count User</option>
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="establishment" className="block mb-2">
                  Establishment-ID
                </label>
                <select
                  id="establishment"
                  value={newUser.establishment}
                  onChange={(e) =>
                    setNewUser({ ...newUser, establishment: e.target.value })
                  }
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600"
              >
                Create User
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
