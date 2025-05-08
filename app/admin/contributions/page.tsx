import type { Metadata } from "next"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { Pagination } from "@/components/pagination"

export const metadata: Metadata = {
  title: "Program Iuran - Admin Dashboard",
  description: "Kelola program iuran desa",
}

export default async function ContributionsPage({
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
  const totalContributions = await prisma.contribution.count()

  // Get paginated contributions
  const contributions = await prisma.contribution.findMany({
    orderBy: { createdAt: "desc" },
    skip,
    take: pageSize,
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Program Iuran</h2>
        <Link href="/admin/contributions/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Program
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Program Iuran</CardTitle>
          <CardDescription>Kelola semua program iuran desa Anda di sini</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Program</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Terkumpul</TableHead>
                <TableHead>Tenggat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contributions.length > 0 ? (
                contributions.map((contribution) => {
                  const progress = (contribution.collectedAmount / contribution.targetAmount) * 100
                  const isExpired = new Date(contribution.endDate) < new Date()

                  return (
                    <TableRow key={contribution.id}>
                      <TableCell className="font-medium">{contribution.title}</TableCell>
                      <TableCell>Rp {contribution.targetAmount.toLocaleString("id-ID")}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span>Rp {contribution.collectedAmount.toLocaleString("id-ID")}</span>
                          <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(contribution.endDate).toLocaleDateString("id-ID")}</TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/admin/contributions/${contribution.id}`}>
                            <Button variant="outline" size="sm">
                              Detail
                            </Button>
                          </Link>
                          <Link href={`/admin/contributions/${contribution.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Belum ada program iuran
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Pagination totalItems={totalContributions} pageSize={pageSize} currentPage={currentPage} />
        </CardContent>
      </Card>
    </div>
  )
}
