import type React from "react"
import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import NotificationMobile from "@/components/notification-mobile"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background/95 backdrop-blur-sm px-4">
        <div className="flex items-center mr-auto">
          <Link href="/dashboard">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-primary"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
            </div>
          </Link>
          <Link href="/dashboard">
            <span className="text-lg font-bold hidden sm:inline-block">Iuran Desa</span>
          </Link>
        </div>
        <NotificationMobile />
      </header>
        <MobileNav />
      <main className="flex-1 pb-16 md:pb-0 px-1">{children}</main>
    </div>
  )
}
