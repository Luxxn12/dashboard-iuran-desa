import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, DollarSign, Users, ListTodo } from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Dashboard - Iuran Desa",
  description: "Dashboard admin untuk pengelolaan iuran desa",
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  // Get dashboard statistics
  const totalContributions = await prisma.contribution.count()
  const totalUsers = await prisma.user.count({
    where: { role: "RESIDENT" },
  })
  const totalCollected = await prisma.contribution.aggregate({
    _sum: { collectedAmount: true },
  })
  const totalPayments = await prisma.payment.count({
    where: { status: "COMPLETED" },
  })

  // Get recent contributions
  const recentContributions = await prisma.contribution.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  })

  // Get recent payments
  const recentPayments = await prisma.payment.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
        },
      },
      contribution: {
        select: {
          title: true,
        },
      },
    },
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">Selamat datang, {session?.user.name}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Program Iuran</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContributions}</div>
            <p className="text-xs text-muted-foreground">Program iuran aktif dan selesai</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dana Terkumpul</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rp {totalCollected._sum.collectedAmount?.toLocaleString("id-ID") || "0"}
            </div>
            <p className="text-xs text-muted-foreground">Dari semua program iuran</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayments}</div>
            <p className="text-xs text-muted-foreground">Transaksi berhasil</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Warga</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">Warga terdaftar</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Program Iuran Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentContributions.length > 0 ? (
                recentContributions.map((contribution) => (
                  <div key={contribution.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{contribution.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Target: Rp {contribution.targetAmount.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {new Date(contribution.endDate).toLocaleDateString("id-ID")}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada program iuran</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{payment.user.name}</p>
                      <p className="text-sm text-muted-foreground">{payment.contribution.title}</p>
                    </div>
                    <div className="ml-auto font-medium">Rp {payment.amount.toLocaleString("id-ID")}</div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada transaksi</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
