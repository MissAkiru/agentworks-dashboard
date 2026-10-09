import "./globals.css";

export const metadata = {
  title: "HOK Command — Private",
  description: "Private operations dashboard. Operator eyes only.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg0 font-sans text-ink antialiased">
        <header className="sticky top-0 z-50 border-b border-line bg-bg0/85 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
            <a href="/" className="font-serif text-sm tracking-[0.08em]">
              HOK <span className="text-gold">COMMAND</span>
            </a>
            <nav className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-label">
              <a href="/ventures" className="text-mute transition-colors hover:text-gold">Ventures</a>
              <a href="/intel" className="text-mute transition-colors hover:text-gold">B2B Intel</a>
              <a href="/security" className="text-mute transition-colors hover:text-gold">Security</a>
              <a href="/osint" className="text-faint transition-colors hover:text-gold">OSINT</a>
              <span className="hidden border border-line2 px-2 py-1 text-faint sm:inline">PRIVATE</span>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-5 pb-8 pt-4 font-mono text-[10px] uppercase tracking-widest text-faint">
          Akiru Systems · private · no index
        </footer>
      </body>
    </html>
  );
}
