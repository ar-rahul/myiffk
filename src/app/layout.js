import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./AuthProvider";




const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// app/layout.js
export const metadata = { title: "IFFK Movies", description: "IFFK schedule reviews" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      
<body className="min-h-screen bg-gray-950 text-gray-100 pb-16">
  <AuthProvider>
    <div className="max-w-md mx-auto px-4 py-6">{children}</div>
  </AuthProvider>
</body>
    </html>
  );
}

