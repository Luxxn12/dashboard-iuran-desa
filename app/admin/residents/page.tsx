import type { Metadata } from "next"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, UserPlus } from "lucide-react"
import { Pagination } from "@/components/pagination"

export const metadata: Metadata = {
  title: "Manajemen Warga - Admin Dashboard",
  description: "Kelola data warga desa",
}

export default async function ResidentsPage({
  searchParams,
}: {
  searchParams: { page?: string; perPage?: string }
}) {
  // Parse pagination parameters
  const currentPage = Number(searchParams.page) || 1
  const pageSize = Number(searchParams.perPage) || 10

  // Calculate skip value for pagination
  const skip = (currentPage - 1) * pageSize

  // Get total count for pagination
  const totalResidents = await prisma.user.count({
    where: {
      role: "RESIDENT",
    },
  })

  // Get paginated residents
  const residents = await prisma.user.findMany({
    where: {
      role: "RESIDENT",
    },
    orderBy: {
      name: "asc",
    },
    skip,
    take: pageSize,
  })

  // Get payment statistics for each resident
  const residentsWithStats = await Promise.all(
    residents.map(async (resident) => {
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

      return {
        ...resident,
        paymentsCount,
        totalPaid: totalPaid._sum.amount || 0,
      }
    }),
  )

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Warga</h2>
        <Link href="/admin/users/create">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Tambah Pengguna
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Warga</CardTitle>
          <CardDescription>Kelola data warga desa Anda di sini</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Nomor Telepon</TableHead>
                <TableHead>Total Kontribusi</TableHead>
                <TableHead>Total Dibayarkan</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {residentsWithStats.length > 0 ? (
                residentsWithStats.map((resident) => (
                  <TableRow key={resident.id}>
                    <TableCell className="font-medium">{resident.name}</TableCell>
                    <TableCell>{resident.email}</TableCell>
                    <TableCell>{resident.address || "-"}</TableCell>
                    <TableCell>{resident.phoneNumber || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{resident.paymentsCount}</Badge>
                    </TableCell>
                    <TableCell>Rp {resident.totalPaid.toLocaleString("id-ID")}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/admin/residents/${resident.id}`}>
                          <Button variant="outline" size="icon" title="Lihat Detail">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/residents/${resident.id}/edit`}>
                          <Button variant="outline" size="icon" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Belum ada data warga
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Pagination totalItems={totalResidents} pageSize={pageSize} currentPage={currentPage} />
        </CardContent>
      </Card>
    </div>
  )
}
