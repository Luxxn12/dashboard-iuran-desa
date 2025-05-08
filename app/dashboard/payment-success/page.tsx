import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // In a real implementation, you would verify the payment status with Midtrans
  // const orderId = searchParams.order_id as string
  // if (orderId) {
  //   const transaction = await checkMidtransTransaction(orderId)
  //   if (transaction?.transaction_status !== 'settlement' && transaction?.transaction_status !== 'capture') {
  //     redirect('/dashboard/payment-failed')
  //   }
  // }

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Pembayaran Berhasil!</CardTitle>
          <CardDescription>Terima kasih atas kontribusi Anda untuk desa kita.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Pembayaran Anda telah berhasil diproses. Anda dapat melihat riwayat pembayaran di halaman riwayat.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/dashboard/history">Lihat Riwayat Pembayaran</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/contributions">Kembali ke Daftar Iuran</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
