import type { Metadata } from "next"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TransactionFilter } from "@/components/transaction-filter"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/pagination"

export const metadata: Metadata = {
  title: "Transaksi - Admin Dashboard",
  description: "Kelola semua transaksi pembayaran iuran desa",
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: {
    contribution?: string
    status?: string
    dateRange?: string
    page?: string
    perPage?: string
  }
}) {
  const session = await getServerSession(authOptions)
  const { contribution, status, dateRange } = searchParams

  // Parse pagination parameters
  const currentPage = Number(searchParams.page) || 1
  const pageSize = Number(searchParams.perPage) || 10

  // Calculate skip value for pagination
  const skip = (currentPage - 1) * pageSize

  // Build filter conditions
  const filterConditions: any = {}

  if (contribution && contribution !== "ALL") {
    filterConditions.contributionId = contribution
  }

  if (status && status !== "ALL") {
    // Ensure status is a valid enum value
    const validStatuses = ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]
    if (validStatuses.includes(status)) {
      filterConditions.status = status
    }
  }

  if (dateRange) {
    const [startDate, endDate] = dateRange.split("_")
    if (startDate && endDate) {
      filterConditions.createdAt = {
        gte: new Date(startDate),
        lte: new Date(`${endDate}T23:59:59.999Z`), // Include the entire end date
      }
    }
  }

  console.log("Filter conditions:", JSON.stringify(filterConditions, null, 2))

  // Get total count for pagination
  const totalTransactions = await prisma.transaction.count({
    where: filterConditions,
  })

  // Get paginated transactions with filters
  const transactions = await prisma.transaction.findMany({
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
    skip,
    take: pageSize,
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
    if (transaction.status === "COMPLETED") {
      if (transaction.type === "PAYMENT") {
        return acc + transaction.amount
      } else if (transaction.type === "REFUND") {
        return acc - transaction.amount
      }
    }
    return acc
  }, 0)

  return (
    <div className="dashboard-container animate-fade-in space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Riwayat Transaksi</h2>
      </div>
      <div className="animate-slide-up">
        <TransactionFilter
          contributions={contributions}
          selectedContribution={contribution}
          selectedStatus={status}
          selectedDateRange={dateRange}
        />
      </div>

      <Card className="mt-6 dashboard-card animate-slide-up-delay-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Semua Transaksi</CardTitle>
              <CardDescription>
                Menampilkan {transactions.length} dari {totalTransactions} transaksi
                {Object.keys(filterConditions).length > 0 && " (dengan filter)"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-lg">
              <ArrowUpIcon className="h-5 w-5 text-primary" />
              <div className="text-right">
                <CardTitle className="text-lg text-primary">Rp {total.toLocaleString("id-ID")}</CardTitle>
                <CardDescription>Total Bersih</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID Transaksi</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nama</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Program Iuran</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Jumlah</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tanggal</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs">{transaction.id.substring(0, 8)}...</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <Link
                              href={`/admin/residents/${transaction.userId}`}
                              className="hover:underline text-primary font-medium"
                            >
                              {transaction.user.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">{transaction.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {transaction.contribution ? (
                          <Link
                            href={`/admin/contributions/${transaction.contributionId}`}
                            className="hover:underline text-primary"
                          >
                            {transaction.contribution.title}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">Rp {transaction.amount.toLocaleString("id-ID")}</td>
                      <td className="py-3 px-4">
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
                      </td>
                      <td className="py-3 px-4">
                        {new Date(transaction.createdAt).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/admin/transactions/${transaction.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-primary hover:bg-primary/10 hover:text-primary"
                          >
                            Detail
                            <ArrowUpRight className="ml-1 h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <ArrowDownIcon className="h-8 w-8 mb-2" />
                        <p>Tidak ada data transaksi</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination totalItems={totalTransactions} pageSize={pageSize} currentPage={currentPage} />
        </CardContent>
      </Card>
    </div>
  )
}
