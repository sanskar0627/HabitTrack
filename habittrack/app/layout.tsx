import "./globals.css";
import Providers from "./providers"; // <-- your SessionProvider wrapper
import Navbar from "./components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar /> {/* ✅ Navbar on all pages */}
          <main className="min-h-screen bg-gray-50">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
