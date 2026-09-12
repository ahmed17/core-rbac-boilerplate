export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse-slow mix-blend-multiply dark:mix-blend-screen" />
      <div 
        className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[100px] animate-pulse-slow mix-blend-multiply dark:mix-blend-screen" 
        style={{ animationDelay: "2s" }} 
      />
      
      {/* Main Content Wrapper */}
      <div className="z-10 w-full max-w-md p-6 sm:p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 rounded-3xl blur-xl -z-10" />
        {children}
      </div>
    </main>
  );
}
