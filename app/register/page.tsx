import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/register-form";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Daftar - Dashboard Iuran Desa",
  description: "Daftar akun baru di Dashboard Iuran Desa",
};

export default function RegisterPage() {
  return (
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-emerald-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Dashboard Iuran Desa
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Aplikasi ini membantu kami mengelola iuran desa dengan
              lebih transparan dan efisien.&rdquo;
            </p>
            <footer className="text-sm">Kepala Desa Kalirejo</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="relative z-20 flex items-center text-lg font-medium justify-center pb-4 pt-4">
              <Image
                src="/logo.png"
                alt="Login Image"
                width={150}
                height={150}
                className="relative z-20 mt-auto"
              />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Daftar Akun Baru
            </h1>
            <p className="text-sm text-muted-foreground">
              Masukkan data Anda untuk mendaftar
            </p>
          </div>
          <RegisterForm />
          <p className="px-8 text-center text-sm text-muted-foreground pb-5">
            Sudah memiliki akun?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
