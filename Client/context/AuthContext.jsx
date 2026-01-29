import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendURL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ LOGIN / SIGNUP (NO checkAuth here)
  const login = async (type, credentials) => {
    try {
      const endpoint =
        type === "signup" ? "/api/auth/signup" : "/api/auth/login";

      const { data } = await axios.post(endpoint, credentials);

      if (!data?.token || !data?.user) {
        toast.error(data?.message || "Auth failed");
        return false;
      }

      localStorage.setItem("token", data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      setToken(data.token);
      setAuthUser(data.user);
      connectSocket(data.user);

      toast.success(data.message);
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Auth failed");
      return false;
    }
  };

  // ✅ CHECK AUTH (ONLY ON APP LOAD)
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      setAuthUser(data.user);
      connectSocket(data.user);
    } catch {
      logout(false);
    } finally {
      setLoading(false);
    }
  };

  // 🚪 LOGOUT
  const logout = (showToast = true) => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    delete axios.defaults.headers.common["Authorization"];

    if (socket) {
      socket.disconnect();
      setSocket(null);
    }

    if (showToast) toast.success("Logged out");
  };

  // 🔌 SOCKET
  const connectSocket = (user) => {
    if (!user || socket?.connected) return;

    const newSocket = io(backendURL, {
      query: { userId: user._id },
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });
  };

  const updateProfile = async (updatedData) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", updatedData);

      if (!data?.user) {
        toast.error("Profile update failed");
        return false;
      }

      setAuthUser(data.user);
      toast.success("Profile updated");
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Profile update failed");
      return false;
    }
  };

  // ✅ RUN ONLY ON REFRESH
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
