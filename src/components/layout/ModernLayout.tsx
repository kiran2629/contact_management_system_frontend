import { ReactNode } from 'react';
import { FloatingNav } from './FloatingNav';

interface ModernLayoutProps {
  children: ReactNode;
}

export const ModernLayout = ({ children }: ModernLayoutProps) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Subtle Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <FloatingNav />

      {/* Main Content - 95% width usage */}
      <main className="relative pt-24 pb-28 md:pb-8 px-2 sm:px-4">
        <div className="w-full max-w-[1920px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
