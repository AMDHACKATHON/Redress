import { Navbar } from '@/components/Navbar';
import { MinimalFooter } from '@/components/MinimalFooter';

const LAST_UPDATED = 'May 10, 2026';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-300 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-3xl mx-auto px-6 py-32 space-y-8">
        <header className="space-y-3">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Terms of <span className="gradient-text">Service</span>
          </h1>
          <p className="text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>
          <p className="text-lg text-slate-400">
            By using Redress you agree to these terms. They cover what the service does, what it doesn't do,
            and the responsibilities each side carries.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white pt-4">1. Acceptance</h2>
          <p>
            By creating an account or otherwise using Redress, you agree to be bound by these Terms and our{' '}
            <a
              href="/privacy"
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
            >
              Privacy Policy
            </a>
            . If you do not agree, do not use the service.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">2. Eligibility</h2>
          <p>
            You must be at least the age of majority in your jurisdiction (typically 18) to create an account.
            You must provide accurate information and keep your sign-in credentials secure. You are responsible
            for all activity under your account.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">3. What Redress is — and what it isn't</h2>
          <p>
            Redress is an AI-assisted tool that helps you draft formal complaint letters and locate the
            relevant regulators. It is not a law firm, not a licensed legal service, and does not provide
            legal advice.
          </p>
          <p>
            Generated letters are starting points. You are responsible for reviewing every letter for accuracy,
            tone, and legal sufficiency before sending it to a recipient or filing it with a regulator. If your
            matter involves significant financial, legal, or safety stakes, consult a qualified attorney.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">4. Acceptable use</h2>
          <p>You agree not to use Redress to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Generate fraudulent, harassing, defamatory, or knowingly false complaints.</li>
            <li>Impersonate another person or organisation.</li>
            <li>Attack, probe, or attempt to circumvent the security of the service or its providers.</li>
            <li>Scrape, redistribute, or resell Redress output as your own product.</li>
            <li>Violate applicable law or the rights of any third party.</li>
          </ul>
          <p>
            We may suspend or terminate accounts that violate these rules, with or without notice, and remove
            content that breaches them.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">5. Your content</h2>
          <p>
            You retain ownership of the complaint details you submit and the letters generated on your behalf.
            You grant Redress the limited rights needed to process, store, and display that content for the
            purpose of operating the service for you.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">6. AI output disclaimers</h2>
          <p>
            Large language models can produce inaccurate or out-of-date information, including incorrect
            regulator names, contact details, deadlines, or legal references. Redress takes reasonable steps to
            ground critical fields (such as regulator and recipient contacts) in real-time web search, but you
            must verify any factual claim, address, deadline, or email before relying on it.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">7. Third-party services</h2>
          <p>
            Redress relies on third-party services (Groq, Tavily, MongoDB Atlas, Vercel, Google OAuth). The
            availability and behaviour of those services is outside our direct control and may change.
            Outages, latency, or rate limits at those providers may affect your experience.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">8. Account termination</h2>
          <p>
            You may delete your account at any time from Settings → Danger Zone. Deletion is permanent and
            removes all of your complaints, letters, and messages from our database. We may also terminate or
            suspend an account if it violates these Terms or our Privacy Policy.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">9. No warranty</h2>
          <p>
            Redress is provided <strong>as is</strong> and <strong>as available</strong>, without warranties of
            any kind, express or implied, including merchantability, fitness for a particular purpose, accuracy,
            or non-infringement. We make no guarantee that the service will be uninterrupted, error-free, or
            that AI-generated content will achieve a particular outcome with any recipient or regulator.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">10. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, Redress and its creators are not liable for any indirect,
            incidental, consequential, special, or exemplary damages arising from your use of the service —
            including lost profits, lost data, regulatory outcomes, or unsuccessful complaints. Our total
            cumulative liability for direct damages will not exceed any amounts you have paid us in the prior
            twelve months (if any).
          </p>

          <h2 className="text-xl font-bold text-white pt-4">11. Changes to these terms</h2>
          <p>
            We may revise these Terms over time. The "Last updated" date at the top of the page indicates the
            current version. Continuing to use Redress after a revision means you accept the updated Terms.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">12. Governing law</h2>
          <p>
            These Terms are governed by the laws of the Federal Republic of Nigeria, without regard to
            conflict-of-laws principles. Any disputes will be resolved in the competent courts of that
            jurisdiction, unless local consumer-protection law in your country grants you a stronger right.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">13. Contact</h2>
          <p>
            Questions about these Terms: email{' '}
            <a
              href="mailto:hello@samkiel.dev"
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
            >
              hello@samkiel.dev
            </a>
            .
          </p>
        </section>
      </main>
      <MinimalFooter />
    </div>
  );
}
