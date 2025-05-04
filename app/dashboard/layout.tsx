import type React from "react"
import { MobileNav } from "@/components/mobile-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background px-4">
        <MobileNav />
        <div className="flex items-center justify-center md:justify-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6 text-emerald-600"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          <span className="font-bold">Iuran Desa</span>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <div className="fixed bottom-0 left-0 z-10 w-full border-t bg-background md:hidden">
        <div className="flex h-16 items-center justify-around">
          {[
            { href: "/dashboard", icon: "home", label: "Beranda" },
            { href: "/dashboard/contributions", icon: "list", label: "Iuran" },
            { href: "/dashboard/history", icon: "history", label: "Riwayat" },
            { href: "/dashboard/profile", icon: "user", label: "Profil" },
          ].map((item) => (
            <a key={item.href} href={item.href} className="flex flex-col items-center justify-center">
              <span className="text-xs">{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
