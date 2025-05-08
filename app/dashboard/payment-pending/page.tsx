import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import Link from "next/link"

export default async function PaymentPendingPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Clock className="h-16 w-16 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">Pembayaran Tertunda</CardTitle>
          <CardDescription>Pembayaran Anda sedang diproses.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">
            Silakan selesaikan pembayaran Anda sesuai dengan instruksi yang diberikan. Setelah pembayaran dikonfirmasi,
            status akan diperbarui secara otomatis.
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
