import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const validateLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const payload = { name: username, password };
      console.log("Sending login request:", payload);
      const response = await fetch("http://localhost:3000/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Login response:", data);
      if (data.success) {
        setTimeout(() => {
          try {
            console.log("Navigating with role:", data.role);
            if (data.role === "admin") {
              navigate("/admin", { replace: true });
            } else if (data.role === "Product Management") {
              navigate("/product", { replace: true });
            } else if (data.role === "Waste Management") {
              navigate("/waste", { replace: true });
            } else {
              navigate("/barcode", { replace: true });
            }
          } catch (navError) {
            console.error("Navigation error:", navError);
            setError("Failed to redirect. Please try again.");
          }
        }, 0);
      } else {
        setError(data.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "Unable to connect to the server or process login. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="flex w-full h-screen shadow-lg">
        <div className="flex-1 bg-orange-500">
          <img
            src="a.png"
            alt="Sales Dashboard"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 flex items-center justify-center bg-white p-10">
          <div className="w-full max-w-md text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Sign in to <span className="text-orange-500">Apni Mandi</span>
            </h2>
            <form onSubmit={validateLogin}>
              <div className="mb-4">
                <input
                  type="text"
                  id="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-600 rounded-2xl bg-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="mb-4 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 border border-gray-600 rounded-2xl bg-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-transparent border-none cursor-pointer text-xl"
                >
                  👁️
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 text-white p-3 rounded-2xl text-base mt-6 hover:bg-orange-600 disabled:opacity-50"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
              {error && (
                <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
      <div
        className={`fixed inset-0 bg-white z-50 transform transition-transform duration-800 ${
          isLoading ? "translate-y-0" : "translate-y-full"
        }`}
      ></div>
    </div>
  );
}

export default Login;
