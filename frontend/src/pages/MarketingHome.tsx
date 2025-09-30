import { Link } from 'react-router-dom';
import { FaMagic, FaCogs, FaCheck, FaArrowRight, FaBolt, FaRocket, FaShieldAlt } from 'react-icons/fa';
import { PricingTable } from '@clerk/clerk-react';

export default function MarketingHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 shadow-lg rounded-b-2xl sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/5">
        <div className="flex items-center gap-3">
          <FaMagic className="text-3xl text-pink-300 drop-shadow-lg animate-pulse" />
          <span className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
            Buildify <FaCogs className="inline text-indigo-300 animate-spin-slow" />
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-blue-100">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how" className="hover:text-white transition">How it works</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <a href="#faq" className="hover:text-white transition">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/start" className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 transition">Start Building</Link>
        </div>
      </header>

      <main className="flex-1 relative">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 h-72 w-72 bg-pink-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 bg-indigo-500/30 rounded-full blur-3xl animate-pulse" />

        {/* Hero */}
        <section className="px-6 pt-16 pb-12 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight max-w-5xl mx-auto">
            <span className="bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-500 bg-clip-text text-transparent">
              Ship full websites from a single prompt
            </span>
          </h1>
          <p className="mt-6 text-blue-200 text-lg max-w-2xl mx-auto">
            Buildify turns ideas into production‑ready React + Tailwind projects with live preview and iterative AI guidance.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/start" className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white font-bold shadow hover:from-yellow-300 hover:via-pink-400 hover:to-purple-500 transition inline-flex items-center gap-2">
              Get Started <FaArrowRight />
            </Link>
            <a href="#features" className="px-6 py-3 rounded-xl border border-white/30 text-white hover:bg-white/10 transition">
              Explore Features
            </a>
          </div>

          {/* Stats */}
          <div className="mt-12 grid gap-4 md:grid-cols-3 max-w-5xl mx-auto text-blue-100">
            {[{label:'Avg. setup time', value:'< 1 min'}, {label:'Starter templates', value:'50+'}, {label:'NPM packages handled', value:'Auto'}].map(s => (
              <div key={s.label} className="rounded-2xl bg-white/5 border border-blue-700 p-5 hover:bg-white/10 transition">
                <div className="text-3xl font-extrabold text-white">{s.value}</div>
                <div className="text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-6 py-14 max-w-6xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white text-center">Everything you need</h2>
          <p className="text-blue-200 text-center mt-2">From scaffolding to live preview — fully in your browser.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[{
              icon: <FaBolt className="text-yellow-300" />, title: 'Instant setup', desc: 'Scaffold modern React + Vite + Tailwind projects with a single prompt.'
            },{
              icon: <FaRocket className="text-pink-300" />, title: 'Live WebContainer', desc: 'Run dev servers in‑browser. No local Node setup required.'
            },{
              icon: <FaShieldAlt className="text-indigo-300" />, title: 'Best practices', desc: 'Clean structure, sensible defaults, and production‑ready UI patterns.'
            }].map((f) => (
              <div key={f.title} className="rounded-2xl bg-white/5 border border-blue-700 p-6 text-blue-100 hover:-translate-y-1 hover:shadow-2xl transition-transform">
                <div className="text-2xl">{f.icon}</div>
                <h3 className="text-white font-bold text-lg mt-3">{f.title}</h3>
                <p className="mt-2 text-sm text-blue-200">{f.desc}</p>
                <ul className="mt-4 text-sm space-y-1">
                  {["No CLI installs", "Optimized Vite config", "First‑class Tailwind"].map(i => (
                    <li key={i} className="flex items-center gap-2"><FaCheck className="text-green-300" /> {i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="px-6 py-14 max-w-6xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white text-center">How it works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[{
              step: '1', title: 'Describe', desc: 'Write a prompt or paste requirements. Optionally add image URLs for content.'
            },{
              step: '2', title: 'Generate', desc: 'Buildify crafts structure, dependencies, and files — ready to run.'
            },{
              step: '3', title: 'Preview & refine', desc: 'Live dev server runs instantly. Switch to code and guide improvements.'
            }].map(card => (
              <div key={card.step} className="rounded-2xl bg-white/5 border border-blue-700 p-6 hover:bg-white/10 transition">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white flex items-center justify-center font-extrabold">
                  {card.step}
                </div>
                <h3 className="text-white font-bold text-lg mt-3">{card.title}</h3>
                <p className="mt-2 text-sm text-blue-200">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-6 py-14 max-w-6xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white text-center">Loved by builders</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[`“I shipped a landing page in an hour. The live dev preview is magic.”`,
              `“Great defaults. Tailwind + Vite + React just worked — no config.”`,
              `“Iterating with code + chat is the flow I always wanted.”`].map((quote, i) => (
              <div key={i} className="rounded-2xl bg-white/5 border border-blue-700 p-6 text-blue-100 italic hover:-translate-y-1 transition-transform">
                {quote}
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="px-6 py-16 bg-black/20 border-t border-blue-800">
          <h2 className="text-3xl font-extrabold text-white text-center">Pricing</h2>
          <p className="text-blue-200 text-center mt-2">Simple, transparent plans. Scale as you grow.</p>

          <div className="mt-10 max-w-6xl mx-auto">
            <div className="rounded-2xl p-1 bg-white/10">
              <PricingTable
                appearance={{
                  variables: {
                    colorPrimary: '#ec4899', // pink-500
                    colorBackground: 'transparent',
                    colorText: '#e5e7eb', // gray-200
                    colorInputBackground: 'rgba(255,255,255,0.04)'
                  },
                  elements: {
                    rootBox: 'text-blue-200',
                    card: 'bg-white/5 border border-blue-700 rounded-2xl',
                    header: 'text-white',
                    planName: 'text-white font-bold text-xl',
                    priceText: 'text-white text-3xl font-extrabold',
                    featureItem: 'text-blue-200',
                    primaryButton: 'mt-4 px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white font-bold hover:from-yellow-300 hover:via-pink-400 hover:to-purple-500',
                    secondaryButton: 'mt-4 px-5 py-2 rounded-xl border border-white/30 text-white hover:bg-white/10'
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-6 py-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white text-center">Frequently asked questions</h2>
          <div className="mt-8 space-y-3">
            {[{
              q: 'Do I need Node installed locally?', a: 'No. We run the dev server inside your browser using WebContainer.'
            },{
              q: 'Can I edit the code?', a: 'Yes. You can switch to Code at any time. The preview persists while you edit.'
            },{
              q: 'Which frameworks are supported?', a: 'React + Vite + Tailwind are first‑class. Node templates are also available.'
            }].map((item, idx) => (
              <details key={idx} className="rounded-xl bg-white/5 border border-blue-700 p-4 open:shadow-lg transition">
                <summary className="cursor-pointer text-white font-semibold">{item.q}</summary>
                <p className="mt-2 text-blue-200 text-sm">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="px-6 py-10 text-center text-blue-300 border-t border-blue-800">
        <div className="text-white text-lg font-semibold">Ready to build?</div>
        <Link to="/start" className="mt-3 inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-white font-bold hover:from-yellow-300 hover:via-pink-400 hover:to-purple-500">
          Start for free <FaArrowRight />
        </Link>
        <div className="mt-6">© {new Date().getFullYear()} Buildify. All rights reserved.</div>
      </footer>
    </div>
  );
}


