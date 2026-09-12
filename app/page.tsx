import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse-slow mix-blend-multiply dark:mix-blend-screen" />
      <div 
        className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px] animate-pulse-slow mix-blend-multiply dark:mix-blend-screen" 
        style={{ animationDelay: "2s" }} 
      />
      
      <div className="z-10 flex flex-col items-center text-center max-w-3xl px-6 animate-slide-up">
        <div className="inline-flex items-center rounded-full border border-border px-3 py-1 text-sm font-medium mb-8 bg-background/50 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse mr-2"></span>
          Next.js 16 RBAC Boilerplate
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-foreground">
          Secure Role-Based Access
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
          A premium, production-ready starting point. Featuring NextAuth v4, Prisma ORM, PostgreSQL, and a stunning glassmorphism design system powered by Tailwind CSS v4.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/dashboard" className="btn-primary text-base h-12 px-10 rounded-2xl">
            Go to Dashboard
          </Link>
          <Link href="/login" className="inline-flex items-center justify-center rounded-2xl text-base font-medium transition-colors border border-border bg-background hover:bg-muted text-foreground h-12 px-10">
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
