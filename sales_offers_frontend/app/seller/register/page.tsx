"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SellerRegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main register page since all users are now sellers by default
    router.replace("/register");
  }, [router]);

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
      <div className="text-center">
        <p className="text-[rgb(var(--color-muted))]">Redirecting...</p>
      </div>
    </div>
  );
}