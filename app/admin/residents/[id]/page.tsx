import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SendNotificationForm } from "@/components/send-notification-form"

export const metadata: Metadata = {
  title: "Detail Warga - Admin Dashboard",
  description: "Detail data warga desa",
}

interface ResidentDetailPageProps {
  params: {
    id: string
  }
}

export default async function ResidentDetailPage({ params }: ResidentDetailPageProps) {
  const resident = await prisma.user.findUnique({
    where: {
      id: params.id,
      role: "RESIDENT",
    },
  })

  if (!resident) {
    notFound()
  }

  // Get payment statistics
  const paymentsCount = await prisma.payment.count({
    where: {
      userId: resident.id,
      status: "COMPLETED",
    },
  })

  const totalPaid = await prisma.payment.aggregate({
    where: {
      userId: resident.id,
      status: "COMPLETED",
    },
    _sum: {
      amount: true,
    },
  })

  // Get payment history
  const payments = await prisma.payment.findMany({
    where: {
      userId: resident.id,
    },
    include: {
      contribution: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Detail Warga</h2>
        <Link href="/admin/residents">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Warga</CardTitle>
            <CardDescription>Detail informasi warga</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Nama</h3>
              <p>{resident.name}</p>
            </div>
            <div>
              <h3 className="font-medium">Email</h3>
              <p>{resident.email}</p>
            </div>
            <div>
              <h3 className="font-medium">Alamat</h3>
              <p>{resident.address || "-"}</p>
            </div>
            <div>
              <h3 className="font-medium">Nomor Telepon</h3>
              <p>{resident.phoneNumber || "-"}</p>
            </div>
            <div>
              <h3 className="font-medium">Tanggal Bergabung</h3>
              <p>
                {new Date(resident.createdAt).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistik Kontribusi</CardTitle>
            <CardDescription>Ringkasan kontribusi warga</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total Kontribusi</p>
                <p className="text-2xl font-bold">{paymentsCount}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Total Dibayarkan</p>
                <p className="text-xl font-bold">Rp {totalPaid._sum.amount?.toLocaleString("id-ID") || "0"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pembayaran</CardTitle>
          <CardDescription>Riwayat pembayaran iuran warga</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program Iuran</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Metode Pembayaran</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.contribution.title}</TableCell>
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
                  <TableCell colSpan={5} className="text-center">
                    Belum ada riwayat pembayaran
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kirim Notifikasi</CardTitle>
          <CardDescription>Kirim notifikasi khusus untuk warga ini</CardDescription>
        </CardHeader>
        <CardContent>
          <SendNotificationForm userId={resident.id} userName={resident.name} />
        </CardContent>
      </Card>
    </div>
  )
}
