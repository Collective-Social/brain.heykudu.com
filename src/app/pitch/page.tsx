import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Clock, Activity, FileText, AlertTriangle } from 'lucide-react';

export default function PitchPage() {
  return (
    <main className="min-h-[100dvh] bg-[#0A0714] selection:bg-indigo-500 selection:text-white relative overflow-x-hidden font-sans">
      
      {/* Decorative dark background glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[50%] rounded-full bg-blue-600/10 filter blur-[150px] animate-pulse-slow"></div>
        <div className="absolute top-[40%] right-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-600/10 filter blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-20 w-full max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-24">
        
        {/* Navigation & Header */}
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-16 group font-bold tracking-tight text-sm uppercase">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Interactive Demo
        </Link>
        
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-24 animate-in slide-in-from-bottom-8 duration-700">
            <div className="max-w-4xl">
                <div className="inline-flex items-center space-x-2 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full mb-6">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
                    <span className="text-[12px] font-black text-red-400 tracking-[0.2em] uppercase">The Clinical Bottleneck</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 tracking-tighter leading-[1.05] mb-8 drop-shadow-sm">
                    1 Doctor, 8 Students and 40 patients in the waiting room.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">0 Time.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed max-w-3xl">
                    Senior doctors are caught in an impossible tug-of-war. They must simultaneously manage active, high-stakes patient care while training a rotating cohort of students who desperately need guidance, feedback, and answers. Time is the bottleneck, and <strong className="text-white">personalized medical education is the collateral damage.</strong>
                </p>
            </div>
            <div className="hidden md:block w-32 h-32 relative shrink-0 opacity-80 mt-8 md:mt-0">
               <Image src="/logo.png" alt="HeyKudu Brain" fill className="object-contain drop-shadow-[0_0_50px_rgba(248,113,113,0.3)] animate-pulse-slow" />
            </div>
        </div>

        {/* Condensed Bento Box Grid: The Core Bottleneck */}
        <section className="mb-24 animate-in fade-in duration-1000 delay-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Card 1: Mentorship Deficit */}
                <div className="bg-[#14121C]/90 backdrop-blur-md rounded-[32px] p-10 border border-white/5 hover:border-blue-500/30 transition-colors shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full filter blur-[40px]" />
                    <div className="bg-blue-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                        <AlertTriangle className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight mb-4">The Mentorship Deficit</h3>
                    <p className="text-slate-400 text-[16px] leading-relaxed mb-6 font-medium flex-1">
                        Medical students require strict ethical supervision and have endless questions. Attending physicians have flooded waiting rooms. When balancing high-stakes patient care, doctors cannot safely or ethically provide the direct, real-time supervisory feedback 8 individual students require to grow.
                    </p>
                </div>

                {/* Card 2: The Training Tax (Updated per user feedback) */}
                <div className="bg-[#14121C]/90 backdrop-blur-md rounded-[32px] p-10 border border-white/5 hover:border-orange-500/30 transition-colors shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full filter blur-[40px]" />
                    <div className="bg-orange-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-orange-500/20">
                        <FileText className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight mb-4">The Repetitive Training Tax</h3>
                    <p className="text-slate-400 text-[16px] leading-relaxed mb-6 font-medium flex-1">
                        Currently, students capture disjointed notes on paper, wait hours, and explicitly have to trace down their overworked doctors just to secure a physical signature. It is a profoundly broken, repetitive process that stifles actual active learning on the floor.
                    </p>
                </div>

                {/* Card 3: The 4.5 Hour Drain */}
                <div className="bg-[#14121C]/90 backdrop-blur-md rounded-[32px] p-10 border border-white/5 hover:border-red-500/30 transition-colors shadow-2xl relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full filter blur-[40px]" />
                    <div className="bg-red-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
                        <Clock className="w-6 h-6 text-red-400" />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight mb-4">The 4.5 Hour Daily Drain</h3>
                    <p className="text-slate-400 text-[16px] leading-relaxed mb-6 font-medium flex-1">
                        The average clinician wastes over 4.5 hours per day dealing with unstructured clinical exhaust, fragmented systems, and manual compliance tracking—time that should implicitly be spent on patient care and real-time student mentorship.
                    </p>
                </div>

                {/* Card 4: The AI Supervisor */}
                <div className="bg-[#14121C]/90 backdrop-blur-md rounded-[32px] p-10 border border-white/5 hover:border-emerald-500/30 transition-colors shadow-2xl relative overflow-hidden flex flex-col border-emerald-500/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full filter blur-[40px]" />
                    <div className="bg-emerald-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                        <Activity className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 tracking-tight mb-4">The AI Co-Pilot & Supervisor</h3>
                    <p className="text-slate-400 text-[16px] leading-relaxed mb-6 font-medium flex-1">
                        We introduce AI not to replace the doctor, but to act as the ultimate clinician educator. Structuring student cases and verifying guidelines instantly gives both the doctor their time back, and the student their answers.
                    </p>
                </div>

            </div>
        </section>

        {/* Action Call */}
        <div className="mt-12 text-center pb-24 border-t border-white/10 pt-16">
            <Link href="/" className="inline-flex items-center justify-center px-12 py-5 bg-gradient-to-r from-blue-600 to-emerald-500 text-white font-black uppercase tracking-[0.1em] text-sm rounded-full shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:scale-105 transition-all duration-300">
               Test The Live Solution Now <ArrowLeft className="w-5 h-5 opacity-0 -ml-10 group-hover:opacity-100 group-hover:ml-3 transition-all scale-x-[-1]" />
            </Link>
        </div>

      </div>
    </main>
  );
}
