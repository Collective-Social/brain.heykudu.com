import AudioRecorder from '@/components/AudioRecorder';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-[100dvh] bg-[#0A0714] flex flex-col items-center justify-start p-4 sm:p-12 pt-16 sm:pt-20 selection:bg-brand-red selection:text-white relative overflow-x-hidden">
      
      {/* Decorative dark background glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 filter blur-[100px] animate-pulse-slow"></div>
        <div className="absolute top-[30%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 filter blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Header for Investors */}
      <div className="relative z-20 flex flex-col items-center w-full max-w-4xl mx-auto text-center mb-16 animate-in slide-in-from-top-12 fade-in duration-1000">
         <div className="w-24 h-24 mb-6 relative hover:scale-105 transition-transform duration-500">
            <Image src="/logo.png" alt="HeyKudu Clinical AI Logo" fill className="object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
         </div>
         <h1 className="text-4xl sm:text-[3.5rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight leading-[1.1] mb-6 drop-shadow-sm">
            Verify treatments against <br className="hidden sm:block"/> <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">clinical guidelines.</span>
         </h1>
         <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Your virtual senior consultant for instant, expert feedback on patient care.
         </p>
      </div>

      {/* Main Agentic Root */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <AudioRecorder />
      </div>

      {/* Investor Pitch Link */}
      <div className="relative z-50 mt-12 mb-8">
          <Link href="/pitch" className="inline-flex items-center px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-slate-300 hover:text-white transition-all shadow-[0_0_20px_rgba(0,0,0,0.2)]">
              <span>Pitch Deck ✨</span>
          </Link>
      </div>

      {/* Footer */}
      <footer className="relative z-50 w-full mt-auto pb-6 text-center text-[13px] font-medium text-slate-500">
        <p>
          &copy; {new Date().getFullYear()} Collective Social. <span className="mx-1 opacity-50">|</span> Built by <a href="https://heykudu.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white hover:underline transition-colors">HeyKudu.com</a>
        </p>
      </footer>

    </main>
  );
}
