"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CreditCard, User, Menu, History, Bell } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { signOut } from "next-auth/react"

// Bottom navigation routes
const bottomRoutes = [
  {
    label: "Beranda",
    icon: Home,
    href: "/dashboard",
  },
  {
    label: "Riwayat",
    icon: History,
    href: "/dashboard/history",
  },
  {
    label: "Program",
    icon: CreditCard,
    href: "/dashboard/contributions",
  },
  {
    label: "Profil",
    icon: User,
    href: "/dashboard/profile",
  },
]

// Sidebar routes (for the slide-out menu)
const sidebarRoutes = [
  {
    label: "Beranda",
    icon: Home,
    href: "/dashboard",
  },
  {
    label: "Program Iuran",
    icon: CreditCard,
    href: "/dashboard/contributions",
  },
  {
    label: "Riwayat",
    icon: History,
    href: "/dashboard/history",
  },
  {
    label: "Notifikasi",
    icon: Bell,
    href: "/dashboard/notifications",
  },
  {
    label: "Profil",
    icon: User,
    href: "/dashboard/profile",
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Bottom navigation bar for mobile */}
      <div className="bottom-0">
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 border-t bg-background md:hidden">
        <div className="grid h-full grid-cols-4 mx-auto">
          {bottomRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex flex-col items-center justify-center",
                pathname === route.href ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <route.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{route.label}</span>
            </Link>
          ))}
        </div>
      </div>
      </div>
    </>
  )
}
