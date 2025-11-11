"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiExternalLink } from 'react-icons/fi';
import Button from '../../../components/Button';

export default function CheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to offers page since this is an affiliate platform
    router.push('/offers');
  }, [router]);

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] flex items-center justify-center">
      <div className="text-center">
        <FiExternalLink className="text-6xl text-[rgb(var(--color-muted))] mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[rgb(var(--color-fg))] mb-4">Redirecting...</h1>
        <p className="text-[rgb(var(--color-muted))] mb-4">
          This is an affiliate platform. Browse deals and compare prices from different stores.
        </p>
        <Button variant="primary" onClick={() => router.push('/offers')}>
          Browse Deals
        </Button>
      </div>
    </div>
  );
}