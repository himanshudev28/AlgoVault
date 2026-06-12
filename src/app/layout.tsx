import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlgoVault — DSA Tracker & Revision Sheet",
  description:
    "Track 215 curated DSA problems, store your notes & solutions, and never forget what you learned with spaced-repetition revision.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

const themeInit = `try{if(localStorage.getItem("theme")==="light")document.documentElement.classList.remove("dark")}catch{}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          appearance={{
            theme: dark,
            variables: { colorPrimary: "#10b981" },
          }}
        >
          <script dangerouslySetInnerHTML={{ __html: themeInit }} />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
