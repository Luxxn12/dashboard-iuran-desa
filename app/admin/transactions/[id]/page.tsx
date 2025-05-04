import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UpdateTransactionStatusForm } from "@/components/update-transaction-status-form"

export const metadata: Metadata = {
  title: "Detail Transaksi - Admin Dashboard",
  description: "Detail transaksi pembayaran iuran desa",
}

interface TransactionDetailPageProps {
  params: {
    id: string
  }
}

export default async function TransactionDetailPage({ params }: TransactionDetailPageProps) {
  const transaction = await prisma.payment.findUnique({
    where: {
      id: params.id,
    },
    include: {
      user: true,
      contribution: true,
    },
  })

  if (!transaction) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Detail Transaksi</h2>
        <Link href="/admin/transactions">
          <Button variant="outline">Kembali ke Daftar</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Transaksi</CardTitle>
            <CardDescription>Detail transaksi pembayaran iuran</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">ID Transaksi</h3>
              <p className="font-mono">{transaction.id}</p>
            </div>
            <div>
              <h3 className="font-medium">Program Iuran</h3>
              <p>{transaction.contribution.title}</p>
            </div>
            <div>
              <h3 className="font-medium">Jumlah</h3>
              <p className="text-lg font-semibold">Rp {transaction.amount.toLocaleString("id-ID")}</p>
            </div>
            <div>
              <h3 className="font-medium">Metode Pembayaran</h3>
              <p>{transaction.paymentMethod || "Pembayaran Langsung"}</p>
            </div>
            {transaction.transactionId && (
              <div>
                <h3 className="font-medium">ID Pembayaran Gateway</h3>
                <p className="font-mono">{transaction.transactionId}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Status</h3>
              <Badge
                variant={
                  transaction.status === "COMPLETED"
                    ? "success"
                    : transaction.status === "PENDING"
                      ? "outline"
                      : "destructive"
                }
              >
                {transaction.status === "COMPLETED"
                  ? "Berhasil"
                  : transaction.status === "PENDING"
                    ? "Menunggu"
                    : "Gagal"}
              </Badge>
            </div>
            <div>
              <h3 className="font-medium">Tanggal</h3>
              <p>
                {new Date(transaction.createdAt).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {transaction.status === "PENDING" && (
              <div className="pt-4">
                <UpdateTransactionStatusForm transactionId={transaction.id} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Pengguna</CardTitle>
            <CardDescription>Detail pengguna yang melakukan pembayaran</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Nama</h3>
              <p>{transaction.user.name}</p>
            </div>
            <div>
              <h3 className="font-medium">Email</h3>
              <p>{transaction.user.email}</p>
            </div>
            {transaction.user.address && (
              <div>
                <h3 className="font-medium">Alamat</h3>
                <p>{transaction.user.address}</p>
              </div>
            )}
            {transaction.user.phoneNumber && (
              <div>
                <h3 className="font-medium">Nomor Telepon</h3>
                <p>{transaction.user.phoneNumber}</p>
              </div>
            )}
            <div className="pt-4">
              <Link href={`/admin/residents/${transaction.user.id}`}>
                <Button>Lihat Profil Pengguna</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
