import type { Metadata } from "next"
import { ContributionForm } from "@/components/contribution-form"

export const metadata: Metadata = {
  title: "Tambah Program Iuran - Admin Dashboard",
  description: "Tambah program iuran baru",
}

export default function CreateContributionPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tambah Program Iuran</h2>
      </div>

      <div className="grid gap-4">
        <ContributionForm />
      </div>
    </div>
  )
}
