import type { Metadata } from "next"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Manajemen Warga - Admin Dashboard",
  description: "Kelola data warga desa",
}

export default async function ResidentsPage() {
  const residents = await prisma.user.findMany({
    where: {
      role: "RESIDENT",
    },
    orderBy: {
      name: "asc",
    },
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" x2="19" y1="8" y2="14" />
              <line x1="22" x2="16" y1="11" y2="11" />
            </svg>
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
                      <Link href={`/admin/residents/${resident.id}`}>
                        <Button variant="outline" size="sm">
                          Detail
                        </Button>
                      </Link>
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
        </CardContent>
      </Card>
    </div>
  )
}
