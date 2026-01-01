import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Users, Mail } from "lucide-react";
import SignInButton from "@/components/auth/sign-in-button";

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image src="/logo.png" alt="Mailuto" width={160} height={160} className="w-28 h-auto md:w-40 md:h-auto" />
            </Link>
            <SignInButton className="btn btn-primary text-sm md:text-base px-4 md:px-6 py-2">
              <span className="hidden sm:inline">Sign in with Google</span>
              <span className="sm:hidden">Sign in</span>
            </SignInButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 container mx-auto px-4 py-12 md:py-16">

        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
            Automate Your Email
            <span className="block bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Reminders Effortlessly
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 md:mb-10 max-w-2xl mx-auto px-4">
            Schedule personalized email reminders for your subscribers using smart templates. 
            Perfect for subscription renewals, payment reminders, and recurring notifications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <SignInButton className="btn btn-primary text-base md:text-lg px-6 md:px-8 py-3">
              Get Started Free
              <ArrowRight className="inline ml-2 w-4 h-4 md:w-5 md:h-5" />
            </SignInButton>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mt-16 md:mt-24 max-w-5xl mx-auto">
          <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <Users className="w-10 h-10 md:w-12 md:h-12 text-primary-500 mb-3 md:mb-4" />
            <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Manage Subscribers</h3>
            <p className="text-sm md:text-base text-gray-600">
              Add and organize your subscribers with custom service details. 
              Keep track of who needs reminders and when.
            </p>
          </div>

          <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Mail className="w-10 h-10 md:w-12 md:h-12 text-primary-500 mb-3 md:mb-4" />
            <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Smart Templates</h3>
            <p className="text-sm md:text-base text-gray-600">
              Create reusable email templates with dynamic variables. 
              Personalize every message automatically.
            </p>
          </div>

          <div className="card animate-slide-up sm:col-span-2 md:col-span-1" style={{ animationDelay: '0.3s' }}>
            <Calendar className="w-10 h-10 md:w-12 md:h-12 text-primary-500 mb-3 md:mb-4" />
            <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Flexible Scheduling</h3>
            <p className="text-sm md:text-base text-gray-600">
              Set up monthly or custom interval schedules. 
              Your emails send automatically at the right time.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Mailuto" width={160} height={160} className="w-28 h-auto md:w-36 md:h-auto" />
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm">
              <SignInButton className="text-gray-600 hover:text-primary-600 transition-colors">
                Sign In
              </SignInButton>
              <Link href="mailto:support@mailuto.com" className="text-gray-600 hover:text-primary-600 transition-colors">
                Support
              </Link>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary-600 transition-colors">
                GitHub
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs md:text-sm text-gray-500">
              © {new Date().getFullYear()} Mailuto          </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
