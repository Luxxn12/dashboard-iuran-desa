import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MarkNotificationsAsRead } from "@/components/mark-notifications-as-read"

export const metadata: Metadata = {
  title: "Notifikasi - Dashboard",
  description: "Notifikasi iuran desa",
}

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)

  const notifications = await prisma.notification.findMany({
    where: {
      userId: session?.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifikasi</h1>
          <p className="text-muted-foreground">Notifikasi dan pemberitahuan untuk Anda</p>
        </div>
        {unreadCount > 0 && <MarkNotificationsAsRead />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua Notifikasi</CardTitle>
          <CardDescription>Daftar semua notifikasi untuk Anda</CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-4 border rounded-lg ${
                    !notification.isRead ? "bg-muted/50" : ""
                  }`}
                >
                  {!notification.isRead && <div className="h-2 w-2 mt-2 rounded-full bg-emerald-600 flex-shrink-0" />}
                  <div className="space-y-1">
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Belum ada notifikasi</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
