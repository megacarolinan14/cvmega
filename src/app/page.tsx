import Link from "next/link";
import { ArrowRight, Layers, LayoutTemplate, Palette, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b max-w-7xl mx-auto w-full">
        <Link className="flex items-center justify-center gap-2" href="#">
          <Layers className="h-6 w-6 text-primary" />
          <span className="font-bold tracking-tighter text-lg">CV-Mega</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary underline-offset-4" href="/auth/login">
            Sign In
          </Link>
        </nav>
      </header>
      <main className="flex-1 w-full max-w-7xl mx-auto">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Build Your Digital Legacy
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Create, customize, and share a stunning, responsive, and future-proof professional CV in minutes. No design skills required.
                </p>
              </div>
              <div className="space-x-4">
                <Link
                  className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  href="/auth/register"
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  href="#demo"
                >
                  View Example
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 rounded-3xl mb-12">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 rounded-full bg-primary/10">
                   <LayoutTemplate className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Responsive Design</h3>
                <p className="text-sm text-muted-foreground">Looks perfect on desktop, tablet, and mobile. Built with modern CSS architecture.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 rounded-full bg-primary/10">
                   <Palette className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Custom Themes</h3>
                <p className="text-sm text-muted-foreground">Dark mode natively supported. Inject your own primary brand color instantly.</p>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 rounded-full bg-primary/10">
                   <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Your Own URL</h3>
                <p className="text-sm text-muted-foreground">Share your public CV anytime using a clean URL: /cv/yourname</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t max-w-7xl mx-auto">
        <p className="text-xs text-muted-foreground">
          © 2026 CV-Mega Inc. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
