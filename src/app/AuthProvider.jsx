"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, provider } from "@/firebaseConfig";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
  const unsub = onAuthStateChanged(auth, (u) => {
    setUser(u || null);
    console.log("Logged in user:", u?.uid); // 👈 Add this
  });
  return () => unsub();
}, []);

  const login = () => signInWithPopup(auth, provider);
  const logout = () => signOut(auth);

  const value = { user, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
