import { Navbar } from '@/components/Navbar';
import { MinimalFooter } from '@/components/MinimalFooter';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-300 flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-3xl mx-auto px-6 py-32 space-y-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Privacy <span className="gradient-text">Policy</span></h1>
        
        <section className="space-y-4">
          <p className="text-lg text-slate-400">Your privacy is important to us. This policy explains how Redress handles your data.</p>
          
          <h2 className="text-xl font-bold text-white pt-4">1. Data Collection</h2>
          <p>We collect information you provide directly to us when you create an account, start a complaint, or communicate with our AI agent. This includes your name, email address, and the details of your consumer complaints.</p>
          
          <h2 className="text-xl font-bold text-white pt-4">2. AI Processing</h2>
          <p>The details of your complaints are processed by our AI models (hosted on AMD Developer Cloud) to generate letters and advice. We do not use your personal data to train public models.</p>
          
          <h2 className="text-xl font-bold text-white pt-4">3. Third-Party Services</h2>
          <p>We use Tavily Search to find regulator contact information and MongoDB Atlas for data persistence. We only share the minimum necessary information required for these services to function.</p>
          
          <h2 className="text-xl font-bold text-white pt-4">4. Security</h2>
          <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>
        </section>
      </main>
      <MinimalFooter />
    </div>
  );
}
