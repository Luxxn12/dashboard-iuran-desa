import type { Metadata } from "next"
import { AdminUserForm } from "@/components/admin-user-form"

export const metadata: Metadata = {
  title: "Tambah Pengguna - Admin Dashboard",
  description: "Tambah pengguna baru",
}

export default function CreateUserPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Tambah Pengguna</h2>
      </div>

      <div className="grid gap-4">
        <AdminUserForm />
      </div>
    </div>
  )
}
