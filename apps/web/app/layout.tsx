import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@repo/ui/components/ui/toaster";
import { Footer } from "~/components/footer";
import { Navbar } from "~/components/navbar";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Deep Clone",
  description: "Conversational voice cloning",
  icons: [{ rel: "icon", url: "/github.svg" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex h-screen w-full flex-col items-center">
        <ClerkProvider>
          <Toaster />
          <Navbar />
          {children}
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
