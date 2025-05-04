"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
  email: z.string().email({
    message: "Email tidak valid.",
  }),
  password: z.string().min(6, {
    message: "Password minimal 6 karakter.",
  }),
})

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const searchParams = useSearchParams()

  // Check for error in URL (from NextAuth)
  React.useEffect(() => {
    const errorParam = searchParams?.get("error")
    if (errorParam) {
      setError("Login gagal. Email atau password salah.")
    }
  }, [searchParams])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Attempting login with:", values.email)

      const response = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      console.log("SignIn response:", response)

      if (response?.error) {
        setError("Email atau password salah.")
        toast({
          variant: "destructive",
          title: "Login gagal",
          description: "Email atau password salah.",
        })
        return
      }

      toast({
        title: "Login berhasil",
        description: "Anda akan diarahkan ke dashboard.",
      })

      router.refresh()
      router.push("/")
    } catch (error) {
      console.error("Login error:", error)
      setError("Terjadi kesalahan. Silakan coba lagi nanti.")
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: "Silakan coba lagi nanti.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="nama@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Memproses..." : "Login"}
        </Button>
      </form>
    </Form>
  )
}
