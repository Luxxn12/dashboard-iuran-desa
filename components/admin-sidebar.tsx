"use client"

import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { BarChart3, CreditCard, Home, Settings, Bell, Users, LogOut, FileText, Menu } from "lucide-react"

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar"

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/admin",
    color: "text-emerald-500",
  },
  {
    label: "Program Iuran",
    icon: FileText,
    href: "/admin/contributions",
    color: "text-blue-500",
  },
  {
    label: "Transaksi",
    icon: CreditCard,
    href: "/admin/transactions",
    color: "text-violet-500",
  },
  {
    label: "Penduduk",
    icon: Users,
    href: "/admin/residents",
    color: "text-orange-500",
  },
  {
    label: "Notifikasi",
    icon: Bell,
    href: "/admin/notifications",
    color: "text-yellow-500",
  },
  {
    label: "Pengaturan",
    icon: Settings,
    href: "/admin/settings",
    color: "text-gray-500",
  },
]

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <Sidebar className={className} collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center px-3 h-14">
          <BarChart3 className="h-6 w-6 text-emerald-600" />
          <span className="font-bold text-xl ml-2">Iuran Desa</span>
          <SidebarTrigger className="ml-auto md:hidden">
            <Menu className="h-6 w-6" />
          </SidebarTrigger>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {routes.map((route) => (
            <SidebarMenuItem key={route.href}>
              <SidebarMenuButton asChild  isActive={pathname === route.href} tooltip={route.label}>
                <a href={route.href} className="flex items-center">
                <route.icon className={`h-5 w-5 ${route.color}`} />
                <span>{route.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut({ callbackUrl: "/login" })} tooltip="Keluar">
              <LogOut className="h-5 w-5 text-red-500" />
              <span>Keluar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
