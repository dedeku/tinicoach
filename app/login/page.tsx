import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-bold text-2xl">
            <span className="text-primary">tini</span>
            <span className="text-secondary">coach</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10">
          <div className="text-center space-y-4 p-12">
            <h2 className="text-4xl font-bold text-foreground">
              Üdvözlünk a <span className="text-primary">tini</span><span className="text-secondary">coach</span>-nál!
            </h2>
            <p className="text-lg text-muted-foreground">
              Megoldás-központú life coaching tinédzserek számára
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
