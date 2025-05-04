import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Dashboard - Iuran Desa",
  description: "Dashboard warga untuk iuran desa",
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  // Get active contributions
  const activeContributions = await prisma.contribution.findMany({
    where: { status: "ACTIVE" },
    orderBy: { endDate: "asc" },
    take: 5,
  })

  // Get user's recent payments
  const userPayments = await prisma.payment.findMany({
    where: {
      userId: session?.user.id,
      status: "COMPLETED",
    },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      contribution: {
        select: {
          title: true,
        },
      },
    },
  })

  // Get user's notifications
  const notifications = await prisma.notification.findMany({
    where: {
      userId: session?.user.id,
      isRead: false,
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  })

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Selamat Datang, {session?.user.name}</h1>
        <p className="text-muted-foreground">Lihat program iuran dan riwayat pembayaran Anda</p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Program Iuran Aktif</h2>
            <Link href="/dashboard/contributions">
              <Button variant="link" size="sm">
                Lihat Semua
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeContributions.length > 0 ? (
              activeContributions.map((contribution) => {
                const progress = (contribution.collectedAmount / contribution.targetAmount) * 100
                const daysLeft = Math.ceil(
                  (new Date(contribution.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                )

                return (
                  <Card key={contribution.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{contribution.title}</CardTitle>
                        <Badge variant={daysLeft <= 7 ? "destructive" : "outline"}>{daysLeft} hari lagi</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{contribution.description}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Terkumpul</span>
                          <span className="font-medium">Rp {contribution.collectedAmount.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Target</span>
                          <span>Rp {contribution.targetAmount.toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/dashboard/contributions/${contribution.id}`} className="w-full">
                        <Button className="w-full">Bayar Iuran</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                )
              })
            ) : (
              <div className="col-span-full text-center py-6">
                <p className="text-muted-foreground">Tidak ada program iuran aktif saat ini</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Riwayat Pembayaran</CardTitle>
                <Link href="/dashboard/history">
                  <Button variant="link" size="sm">
                    Lihat Semua
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {userPayments.length > 0 ? (
                <div className="space-y-4">
                  {userPayments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{payment.contribution.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <p className="font-medium">Rp {payment.amount.toLocaleString("id-ID")}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">Belum ada riwayat pembayaran</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Notifikasi</CardTitle>
                <Link href="/dashboard/notifications">
                  <Button variant="link" size="sm">
                    Lihat Semua
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-start gap-2">
                      <div className="h-2 w-2 mt-2 rounded-full bg-emerald-600" />
                      <div>
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">Tidak ada notifikasi baru</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
