"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export function MarkNotificationsAsRead() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)

  const handleMarkAsRead = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/notifications/mark-as-read", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Terjadi kesalahan saat menandai notifikasi")
      }

      toast({
        title: "Notifikasi ditandai sebagai telah dibaca",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: error instanceof Error ? error.message : "Silakan coba lagi nanti",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleMarkAsRead} disabled={isLoading}>
      {isLoading ? "Memproses..." : "Tandai Semua Dibaca"}
    </Button>
  )
}
