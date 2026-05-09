import { Navbar } from '@/components/Navbar';
import { MinimalFooter } from '@/components/MinimalFooter';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-300 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-3xl mx-auto px-6 py-32 space-y-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Terms of <span className="gradient-text">Service</span></h1>
        
        <section className="space-y-4">
          <p className="text-lg text-slate-400">By using Redress, you agree to the following terms and conditions.</p>
          
          <h2 className="text-xl font-bold text-white pt-4">1. Acceptance of Terms</h2>
          <p>By accessing Redress, you agree to be bound by these terms. If you do not agree, please do not use the service.</p>
          
          <h2 className="text-xl font-bold text-white pt-4">2. AI-Generated Content</h2>
          <p>Redress provides AI-generated assistance for drafting complaint letters. This content is for informational purposes only and does not constitute legal advice. You are responsible for reviewing and verifying any documents before sending them.</p>
          
          <h2 className="text-xl font-bold text-white pt-4">3. User Conduct</h2>
          <p>You agree not to use Redress for any unlawful purpose or to generate fraudulent complaints. We reserve the right to terminate accounts that violate these terms.</p>
          
          <h2 className="text-xl font-bold text-white pt-4">4. Limitation of Liability</h2>
          <p>Redress and its creators are not liable for any outcomes resulting from the use of generated letters or regulatory escalations.</p>
        </section>
      </main>
      <MinimalFooter />
    </div>
  );
}
