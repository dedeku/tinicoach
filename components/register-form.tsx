"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { registerSchema, type RegisterInput } from "@/lib/validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      nickname: "",
      birthdate: "",
      termsAccepted: false,
    },
  })

  const termsAccepted = watch("termsAccepted")

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true)
      setError("")
      setSuccess("")

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.details) {
          // Validation errors
          setError(result.details.map((d: any) => d.message).join(", "))
        } else {
          setError(result.error || "Regisztrációs hiba történt")
        }
        return
      }

      // Sikeres regisztráció
      setSuccess(result.message || "Sikeres regisztráció! Küldtünk egy megerősítő emailt.")

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err) {
      setError("Kapcsolódási hiba. Kérlek, próbáld újra.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Fiók létrehozása</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Add meg az adataid a regisztrációhoz
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-500/15 p-3 text-sm text-green-700 dark:text-green-400">
          {success}
        </div>
      )}

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email cím</Label>
          <Input
            id="email"
            type="email"
            placeholder="pelda@email.hu"
            {...register("email")}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Jelszó</Label>
          <Input
            id="password"
            type="password"
            placeholder="Legalább 8 karakter"
            {...register("password")}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Min. 8 karakter, nagybetű, kisbetű és szám
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="fullName">Teljes név</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Kovács Anna"
            {...register("fullName")}
            disabled={isLoading}
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="nickname">Becenév</Label>
          <Input
            id="nickname"
            type="text"
            placeholder="Anna"
            {...register("nickname")}
            disabled={isLoading}
          />
          {errors.nickname && (
            <p className="text-sm text-destructive">{errors.nickname.message}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="birthdate">Születési dátum</Label>
          <Input
            id="birthdate"
            type="date"
            {...register("birthdate")}
            disabled={isLoading}
          />
          {errors.birthdate && (
            <p className="text-sm text-destructive">{errors.birthdate.message}</p>
          )}
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="termsAccepted"
            checked={termsAccepted}
            onCheckedChange={(checked) =>
              setValue("termsAccepted", checked as boolean)
            }
            disabled={isLoading}
          />
          <label
            htmlFor="termsAccepted"
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Elfogadom az{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
              target="_blank"
            >
              Általános Szerződési Feltételeket
            </Link>{" "}
            és az{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
              target="_blank"
            >
              Adatvédelmi Nyilatkozatot
            </Link>
          </label>
        </div>
        {errors.termsAccepted && (
          <p className="text-sm text-destructive">{errors.termsAccepted.message}</p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Regisztráció..." : "Regisztráció"}
        </Button>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Vagy folytasd a következőkkel
          </span>
        </div>

        <div className="grid gap-2">
          <Button
            variant="outline"
            type="button"
            className="w-full"
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Regisztráció Google-lel
          </Button>

          <Button
            variant="outline"
            type="button"
            className="w-full"
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Regisztráció Facebook-kal
          </Button>

          <Button
            variant="outline"
            type="button"
            className="w-full"
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Regisztráció Apple-lel
          </Button>
        </div>
      </div>

      <div className="text-center text-sm">
        Már van fiókod?{" "}
        <Link
          href="/login"
          className="underline underline-offset-4 hover:text-primary"
        >
          Bejelentkezés
        </Link>
      </div>
    </form>
  )
}
