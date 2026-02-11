import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold">Créer un compte</h1>
        <p className="text-muted-foreground">
          Inscrivez-vous pour commencer
        </p>
      </div>
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg border rounded-xl",
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/dashboard"
      />
    </div>
  )
}
