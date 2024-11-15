import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Footer } from "~/components/footer";
import { Navbar } from "~/components/navbar";
import { type Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Some Title",
  description: "Some description",
  icons: [{ rel: "icon", url: "/github.svg" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen w-full flex-col items-center">
        <ClerkProvider>
          <Toaster position="top-center" />
          <Navbar />
          {children}
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
