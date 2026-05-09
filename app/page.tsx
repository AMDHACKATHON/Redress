'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { MinimalFooter } from '@/components/MinimalFooter';
import {
  Shield,
  FileText,
  Scale,
  ArrowRight,
  Landmark,
  Smartphone,
  Zap,
  Building2,
  Globe,
  ShoppingCart,
} from 'lucide-react';

const steps = [
  {
    step: 1,
    title: 'Describe your problem',
    desc: 'Tell the AI agent what happened in plain language. It asks the right follow-up questions.',
    icon: FileText,
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    step: 2,
    title: 'Get your letter',
    desc: 'A professional, legally-informed complaint letter is drafted instantly and ready to send.',
    icon: Shield,
    gradient: 'from-indigo-500 to-purple-600',
  },
  {
    step: 3,
    title: 'Escalate if needed',
    desc: 'If ignored, escalate to the relevant regulator automatically with full documentation.',
    icon: Scale,
    gradient: 'from-purple-500 to-pink-600',
  },
];

const sectors = [
  { label: 'Banking & Finance', icon: Landmark },
  { label: 'Telecom', icon: Smartphone },
  { label: 'Utilities', icon: Zap },
  { label: 'Housing & Landlords', icon: Building2 },
  { label: 'Government Services', icon: Globe },
  { label: 'E-commerce', icon: ShoppingCart },
];

const stats = [
  { value: '30s', label: 'Average letter draft' },
  { value: '190+', label: 'Countries supported' },
  { value: '98%', label: 'Resolution rate' },
];

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('redress_access_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 scroll-smooth transition-colors duration-300">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-indigo-500/[0.07] to-purple-600/[0.07] blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-1/3 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-500/[0.05] to-pink-500/[0.05] blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute inset-0 bg-grid opacity-50" />
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-36 pb-24 px-6 max-w-5xl mx-auto text-center">
        <div className="animate-fade-in-up" style={{ animationFillMode: 'both' }}>
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>AMD Developer Hackathon 2026</span>
          </div>
        </div>

        <h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[0.95] animate-fade-in-up text-slate-900 dark:text-white"
          style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
        >
          Your complaint,
          <br />
          <span className="gradient-text">handled.</span>
        </h1>

        <p
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
          style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
        >
          Draft formal complaint letters, find the right channel, and escalate to
          regulators — in minutes, for any country, any sector.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up"
          style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
        >
          <Link
            href="/register"
            className="btn-primary !py-4 !px-8 !text-base !rounded-2xl flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <span>Start resolving — it&apos;s free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="btn-secondary !py-4 !px-8 !text-base !rounded-2xl w-full sm:w-auto text-center"
          >
            See how it works
          </a>
        </div>

        {/* Stats Row */}
        <div
          className="mt-20 grid grid-cols-3 gap-4 max-w-md mx-auto animate-fade-in-up"
          style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-xs text-slate-600 dark:text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Three steps to <span className="gradient-text">resolution</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              Redress guides you from frustration to formal resolution with AI precision.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="group relative glass-card rounded-2xl p-8 hover:scale-[1.02] transition-all duration-300 animate-fade-in-up"
                  style={{
                    animationDelay: `${item.step * 0.1}s`,
                    animationFillMode: 'both',
                  }}
                >
                  {/* Step indicator glow */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  <div className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider mb-2">
                    Step {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {item.desc}
                  </p>

                  {/* Hover gradient line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${item.gradient} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="relative py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Built for <span className="gradient-text">every sector</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              From banking disputes to landlord issues — Redress knows the right channel and regulator.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {sectors.map((sector, i) => {
              const Icon = sector.icon;
              return (
                <div
                  key={sector.label}
                  className="group glass-card rounded-2xl p-6 text-center hover:scale-[1.03] hover:border-indigo-500/30 dark:hover:border-indigo-500/20 transition-all duration-300 cursor-default animate-fade-in-up"
                  style={{
                    animationDelay: `${i * 0.08}s`,
                    animationFillMode: 'both',
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:from-indigo-500/20 group-hover:to-purple-500/20 transition-colors">
                    <Icon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">
                    {sector.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-12 md:p-16 ambient-glow">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to get your complaint <span className="gradient-text">resolved?</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Join thousands who&apos;ve used Redress to hold companies and institutions accountable.
            </p>
            <Link
              href="/register"
              className="btn-primary !py-4 !px-10 !text-base !rounded-2xl inline-flex items-center space-x-2"
            >
              <span>Get started for free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <MinimalFooter />
    </div>
  );
}
