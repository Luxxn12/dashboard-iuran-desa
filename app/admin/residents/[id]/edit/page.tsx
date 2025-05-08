import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { EditUserForm } from "@/components/edit-user-form"

export const metadata: Metadata = {
  title: "Edit Warga - Admin Dashboard",
  description: "Edit data warga desa",
}

interface EditResidentPageProps {
  params: {
    id: string
  }
}

export default async function EditResidentPage({ params }: EditResidentPageProps) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    notFound()
  }

  const user = await prisma.user.findUnique({
    where: {
      id: params.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      address: true,
      phoneNumber: true,
    },
  })

  if (!user) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Edit Warga</h2>
      </div>

      <div className="grid gap-4">
        <EditUserForm user={user} />
      </div>
    </div>
  )
}
