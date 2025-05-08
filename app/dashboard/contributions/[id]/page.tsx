import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PaymentForm } from "@/components/payment-form"

export const metadata: Metadata = {
  title: "Detail Program Iuran - Dashboard",
  description: "Detail program iuran desa",
}

interface ContributionDetailPageProps {
  params: {
    id: string
  }
}

export default async function ContributionDetailPage({ params }: ContributionDetailPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    notFound()
  }

  const contribution = await prisma.contribution.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!contribution) {
    notFound()
  }

  // Check if user has already paid for this contribution
  const existingPayment = await prisma.payment.findFirst({
    where: {
      userId: session.user.id,
      contributionId: params.id,
      status: {
        in: ["COMPLETED", "PENDING"],
      },
    },
  })

  // Also check if there's a pending transaction
  const pendingTransaction = existingPayment
    ? await prisma.transaction.findFirst({
        where: {
          id: existingPayment.transactionId || "",
          status: "PENDING",
        },
      })
    : null

  const hasCompletedPayment = existingPayment?.status === "COMPLETED"
  const hasPendingPayment = existingPayment?.status === "PENDING" && pendingTransaction

  const progress = (contribution.collectedAmount / contribution.targetAmount) * 100
  const isExpired = new Date(contribution.endDate) < new Date()
  const isActive = contribution.status === "ACTIVE" && !isExpired

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Link href="/dashboard/contributions" className="text-sm text-muted-foreground hover:underline">
          &larr; Kembali ke daftar program
        </Link>
        <h1 className="text-2xl font-bold mt-2">{contribution.title}</h1>
        <div className="flex items-center gap-2 mt-1">
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
          {hasCompletedPayment && <Badge variant="outline">Sudah Dibayar</Badge>}
          {hasPendingPayment && <Badge variant="outline">Pembayaran Tertunda</Badge>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Detail Program</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Deskripsi</h3>
              <p className="text-muted-foreground whitespace-pre-line">{contribution.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Tanggal Mulai</h3>
                <p className="text-muted-foreground">{new Date(contribution.startDate).toLocaleDateString("id-ID")}</p>
              </div>
              <div>
                <h3 className="font-medium">Tanggal Berakhir</h3>
                <p className="text-muted-foreground">{new Date(contribution.endDate).toLocaleDateString("id-ID")}</p>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Progres Dana</h3>
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pembayaran Iuran</CardTitle>
            <CardDescription>
              {hasCompletedPayment
                ? "Anda sudah membayar iuran untuk program ini"
                : hasPendingPayment
                  ? "Anda memiliki pembayaran tertunda untuk program ini"
                  : isActive
                    ? "Silakan lakukan pembayaran iuran untuk program ini"
                    : "Program iuran ini sudah tidak aktif"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasCompletedPayment ? (
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg text-center">
                <p className="font-medium text-green-800 dark:text-green-300">Terima kasih atas kontribusi Anda!</p>
                <p className="text-green-700 dark:text-green-400 mt-1">
                  Anda telah membayar iuran sebesar Rp {existingPayment.amount.toLocaleString("id-ID")} pada{" "}
                  {new Date(existingPayment.createdAt).toLocaleDateString("id-ID")}
                </p>
              </div>
            ) : hasPendingPayment ? (
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg text-center">
                <p className="font-medium text-yellow-800 dark:text-yellow-300">Pembayaran Anda sedang diproses</p>
                <p className="text-yellow-700 dark:text-yellow-400 mt-1">
                  Anda memiliki pembayaran tertunda sebesar Rp {existingPayment?.amount.toLocaleString("id-ID")}.
                  Silakan selesaikan pembayaran Anda.
                </p>
              </div>
            ) : isActive ? (
              <PaymentForm contributionId={params.id} contributionTitle={contribution.title} />
            ) : (
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="font-medium">Program iuran ini sudah tidak aktif</p>
                <p className="text-muted-foreground mt-1">Anda tidak dapat melakukan pembayaran untuk program ini</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
