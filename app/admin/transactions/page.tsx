import type { Metadata } from "next"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TransactionFilter } from "@/components/transaction-filter"

export const metadata: Metadata = {
  title: "Riwayat Transaksi - Admin Dashboard",
  description: "Riwayat pembayaran iuran desa",
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: { contribution?: string; status?: string; dateRange?: string }
}) {
  const session = await getServerSession(authOptions)
  const { contribution, status, dateRange } = searchParams

  // Build filter conditions
  const filterConditions: any = {}

  if (contribution) {
    filterConditions.contributionId = contribution
  }

  if (status && ["PENDING", "COMPLETED", "FAILED"].includes(status)) {
    filterConditions.status = status
  }

  if (dateRange) {
    const [startDate, endDate] = dateRange.split("_")
    if (startDate && endDate) {
      filterConditions.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }
  }

  // Get transactions with filters
  const transactions = await prisma.payment.findMany({
    where: filterConditions,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      contribution: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Get contributions for filter dropdown
  const contributions = await prisma.contribution.findMany({
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      title: "asc",
    },
  })

  // Calculate total for the filtered transactions
  const total = transactions.reduce((acc, transaction) => {
    return transaction.status === "COMPLETED" ? acc + transaction.amount : acc
  }, 0)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Riwayat Transaksi</h2>
      </div>

      <TransactionFilter
        contributions={contributions}
        selectedContribution={contribution}
        selectedStatus={status}
        selectedDateRange={dateRange}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Semua Transaksi</CardTitle>
              <CardDescription>Menampilkan {transactions.length} transaksi</CardDescription>
            </div>
            <div className="text-right">
              <CardTitle className="text-emerald-600">Rp {total.toLocaleString("id-ID")}</CardTitle>
              <CardDescription>Total Terkumpul</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Transaksi</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Program Iuran</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-xs">{transaction.id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      <Link href={`/admin/residents/${transaction.userId}`} className="hover:underline">
                        {transaction.user.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/contributions/${transaction.contributionId}`} className="hover:underline">
                        {transaction.contribution.title}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">Rp {transaction.amount.toLocaleString("id-ID")}</TableCell>
                    <TableCell>{transaction.paymentMethod || "Pembayaran Langsung"}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/transactions/${transaction.id}`}>
                        <Badge variant="secondary" className="cursor-pointer">
                          Detail
                        </Badge>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Tidak ada data transaksi
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
