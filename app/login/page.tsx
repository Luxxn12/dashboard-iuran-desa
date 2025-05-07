import { LoginForm } from "@/components/login-form";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Login - Dashboard Iuran Desa",
  description: "Login ke Dashboard Iuran Desa",
};

export default function LoginPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-gradient-to-b from-primary to-primary/80" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10 mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
          </div>
          <span className="text-xl">Dashboard Iuran Desa</span>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-md">
              &ldquo;Aplikasi ini membantu kami mengelola iuran desa dengan
              lebih transparan dan efisien.&rdquo;
            </p>
            <footer className="text-sm">PTPN XII KALIREJO</footer>
          </blockquote>
        </div>
      </div>

      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="relative z-20 flex items-center text-lg font-medium justify-center pb-4">
              <Image
                src="/logo.png"
                alt="Login Image"
                width={150}
                height={150}
                className="relative z-20 mt-auto"
              />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Masuk ke Akun
            </h1>
            <p className="text-sm text-muted-foreground">
              Masukkan email dan password Anda untuk masuk
            </p>
          </div>
          <div className="card-container p-6 bg-card rounded-lg border shadow-sm">
            <LoginForm />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Belum memiliki akun?{" "}
            <Link
              href="/register"
              className="text-primary underline-offset-4 hover:underline font-medium"
            >
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
