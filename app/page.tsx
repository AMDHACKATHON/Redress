import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#0f0f0f] scroll-smooth">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold tracking-tight">Redress</div>
        <div className="flex items-center space-x-6">
          <Link href="/login" className="text-sm font-medium hover:text-gray-600 transition-colors">
            Login
          </Link>
          <Link 
            href="/register" 
            className="bg-[#1A1A2E] text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-[#2A2A4E] transition-all shadow-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
          Your complaint, handled.
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
          Redress helps you draft formal complaint letters, find the right channel, and escalate to regulators — in minutes, for any country, any sector.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link 
            href="/register" 
            className="w-full sm:w-auto bg-[#1A1A2E] text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-[#2A2A4E] transition-all shadow-lg"
          >
            Get Started — it's free
          </Link>
          <a 
            href="#how-it-works" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-medium border border-gray-200 hover:bg-gray-50 transition-all"
          >
            See how it works
          </a>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Describe your problem",
                desc: "Tell the agent what happened in plain language."
              },
              {
                step: 2,
                title: "Get your letter",
                desc: "The agent drafts a professional complaint letter instantly."
              },
              {
                step: 3,
                title: "Escalate if needed",
                desc: "If ignored, escalate to the relevant regulator automatically."
              }
            ].map((item) => (
              <div key={item.step} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="w-10 h-10 bg-[#1A1A2E] text-white rounded-full flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">Who it's for</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            "Banking & Finance",
            "Telecom",
            "Utilities",
            "Housing & Landlords",
            "Government Services",
            "E-commerce"
          ].map((tag) => (
            <div 
              key={tag} 
              className="px-4 py-6 text-center rounded-xl border border-gray-100 bg-white hover:border-[#1A1A2E] hover:shadow-md transition-all cursor-default"
            >
              <p className="text-sm font-semibold">{tag}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="text-2xl font-bold tracking-tight">Redress</div>
            <p className="text-gray-600 max-w-xs">
              AI-powered complaint resolution for everyone.
            </p>
          </div>
          <div className="flex flex-col md:items-end space-y-4">
            <div className="flex space-x-6 text-sm font-medium">
              <Link href="/login" className="hover:text-gray-600">Login</Link>
              <Link href="/register" className="hover:text-gray-600">Register</Link>
            </div>
            <div className="text-sm text-gray-400">
              © 2026 Redress. AMD Developer Hackathon.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
