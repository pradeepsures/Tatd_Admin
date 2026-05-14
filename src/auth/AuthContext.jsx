// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token") || null,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!auth.token) {
        setAuth((prev) => ({ ...prev, user: null }));
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/profile`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        if (res.data.status) {
          setAuth((prev) => ({ ...prev, user: res.data.data.user }));
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
        localStorage.removeItem("token");
        setAuth({ token: null, user: null });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [auth.token]);

  const login = async ({ email, password }) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/admin/login`, {
        email,
        password,
      });

      const token = response.data.token;
      if (token) {
        localStorage.setItem("token", token);
        setAuth({ token, user: null }); // profile loads in useEffect
        return { success: true };
      } else {
        throw new Error("Token not found in response");
      }
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuth({ token: null, user: null });
  };

  const hasPermission = (sectionName, action) => {
    if (!auth.user?.role?.permission) return false;
    const section = auth.user.role.permission.find(
      (p) => p.sectionName.toLowerCase() === sectionName.toLowerCase()
    );
    if (!section) return false;
    const key = "is" + action.charAt(0).toUpperCase() + action.slice(1);
    return !!section[key];
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, hasPermission, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// // src/context/AuthContext.js
// import React, { createContext, useContext, useState, useEffect } from "react";
// import axios from "axios";

// const BASE_URL = import.meta.env.VITE_BASE_URL;
// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {

//   // ✅ Loading state added (so pages don’t crash)
//   const [loading, setLoading] = useState(true);

//   const [auth, setAuth] = useState({
//     token: localStorage.getItem("token") || null,
//     user: JSON.parse(localStorage.getItem("user")) || null,
//   });

//   // ✅ Simulate profile check (later you can call /me API here)
//   useEffect(() => {
//     setLoading(false);
//   }, []);

//   // ✅ Temporary permission (always true for now)
//  const hasPermission = (module, action) => {
//   // ✅ If no user logged in → deny
//   if (!auth.user) return false;

//   // ✅ For now allow everything
//   // 🔒 Later replace this block with real RBAC logic
//   return true;
// };

//   const login = async ({ email, password }) => {
//     try {
//       setLoading(true);

//       const response = await axios.post(`${BASE_URL}/api/admin/login`, {
//         email,
//         password,
//       });

//       const token = response.data.token;
//       const user = response.data.data.user;

//       if (token && user) {
//         localStorage.setItem("token", token);
//         localStorage.setItem("user", JSON.stringify(user));
//         setAuth({ token, user });
//         return { success: true };
//       }

//       return { success: false };
//     } catch (error) {
//       console.error("Login failed:", error);
//       return { success: false };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     setAuth({ token: null, user: null });
//   };

//   return (
//     <AuthContext.Provider
//       value={{ auth, login, logout, hasPermission, loading }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);