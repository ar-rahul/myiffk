"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, provider } from "@/firebaseConfig";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  // Run ONLY on client
  useEffect(() => {
    if (typeof window === "undefined") return;

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
    });

    return () => unsub();
  }, []);

  // Must not use Firebase functions until client-side
  const login = async () => {
    if (typeof window === "undefined") return;
    return signInWithPopup(auth, provider);
  };

  const logout = async () => {
    if (typeof window === "undefined") return;
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
