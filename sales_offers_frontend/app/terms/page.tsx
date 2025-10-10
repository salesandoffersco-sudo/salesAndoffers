"use client";

export default function Terms() {
  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg))] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[rgb(var(--color-card))] rounded-lg shadow-lg p-8 border border-[rgb(var(--color-border))]">
          <h1 className="text-3xl font-bold text-[rgb(var(--color-fg))] mb-8">Terms of Service</h1>
          
          <div className="space-y-6 text-[rgb(var(--color-fg))]">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-[rgb(var(--color-muted))]">
                By accessing and using Sales & Offers platform, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
              <p className="text-[rgb(var(--color-muted))]">
                Permission is granted to temporarily use Sales & Offers for personal, non-commercial transitory viewing only.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
              <p className="text-[rgb(var(--color-muted))]">
                Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}