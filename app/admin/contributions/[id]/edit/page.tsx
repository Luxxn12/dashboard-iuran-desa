import type { Metadata } from "next"
import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { ContributionForm } from "@/components/contribution-form"

export const metadata: Metadata = {
  title: "Edit Program Iuran - Admin Dashboard",
  description: "Edit program iuran",
}

interface EditContributionPageProps {
  params: {
    id: string
  }
}

export default async function EditContributionPage({ params }: EditContributionPageProps) {
  const contribution = await prisma.contribution.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!contribution) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Edit Program Iuran</h2>
      </div>

      <div className="grid gap-4">
        <ContributionForm contribution={contribution} />
      </div>
    </div>
  )
}
