import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Riwayat Pembayaran - Dashboard",
  description: "Riwayat pembayaran iuran desa",
}

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)

  const payments = await prisma.payment.findMany({
    where: {
      userId: session?.user.id,
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
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Riwayat Pembayaran</h1>
        <p className="text-muted-foreground">Riwayat pembayaran iuran Anda</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semua Transaksi</CardTitle>
          <CardDescription>Daftar semua transaksi pembayaran iuran Anda</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{payment.contribution.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm">Metode: {payment.paymentMethod || "Pembayaran Langsung"}</p>
                  </div>
                  <div className="flex flex-col items-end mt-2 sm:mt-0">
                    <p className="font-bold">Rp {payment.amount.toLocaleString("id-ID")}</p>
                    <Badge
                      className="mt-1"
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Belum ada riwayat pembayaran</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
