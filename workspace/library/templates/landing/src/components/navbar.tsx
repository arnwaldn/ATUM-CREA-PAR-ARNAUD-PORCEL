import Link from "next/link"
import { Menu } from "lucide-react"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          {{APP_NAME}}
        </Link>
        
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#features" className="text-sm hover:text-primary">
            Features
          </Link>
          <Link href="#pricing" className="text-sm hover:text-primary">
            Pricing
          </Link>
          <Link href="/blog" className="text-sm hover:text-primary">
            Blog
          </Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden text-sm hover:text-primary md:block">
            Connexion
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Commencer
          </Link>
          <button className="md:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  )
}
