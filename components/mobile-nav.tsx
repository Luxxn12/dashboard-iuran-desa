"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Home, ListTodo, History, Bell, User, Menu, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()

  const routes = [
    {
      label: "Beranda",
      icon: Home,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Program Iuran",
      icon: ListTodo,
      href: "/dashboard/contributions",
      active: pathname === "/dashboard/contributions",
    },
    {
      label: "Riwayat Pembayaran",
      icon: History,
      href: "/dashboard/history",
      active: pathname === "/dashboard/history",
    },
    {
      label: "Notifikasi",
      icon: Bell,
      href: "/dashboard/notifications",
      active: pathname === "/dashboard/notifications",
    },
    {
      label: "Profil",
      icon: User,
      href: "/dashboard/profile",
      active: pathname === "/dashboard/profile",
    },
  ]

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0">
          <div className="px-7">
            <Link href="/dashboard" className="flex items-center" onClick={() => setOpen(false)}>
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
            </Link>
          </div>
          <nav className="mt-6 flex flex-col gap-4 px-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground",
                  route.active && "bg-muted text-foreground",
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
            <Button
              variant="outline"
              className="mt-4 w-full justify-start"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <X className="mr-2 h-5 w-5" />
              Keluar
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
