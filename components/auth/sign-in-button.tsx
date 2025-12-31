"use client";

import { signInWithGoogle } from "@/app/actions/auth";

interface SignInButtonProps {
  children: React.ReactNode;
  className?: string;
}

export default function SignInButton({ children, className }: SignInButtonProps) {
  return (
    <button
      onClick={() => signInWithGoogle()}
      className={className}
    >
      {children}
    </button>
  );
}
