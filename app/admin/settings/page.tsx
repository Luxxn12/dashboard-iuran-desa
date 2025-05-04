import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminProfileForm } from "@/components/admin-profile-form"
import { AppSettingsForm } from "@/components/app-settings-form"
import { ChangePasswordForm } from "@/components/change-password-form"

export const metadata: Metadata = {
  title: "Pengaturan - Admin Dashboard",
  description: "Pengaturan aplikasi iuran desa",
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  const user = await prisma.user.findUnique({
    where: {
      id: session?.user.id,
    },
  })

  if (!user) {
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profil Administrator</CardTitle>
              <CardDescription>Perbarui informasi profil Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminProfileForm user={user} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ganti Password</CardTitle>
              <CardDescription>Perbarui password akun Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm userId={user.id} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Aplikasi</CardTitle>
              <CardDescription>Konfigurasi pengaturan aplikasi iuran desa</CardDescription>
            </CardHeader>
            <CardContent>
              <AppSettingsForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tentang Aplikasi</CardTitle>
              <CardDescription>Informasi tentang aplikasi iuran desa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Nama Aplikasi</h3>
                <p>Dashboard Iuran Desa</p>
              </div>
              <div>
                <h3 className="font-medium">Versi</h3>
                <p>1.0.0</p>
              </div>
              <div>
                <h3 className="font-medium">Kontak Dukungan</h3>
                <p>dukungan@iurandesa.id</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
