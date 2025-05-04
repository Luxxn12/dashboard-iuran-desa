import type { Metadata } from "next"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Program Iuran - Dashboard",
  description: "Daftar program iuran desa",
}

export default async function ContributionsPage() {
  const session = await getServerSession(authOptions)

  // Get active contributions
  const activeContributions = await prisma.contribution.findMany({
    where: {
      status: "ACTIVE",
      endDate: {
        gte: new Date(),
      },
    },
    orderBy: {
      endDate: "asc",
    },
  })

  // Get completed or expired contributions
  const otherContributions = await prisma.contribution.findMany({
    where: {
      OR: [
        { status: { in: ["COMPLETED", "CANCELLED"] } },
        {
          status: "ACTIVE",
          endDate: {
            lt: new Date(),
          },
        },
      ],
    },
    orderBy: {
      endDate: "desc",
    },
    take: 5,
  })

  // Get user's payments
  const userPayments = await prisma.payment.findMany({
    where: {
      userId: session?.user.id,
      status: "COMPLETED",
    },
    select: {
      contributionId: true,
    },
  })

  const paidContributionIds = userPayments.map((payment) => payment.contributionId)

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Program Iuran</h1>
        <p className="text-muted-foreground">Daftar program iuran yang sedang berjalan</p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Program Aktif</h2>
          {activeContributions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeContributions.map((contribution) => {
                const progress = (contribution.collectedAmount / contribution.targetAmount) * 100
                const daysLeft = Math.ceil(
                  (new Date(contribution.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                )
                const isPaid = paidContributionIds.includes(contribution.id)

                return (
                  <Card key={contribution.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{contribution.title}</CardTitle>
                        <Badge variant={daysLeft <= 7 ? "destructive" : "outline"}>{daysLeft} hari lagi</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{contribution.description}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Terkumpul</span>
                          <span className="font-medium">Rp {contribution.collectedAmount.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Target</span>
                          <span>Rp {contribution.targetAmount.toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="w-full">
                        {isPaid ? (
                          <Button variant="outline" className="w-full" disabled>
                            Sudah Dibayar
                          </Button>
                        ) : (
                          <Link href={`/dashboard/contributions/${contribution.id}`} className="w-full">
                            <Button className="w-full">Bayar Iuran</Button>
                          </Link>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="bg-muted p-8 rounded-lg text-center">
              <p className="text-muted-foreground">Tidak ada program iuran aktif saat ini</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Program Selesai</h2>
          {otherContributions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherContributions.map((contribution) => {
                const progress = (contribution.collectedAmount / contribution.targetAmount) * 100
                const isExpired = new Date(contribution.endDate) < new Date()
                const isPaid = paidContributionIds.includes(contribution.id)

                return (
                  <Card key={contribution.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{contribution.title}</CardTitle>
                        <Badge
                          variant={
                            contribution.status === "ACTIVE"
                              ? "destructive"
                              : contribution.status === "COMPLETED"
                                ? "success"
                                : "secondary"
                          }
                        >
                          {contribution.status === "ACTIVE"
                            ? "Tenggat Terlewat"
                            : contribution.status === "COMPLETED"
                              ? "Selesai"
                              : "Dibatalkan"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{contribution.description}</p>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Terkumpul</span>
                          <span className="font-medium">Rp {contribution.collectedAmount.toLocaleString("id-ID")}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Target</span>
                          <span>Rp {contribution.targetAmount.toLocaleString("id-ID")}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="w-full">
                        {isPaid ? (
                          <Button variant="outline" className="w-full" disabled>
                            Sudah Dibayar
                          </Button>
                        ) : (
                          <Link href={`/dashboard/contributions/${contribution.id}`} className="w-full">
                            <Button variant="outline" className="w-full">
                              Lihat Detail
                            </Button>
                          </Link>
                        )}
                      </div>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="bg-muted p-8 rounded-lg text-center">
              <p className="text-muted-foreground">Belum ada program iuran yang selesai</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
