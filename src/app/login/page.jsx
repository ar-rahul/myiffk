"use client";

import { useAuth } from "../AuthProvider";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();

  if (user) {
    router.push("/");
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
      <h1 className="text-2xl font-semibold">IFFK Movies</h1>
      <button
        onClick={login}
        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded text-white"
      >
        Sign in with Google
      </button>
    </div>
  );
}
