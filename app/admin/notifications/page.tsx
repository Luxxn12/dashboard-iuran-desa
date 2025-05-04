import type { Metadata } from "next"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BroadcastNotificationForm } from "@/components/broadcast-notification-form"

export const metadata: Metadata = {
  title: "Notifikasi - Admin Dashboard",
  description: "Kelola notifikasi iuran desa",
}

export default async function NotificationsPage() {
  // Get all notifications, grouped by user
  const notifications = await prisma.notification.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  })

  // Get count of unread notifications
  const unreadCount = await prisma.notification.count({
    where: {
      isRead: false,
    },
  })

  // Get count of total users
  const userCount = await prisma.user.count({
    where: {
      role: "RESIDENT",
    },
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Notifikasi</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Notifikasi</CardTitle>
            <CardDescription>Jumlah notifikasi yang terkirim</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{notifications.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Notifikasi Belum Dibaca</CardTitle>
            <CardDescription>Notifikasi yang belum dibaca oleh warga</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{unreadCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Warga</CardTitle>
            <CardDescription>Jumlah warga yang terdaftar</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Kirim Notifikasi Broadcast</CardTitle>
            <CardDescription>Kirim notifikasi kepada seluruh warga</CardDescription>
          </CardHeader>
          <CardContent>
            <BroadcastNotificationForm />
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Riwayat Notifikasi</CardTitle>
            <CardDescription>Notifikasi yang telah dikirim kepada warga</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-y-auto">
            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-full space-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                        <div className="text-xs text-muted-foreground text-right">
                          <p>{notification.user.name}</p>
                          <p>
                            {new Date(notification.createdAt).toLocaleDateString("id-ID", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs">
                          <span className={`${notification.isRead ? "text-emerald-600" : "text-amber-600"}`}>
                            {notification.isRead ? "Telah dibaca" : "Belum dibaca"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">Belum ada notifikasi</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
