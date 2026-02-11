import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">Bienvenue</h1>
        <p className="text-muted-foreground">
          Connectez-vous pour accéder à votre dashboard
        </p>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg border rounded-xl",
          },
        }}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/dashboard"
      />
    </div>
  )
}
