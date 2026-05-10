import { Navbar } from '@/components/Navbar';
import { MinimalFooter } from '@/components/MinimalFooter';

const LAST_UPDATED = 'May 10, 2026';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-300 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-3xl mx-auto px-6 py-32 space-y-8">
        <header className="space-y-3">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>
          <p className="text-lg text-slate-400">
            Your privacy matters. This policy explains what data Redress collects when you use the service, how we
            use it, who we share it with, and the controls you have over it.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white pt-4">1. Information we collect</h2>
          <p>We only collect what we need to operate the service:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-white">Account details</strong> — your name, email address, optional
              avatar, country, and mailing address. You provide these directly when you sign up or update your
              settings.
            </li>
            <li>
              <strong className="text-white">Complaint content</strong> — the text of the complaints you describe
              to our AI agent, the messages exchanged in chat, the generated letters, and any escalation letters.
            </li>
            <li>
              <strong className="text-white">Authentication data</strong> — when you sign in with Google we
              receive your basic profile (name, email, profile picture) per Google's OAuth scopes you approved.
            </li>
            <li>
              <strong className="text-white">Operational logs</strong> — minimal request/error logs needed to
              keep the service running. We do not maintain detailed analytics or behavioral tracking.
            </li>
          </ul>

          <h2 className="text-xl font-bold text-white pt-4">2. How we use your information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To create and maintain your account.</li>
            <li>To draft, edit, and store the complaint and escalation letters you generate.</li>
            <li>To populate the sender block of those letters from your saved profile.</li>
            <li>To find the relevant regulator and recipient contact for your complaints (see §3).</li>
            <li>To enforce the Terms of Service and prevent abuse.</li>
          </ul>
          <p>
            We do not sell your data. We do not use your complaints to train public AI models. We do not run
            advertising on Redress.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">3. AI processing and third-party services</h2>
          <p>
            Generating letters and conducting the conversation requires sending the necessary excerpts of your
            complaint to third-party services. The minimum-necessary principle applies:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-white">Groq</strong> (Llama 3.3 70B) — receives the system prompt, your
              chat messages, and your saved sender info to draft and revise letters.
            </li>
            <li>
              <strong className="text-white">Tavily</strong> — receives short search queries (e.g. country +
              sector + "regulator contact email") to find the right regulator and, where possible, the
              recipient company's public complaints email. Your personal info is not sent to Tavily.
            </li>
            <li>
              <strong className="text-white">MongoDB Atlas</strong> — stores your account, complaints,
              messages, letters, and escalations.
            </li>
            <li>
              <strong className="text-white">Vercel</strong> — hosts and serves the Redress web application.
            </li>
            <li>
              <strong className="text-white">Google</strong> — used for OAuth sign-in if you choose to sign in
              with Google.
            </li>
          </ul>
          <p>
            Each provider has its own privacy practices. We pass them only what is required for their specific
            function.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">4. Data storage and retention</h2>
          <p>
            Your account, complaints, and letters are stored on MongoDB Atlas in encrypted form at rest. We keep
            them as long as your account exists. When you delete a complaint from your dashboard, the complaint
            and all its messages and letters are removed. When you delete your account from Settings → Danger
            Zone, all of your records are permanently removed from our database.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">5. Your rights</h2>
          <p>You can, at any time:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>View and update your personal info from the Settings page.</li>
            <li>Delete individual complaints from your dashboard.</li>
            <li>Permanently delete your entire account from Settings → Danger Zone.</li>
            <li>Email us at the address below to request an export of your data.</li>
          </ul>

          <h2 className="text-xl font-bold text-white pt-4">6. Cookies and sessions</h2>
          <p>
            Redress uses a single secure HTTP-only session cookie issued by NextAuth so that you stay signed in
            between visits. We do not use third-party tracking cookies, ad pixels, or cross-site identifiers.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">7. Security</h2>
          <p>
            We use HTTPS everywhere, hashed password storage (bcrypt), encrypted-at-rest database storage, and
            scoped API keys held in server-side environment variables. No system is perfectly secure; if you
            ever suspect your account has been compromised, change your password and contact us.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">8. Children's privacy</h2>
          <p>
            Redress is not directed at children under 13 (or under 16 where applicable). If you believe a child
            has registered an account, contact us and we will remove the account.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">9. Changes to this policy</h2>
          <p>
            We may update this policy as the service evolves. The "Last updated" date at the top of the page
            reflects the most recent revision. Material changes will be communicated via the app or email.
          </p>

          <h2 className="text-xl font-bold text-white pt-4">10. Contact</h2>
          <p>
            Questions, requests, or concerns about your data: email{' '}
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
