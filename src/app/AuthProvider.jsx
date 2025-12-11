"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, provider } from "@/firebaseConfig"; // safe: only defined in browser
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    // Prevent running on the server
    if (typeof window === "undefined" || !auth) {
      console.log("AuthProvider loaded on server — skipping Firebase init");
      return;
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      console.log("Logged in user:", u?.uid);
      setUser(u || null);
    });

    return () => unsub();
  }, []);

  const login = async () => {
    if (!auth) return alert("Auth not ready yet.");
    return signInWithPopup(auth, provider);
  };

  const logout = () => {
    if (!auth) return;
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
