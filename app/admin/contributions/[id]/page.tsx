import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DeleteContributionButton } from "@/components/delete-contribution-button"

export const metadata: Metadata = {
  title: "Detail Program Iuran - Admin Dashboard",
  description: "Detail program iuran desa",
}

interface ContributionDetailPageProps {
  params: {
    id: string
  }
}

export default async function ContributionDetailPage({ params }: ContributionDetailPageProps) {
  const contribution = await prisma.contribution.findUnique({
    where: {
      id: params.id,
    },
    include: {
      payments: {
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
      },
    },
  })

  if (!contribution) {
    notFound()
  }

  const progress = (contribution.collectedAmount / contribution.targetAmount) * 100
  const isExpired = new Date(contribution.endDate) < new Date()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Detail Program Iuran</h2>
        <div className="flex gap-2">
          <Link href={`/admin/contributions/${params.id}/edit`}>
            <Button variant="outline">Edit Program</Button>
          </Link>
          <DeleteContributionButton id={params.id} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Program</CardTitle>
            <CardDescription>Detail program iuran</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Judul Program</h3>
              <p>{contribution.title}</p>
            </div>
            <div>
              <h3 className="font-medium">Deskripsi</h3>
              <p className="whitespace-pre-line">{contribution.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium">Tanggal Mulai</h3>
                <p>{new Date(contribution.startDate).toLocaleDateString("id-ID")}</p>
              </div>
              <div>
                <h3 className="font-medium">Tanggal Berakhir</h3>
                <p>{new Date(contribution.endDate).toLocaleDateString("id-ID")}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium">Status</h3>
              <Badge
                variant={
                  contribution.status === "ACTIVE"
                    ? isExpired
                      ? "destructive"
                      : "default"
                    : contribution.status === "COMPLETED"
                      ? "success"
                      : "secondary"
                }
              >
                {contribution.status === "ACTIVE"
                  ? isExpired
                    ? "Tenggat Terlewat"
                    : "Aktif"
                  : contribution.status === "COMPLETED"
                    ? "Selesai"
                    : "Dibatalkan"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progres Dana</CardTitle>
            <CardDescription>Progres pengumpulan dana program iuran</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Target</span>
                <span className="font-medium">Rp {contribution.targetAmount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span>Terkumpul</span>
                <span className="font-medium">Rp {contribution.collectedAmount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span>Persentase</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <div className="pt-4">
              <h3 className="font-medium mb-2">Statistik Pembayaran</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Total Pembayaran</p>
                  <p className="text-2xl font-bold">{contribution.payments.length}</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Rata-rata Pembayaran</p>
                  <p className="text-2xl font-bold">
                    {contribution.payments.length > 0
                      ? `Rp ${Math.round(contribution.collectedAmount / contribution.payments.length).toLocaleString(
                          "id-ID",
                        )}`
                      : "Rp 0"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran</CardTitle>
          <CardDescription>Riwayat pembayaran untuk program iuran ini</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Warga</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Metode Pembayaran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contribution.payments.length > 0 ? (
                contribution.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.user.name}</TableCell>
                    <TableCell>{payment.user.email}</TableCell>
                    <TableCell>Rp {payment.amount.toLocaleString("id-ID")}</TableCell>
                    <TableCell>{payment.paymentMethod || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === "COMPLETED"
                            ? "success"
                            : payment.status === "PENDING"
                              ? "outline"
                              : "destructive"
                        }
                      >
                        {payment.status === "COMPLETED"
                          ? "Berhasil"
                          : payment.status === "PENDING"
                            ? "Menunggu"
                            : "Gagal"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(payment.createdAt).toLocaleDateString("id-ID")}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Belum ada pembayaran untuk program ini
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
