import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  User,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Pencil,
} from "lucide-react"

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
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    notFound()
  }

  const transaction = await prisma.transaction.findUnique({
    where: {
      id: params.id,
    },
    include: {
      user: true,
      contribution: true,
      payments: true,
    },
  })

  if (!transaction) {
    notFound()
  }

  return (
    <div className="dashboard-container animate-fade-in space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Link href="/admin/transactions">
            <Button variant="outline" size="icon" className="h-8 w-8 mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight gradient-heading">Detail Transaksi</h2>
        </div>
      </div>

      <div className="card-grid-2 animate-slide-up ">
        <div className="pb-6">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Informasi Transaksi
            </CardTitle>
            <CardDescription>Detail transaksi pembayaran iuran</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">ID Transaksi</h3>
                <p className="font-mono text-sm bg-muted/50 p-2 rounded-md overflow-x-auto">{transaction.id}</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Tipe Transaksi</h3>
                <div>
                  {transaction.type === "PAYMENT" && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-0">
                      <ArrowUp className="w-3 h-3 mr-1" />
                      Pembayaran
                    </Badge>
                  )}
                  {transaction.type === "REFUND" && (
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-0">
                      <ArrowDown className="w-3 h-3 mr-1" />
                      Pengembalian
                    </Badge>
                  )}
                  {transaction.type === "ADJUSTMENT" && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-0">
                      <FileText className="w-3 h-3 mr-1" />
                      Penyesuaian
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Jumlah</h3>
                <p className="text-lg font-semibold text-primary">Rp {transaction.amount.toLocaleString("id-ID")}</p>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Metode Pembayaran</h3>
                <p>{transaction.paymentMethod || "Pembayaran Langsung"}</p>
              </div>
            </div>

            {transaction.receiptNumber && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Nomor Kwitansi</h3>
                <p className="font-mono text-sm bg-muted/50 p-2 rounded-md">{transaction.receiptNumber}</p>
              </div>
            )}

            {transaction.description && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Deskripsi</h3>
                <p>{transaction.description}</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              {transaction.status === "COMPLETED" && (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-0">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Selesai
                </Badge>
              )}
              {transaction.status === "PENDING" && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-0">
                  <Clock className="w-3 h-3 mr-1" />
                  Menunggu
                </Badge>
              )}
              {transaction.status === "PROCESSING" && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-0">
                  <Clock className="w-3 h-3 mr-1" />
                  Diproses
                </Badge>
              )}
              {transaction.status === "FAILED" && (
                <Badge variant="outline" className="bg-red-500/10 text-red-500 border-0">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Gagal
                </Badge>
              )}
              {transaction.status === "CANCELLED" && (
                <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-0">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Dibatalkan
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Tanggal</h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
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
            </div>

            {transaction.notes && (
              <div className="space-y-1 pt-2 border-t">
                <h3 className="text-sm font-medium text-muted-foreground">Catatan</h3>
                <p>{transaction.notes}</p>
              </div>
            )}

            {transaction.paymentProof && (
              <div className="space-y-1 pt-2 border-t">
                <h3 className="text-sm font-medium text-muted-foreground">Bukti Pembayaran</h3>
                <div className="mt-2">
                  <a href={transaction.paymentProof} target="_blank" rel="noopener noreferrer" className="inline-block">
                    <img
                      src={transaction.paymentProof || "/placeholder.svg"}
                      alt="Bukti Pembayaran"
                      className="max-w-full h-auto rounded-md border"
                      style={{ maxHeight: "200px" }}
                    />
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>

        <div className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informasi Pengguna
              </CardTitle>
              <CardDescription>Detail pengguna yang melakukan pembayaran</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Nama</h3>
                  <p className="font-medium">{transaction.user.name}</p>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p>{transaction.user.email}</p>
                </div>
              </div>

              {transaction.user.address && (
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Alamat</h3>
                  <p>{transaction.user.address}</p>
                </div>
              )}

              {transaction.user.phoneNumber && (
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Nomor Telepon</h3>
                  <p>{transaction.user.phoneNumber}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <Link href={`/admin/residents/${transaction.user.id}`}>
                  <Button className="w-full">Lihat Profil Pengguna</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {transaction.contribution && (
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Program Iuran
                </CardTitle>
                <CardDescription>Detail program iuran terkait</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Nama Program</h3>
                  <p className="font-medium">{transaction.contribution.title}</p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Deskripsi</h3>
                  <p>{transaction.contribution.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Target</h3>
                    <p>Rp {transaction.contribution.targetAmount.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-muted-foreground">Terkumpul</h3>
                    <p>Rp {transaction.contribution.collectedAmount.toLocaleString("id-ID")}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Link href={`/admin/contributions/${transaction.contribution.id}`}>
                    <Button className="w-full">Lihat Detail Program</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
