import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileForm } from "@/components/profile-form"
import Logout from "@/components/logout"

export const metadata: Metadata = {
  title: "Profil - Dashboard",
  description: "Profil pengguna iuran desa",
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  const user = await prisma.user.findUnique({
    where: {
      id: session?.user.id,
    },
  })

  if (!user) {
    return null
  }

  // Get user's payment statistics
  const paymentsCount = await prisma.payment.count({
    where: {
      userId: user.id,
      status: "COMPLETED",
    },
  })

  const totalPaid = await prisma.payment.aggregate({
    where: {
      userId: user.id,
      status: "COMPLETED",
    },
    _sum: {
      amount: true,
    },
  })

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profil Saya</h1>
        <p className="text-muted-foreground">Kelola informasi profil Anda</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pribadi</CardTitle>
            <CardDescription>Perbarui informasi pribadi Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Statistik Kontribusi</CardTitle>
              <CardDescription>Ringkasan kontribusi Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Total Kontribusi</p>
                  <p className="text-2xl font-bold">{paymentsCount}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Total Dibayarkan</p>
                  <p className="text-2xl font-bold">Rp {totalPaid._sum.amount?.toLocaleString("id-ID") || "0"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Akun</CardTitle>
              <CardDescription>Detail akun Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Tipe Akun</p>
                  <p className="text-muted-foreground">{user.role === "ADMIN" ? "Admin Desa" : "Warga Desa"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Tanggal Bergabung</p>
                  <p className="text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-center w-full">
          <Logout/>
          </div>
        </div>
      </div>
    </div>
  )
}
