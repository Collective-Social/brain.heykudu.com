'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Brain, BookOpen, NotebookPen, Activity } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AudioRecorder() {
  const [status, setStatus] = useState<'idle' | 'authorizing' | 'recording' | 'processing' | 'completed' | 'error'>('idle');
  const [recordingTime, setRecordingTime] = useState(30);
  const [transcription, setTranscription] = useState('');
  const [feedback, setFeedback] = useState('');
  const [expandedPromptIndex, setExpandedPromptIndex] = useState<number | null>(null);
  const [errorDetails, setErrorDetails] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Desktop Drag Scrolling Logic
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollPos = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollPos.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseLeaveOrUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    scrollContainerRef.current.scrollLeft = scrollPos.current - walk;
  };

  useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    try {
      setStatus('authorizing');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleMediaStop;
      mediaRecorder.start();
      setStatus('recording');
      setRecordingTime(30);
      setTranscription('');
      setFeedback('');
      setExpandedPromptIndex(null);
      setErrorDetails('');
    } catch (err: any) {
      console.error('Failed to start recording', err);
      setErrorDetails(err.message || 'Microphone access denied or incompatible device.');
      setStatus('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setStatus('processing');
    }
  };

  const handleMediaStop = async () => {
    const activeMimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
    const audioBlob = new Blob(audioChunksRef.current, { type: activeMimeType });
    const formData = new FormData();
    const extension = activeMimeType.includes('mp4') ? '.mp4' : '.webm';
    formData.append('audio', audioBlob, 'recording' + extension);

    try {
      const tRes = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!tRes.ok) {
        const tErr = await tRes.text();
        throw new Error(`Transcription Failure: ${tRes.status} - ${tErr.substring(0, 500)}`);
      }
      const tData = await tRes.json();
      setTranscription(tData.transcription);

      const eRes = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcription: tData.transcription })
      });

      if (!eRes.ok) {
        const eErr = await eRes.text();
        throw new Error(`Evaluation Failure: ${eRes.status} - ${eErr.substring(0, 500)}`);
      }

      const eData = await eRes.json();
      setFeedback(eData.feedback);
      setStatus('completed');
    } catch (err: any) {
      console.error('Failed to process audio', err);
      setErrorDetails(err.message || 'Pipeline processing aborted.');
      setStatus('error');
    }
  };

  if (status === 'idle') {
    return (
      <div className="w-full animate-in fade-in zoom-in duration-500 overflow-x-hidden pb-12">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes data-flow {
            0% { transform: translateY(-100%); opacity: 0; }
            30% { opacity: 1; }
            70% { opacity: 1; }
            100% { transform: translateY(200%); opacity: 0; }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          @keyframes scanner {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
          .animate-data-flow { animation: data-flow 2s infinite linear; }
          .animate-shimmer { animation: shimmer 3s infinite linear; }
          .animate-scanner { animation: scanner 3s infinite linear; }
        `}} />

        <div className="flex flex-col items-center justify-start text-center w-full max-w-[480px] bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[48px] shadow-2xl p-6 sm:p-8 space-y-10 relative z-20 mx-auto">
        
        <button
          onClick={startRecording}
          className="relative group transition-all duration-300 w-48 h-48 bg-brand-red text-white rounded-full flex flex-col items-center justify-center shadow-[0_0_40px_rgba(255,50,50,0.4)] hover:bg-brand-red-hover hover:scale-105 hover:shadow-[0_0_60px_rgba(255,50,50,0.6)] active:scale-95 shrink-0"
        >
          <div className="absolute inset-0 rounded-full border-[10px] border-brand-red opacity-30 group-hover:animate-ping" />
          <Mic className="w-12 h-12 mb-3 drop-shadow-md" />
          <span className="text-xl font-black tracking-widest drop-shadow-md uppercase">Record</span>
        </button>

        <div className="w-full px-4 space-y-6 flex flex-col items-center mt-6">
          <div className="space-y-2 w-full">
            <h2 className="text-xl font-black tracking-tight text-white leading-tight mt-6 md:mt-2 drop-shadow-sm">
              Describe patient context & proposed treatment.
            </h2>
            <div className="mt-4 text-left bg-black/20 p-4 rounded-xl border border-white/5 shadow-inner">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Example</p>
              <p className="text-[13px] text-slate-300 italic leading-relaxed">
                "45-year-old male presenting with acute AFib. Heart rate is 140. I'm planning to administer Diltiazem."
              </p>
            </div>
          </div>
          
          <div className="relative flex flex-col items-center w-full max-w-sm mt-6">
             
             {/* Map Step 1 (Dark) */}
             <div className="flex items-center space-x-4 bg-[#14121C]/80 backdrop-blur-md p-4 rounded-[32px] border border-white/10 shadow-lg w-full z-10 transition-transform hover:-translate-y-1 relative overflow-hidden group">
               {/* Shine effect */}
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent -translate-x-full group-hover:animate-shimmer" />
               <div className="relative bg-brand-red/20 p-4 rounded-2xl text-brand-red flex items-center justify-center">
                 <div className="absolute inset-0 rounded-2xl bg-brand-red/30 animate-pulse opacity-50" />
                 <Mic className="w-6 h-6 relative z-10 drop-shadow-[0_0_10px_rgba(255,50,50,0.8)]" />
               </div>
               <div className="text-left flex-1 relative z-10">
                 <h3 className="font-black text-white text-[15px] tracking-tight">1. Record Audio</h3>
                 <p className="text-[12px] text-slate-400 font-medium leading-snug mt-1 uppercase tracking-widest">Speak your clinical case</p>
               </div>
             </div>

             {/* Animated Flowing Connector */}
             <div className="w-1.5 h-10 bg-white/5 relative overflow-hidden my-1 rounded-full flex justify-center">
                 {/* Travelling Data Packet */}
                 <div className="w-full h-1/2 bg-gradient-to-b from-transparent via-brand-red to-indigo-500 absolute top-0 animate-data-flow" />
             </div>

             {/* Map Step 2: AI Brain (Luminous) */}
             <div className="flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 p-5 rounded-full shadow-[0_0_40px_rgba(79,70,229,0.5)] w-11/12 z-10 hover:scale-105 transition-all cursor-default relative overflow-hidden">
               {/* Internal Pulse */}
               <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/30 to-indigo-400/0 animate-shimmer" />
               <Brain className="w-6 h-6 text-white animate-pulse relative z-10 drop-shadow-md" />
               <span className="font-black text-white tracking-[0.2em] uppercase text-sm relative z-10 drop-shadow-md">Clinical AI Brain</span>
             </div>

             {/* Split Flowing Connector */}
             <div className="flex w-full justify-center h-10 relative my-1">
               <div className="w-1.5 h-full bg-white/5 rounded-full overflow-hidden relative">
                   <div className="w-full h-1/2 bg-gradient-to-b from-transparent via-indigo-400 to-emerald-400 absolute top-0 animate-data-flow" style={{ animationDelay: '0.8s' }} />
               </div>
             </div>

             {/* Map Step 3: Verify Against Guidelines */}
             <div className="flex flex-col items-center justify-center bg-gradient-to-b from-blue-900/40 to-[#14121C]/90 backdrop-blur-md p-6 rounded-[32px] border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)] w-full z-10 transition-transform relative overflow-hidden group">
                 {/* Scanner line going across */}
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-blue-400/10 to-transparent animate-scanner" />
                 <div className="bg-blue-500/20 p-4 rounded-full mb-4 shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-transform animate-pulse w-max self-center border border-blue-400/20">
                    <BookOpen className="w-8 h-8 text-blue-400 drop-shadow-md" />
                 </div>
                 <div className="text-center w-full relative z-10">
                   <h3 className="font-black text-white text-[18px] tracking-tight mb-2 drop-shadow-sm">Verify Against Guidelines</h3>
                   <p className="text-[11px] text-blue-200/80 font-bold leading-relaxed uppercase tracking-[0.15em]">Cross-checks latest standards & provides LIVE feedback</p>
                 </div>
             </div>



          </div>
        </div>
        </div>

        {/* NEW HORIZONTAL TIMELINE SECTION */}
        <section className="mt-28 w-full">
            <div className="text-center mb-12 px-4">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 drop-shadow-md tracking-tight">It's time to give medical education the AI it deserves.</h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-[15px] md:text-[17px] leading-relaxed">
                    Plotting 116 years of medical training against the rise of Artificial Intelligence reveals a massive operational gap—and our exact entry point.
                </p>
            </div>

            {/* Scroll Hint removed per request */}

            <div 
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeaveOrUp}
                onMouseUp={handleMouseLeaveOrUp}
                onMouseMove={handleMouseMove}
                className="w-full overflow-x-auto pb-12 pt-32 hide-scrollbar cursor-grab active:cursor-grabbing select-none"
            >
                <div className="min-w-[1200px] max-w-[1400px] mx-auto relative h-[450px]">
                    
                    {/* Main Horizontal Time Axis */}
                    <div className="absolute top-1/2 left-12 right-12 h-1.5 bg-slate-800 -translate-y-1/2 rounded-full shadow-inner"></div>

                    {/* Labels for the tracks (Fixed clipping by tracking position correctly) */}
                    <div className="absolute top-[25%] left-4 -translate-y-1/2 text-blue-500 font-black uppercase tracking-[0.2em] text-[10px] opacity-60 -rotate-90 origin-center drop-shadow-md whitespace-nowrap">Medical Workflow</div>
                    <div className="absolute bottom-[25%] left-4 translate-y-1/2 text-emerald-500 font-black uppercase tracking-[0.2em] text-[10px] opacity-60 -rotate-90 origin-center drop-shadow-md whitespace-nowrap">AI Capability</div>

                    {/* Timeline Nodes Container */}
                    <div className="absolute inset-0 flex justify-between items-center pl-32 pr-16 relative z-10 pointer-events-none *:pointer-events-auto">

                        {/* Node 1: 1910 */}
                        <div className="relative w-60 h-full flex flex-col justify-center shrink-0">
                            {/* Top Track (Medical) */}
                            <div className="absolute bottom-[calc(50%+16px)] w-full px-2 flex flex-col items-center">
                                <div className="bg-[#14121C]/90 backdrop-blur-md w-full p-5 rounded-2xl border border-white/5 border-t-4 border-t-blue-500 text-center shadow-2xl relative z-20">
                                    <h4 className="text-blue-400 font-black tracking-tight mb-2 text-[15px]">Flexner Report</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">Modern clinical apprenticeship established. Paper logbooks become the unquestioned gold standard.</p>
                                </div>
                                <div className="w-0.5 h-6 bg-blue-500 mb-0 mt-2 relative z-10 opacity-70"></div>
                            </div>
                            
                            {/* Center Node */}
                            <div className="w-5 h-5 rounded-full bg-slate-900 border-4 border-slate-400 z-30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-6 text-slate-400 font-black text-sm tracking-widest bg-[#0A0714] px-3 z-20 rounded-full">1910</div>
                        </div>

                        {/* Node 2: 1950s/60s */}
                        <div className="relative w-60 h-full flex flex-col justify-center shrink-0">
                            {/* Bottom Track (AI) */}
                            <div className="absolute top-[calc(50%+16px)] w-full px-2 flex flex-col items-center">
                                <div className="w-0.5 h-6 bg-emerald-500 mt-0 mb-2 relative z-10 opacity-70"></div>
                                <div className="bg-[#14121C]/90 backdrop-blur-md w-full p-5 rounded-2xl border border-white/5 border-b-4 border-b-emerald-500 text-center shadow-2xl relative z-20">
                                    <h4 className="text-emerald-400 font-black tracking-tight mb-2 text-[15px]">Dawn of Computing</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">The term "Artificial Intelligence" is coined. Early expert systems are theorized but lack processing power.</p>
                                </div>
                            </div>
                            
                            {/* Center Node */}
                            <div className="w-5 h-5 rounded-full bg-slate-900 border-4 border-slate-400 z-30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-6 text-slate-400 font-black text-sm tracking-widest bg-[#0A0714] px-3 z-20 rounded-full">1960s</div>
                        </div>

                        {/* Node 3: 2000s */}
                        <div className="relative w-60 h-full flex flex-col justify-center shrink-0">
                            {/* Top Track (Medical) */}
                            <div className="absolute bottom-[calc(50%+16px)] w-full px-2 flex flex-col items-center opacity-80 hover:opacity-100 transition-opacity">
                                <div className="bg-[#14121C]/90 backdrop-blur-md w-full p-5 rounded-2xl border border-white/5 border-t-4 border-t-blue-500 text-center shadow-2xl relative z-20">
                                    <h4 className="text-blue-400 font-black tracking-tight mb-2 text-[15px]">The Digital Divide</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">Hospitals adopt EMRs for billing, but clinical education and training programs are left behind on paper.</p>
                                </div>
                                <div className="w-0.5 h-6 bg-blue-500 mb-0 mt-2 relative z-10 opacity-70"></div>
                            </div>

                            {/* Bottom Track (AI) */}
                            <div className="absolute top-[calc(50%+16px)] w-full px-2 flex flex-col items-center">
                                <div className="w-0.5 h-6 bg-emerald-500 mt-0 mb-2 relative z-10 opacity-70"></div>
                                <div className="bg-[#14121C]/90 backdrop-blur-md w-full p-5 rounded-2xl border border-white/5 border-b-4 border-b-emerald-500 text-center shadow-2xl relative z-20">
                                    <h4 className="text-emerald-400 font-black tracking-tight mb-2 text-[15px]">Deep Learning</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">Neural networks conquer pattern recognition and imaging, laying the groundwork for complex data analysis.</p>
                                </div>
                            </div>
                            
                            {/* Center Node */}
                            <div className="w-5 h-5 rounded-full bg-slate-900 border-4 border-slate-400 z-30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-6 text-slate-400 font-black text-sm tracking-widest bg-[#0A0714] px-3 z-20 rounded-full">2010s</div>
                        </div>

                        {/* Node 4: 2020s (The Contrast Node) */}
                        <div className="relative w-64 h-full flex flex-col justify-center shrink-0">
                            {/* Top Track (Medical) */}
                            <div className="absolute bottom-[calc(50%+16px)] w-full px-2 flex flex-col items-center">
                                <div className="bg-red-950/40 border border-red-500/30 w-full p-5 rounded-2xl text-center shadow-[0_0_30px_rgba(239,68,68,0.15)] relative z-20">
                                    <div className="text-red-400 text-3xl mb-3 drop-shadow-md">📝</div>
                                    <h4 className="text-red-400 font-black tracking-tight mb-2 text-[15px]">The Paper Stagnation</h4>
                                    <p className="text-xs text-red-200/80 leading-relaxed font-medium">Despite digital revolutions everywhere else, medical residents are <strong className="text-white">still required</strong> to carry physical notebooks and manual logbooks, wasting up to 50% of their day.</p>
                                </div>
                                <div className="w-0.5 h-6 bg-red-500 mb-0 mt-2 relative z-10 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                            </div>

                            {/* Bottom Track (AI) */}
                            <div className="absolute top-[calc(50%+16px)] w-full px-2 flex flex-col items-center">
                                <div className="w-0.5 h-6 bg-emerald-500 mt-0 mb-2 relative z-10 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                                <div className="bg-[#14121C]/90 backdrop-blur-md w-full p-5 rounded-2xl border border-white/5 border-b-4 border-b-emerald-500 text-center shadow-[0_0_30px_rgba(16,185,129,0.15)] relative z-20">
                                    <h4 className="text-emerald-400 font-black tracking-tight mb-2 text-[15px]">The GenAI Era</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">Large Language Models achieve human-level reasoning, capable of structuring and verifying complex, messy data instantly.</p>
                                </div>
                            </div>
                            
                            {/* Center Node */}
                            <div className="w-7 h-7 rounded-full bg-slate-900 border-4 border-white z-30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-pulse"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-7 text-white font-black text-sm tracking-widest bg-[#0A0714] px-4 py-1 z-20 rounded-full border border-white/10 shadow-lg">2020s</div>
                        </div>

                        {/* Node 5: Today / The Platform */}
                        <div className="relative w-80 h-full flex flex-col justify-center shrink-0 ml-12">
                            <div className="bg-[#191624]/95 backdrop-blur-2xl p-8 rounded-[32px] border border-amber-400/50 text-center shadow-[0_0_50px_rgba(245,158,11,0.15)] relative z-40 transition-transform hover:-translate-y-2">
                                <div className="text-amber-400 text-4xl mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">⚡</div>
                                <h4 className="text-[22px] font-black text-white mb-3 uppercase tracking-wider drop-shadow-sm">The Convergence</h4>
                                <p className="text-[13px] text-slate-300 leading-relaxed font-medium">
                                    Our platform ends 116 years of paper friction by directly applying modern GenAI to unstructured training exhaust, creating <span className="text-amber-400 font-bold">instant operational leverage.</span>
                                </p>
                            </div>
                            {/* Center Node */}
                            <div className="w-10 h-10 rounded-full bg-amber-400 border-[6px] border-[#0A0714] z-30 absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_30px_rgba(245,158,11,0.8)] animate-pulse"></div>
                        </div>

                    </div>
                </div>
            </div>
            {/* Scroll Hint for Mobile */}
            <div className="text-center text-[11px] uppercase tracking-widest font-bold text-slate-500 mt-2 md:hidden animate-pulse">Swipe timeline horizontally →</div>
        </section>



        {/* Bottom CTA & Back to Top */}
        <section className="w-full max-w-4xl mx-auto mb-20 px-4 text-center animate-in fade-in duration-1000">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 drop-shadow-md">See It In Action</h2>
            <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-lg mx-auto">
                Capture your learning through patient context and proposed treatment plan right now.
            </p>
            
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="group relative inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-brand-red to-orange-600 text-white font-black uppercase tracking-[0.15em] text-sm rounded-full shadow-[0_0_40px_rgba(255,50,50,0.3)] hover:scale-105 transition-all duration-300 pointer-events-auto"
            >
                <div className="absolute inset-0 rounded-full border border-white/30 group-hover:animate-ping opacity-50" />
                <span className="mr-3 relative z-10 drop-shadow-md">Start Now</span>
                <svg className="w-5 h-5 relative z-10 drop-shadow-md group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
            </button>
        </section>

      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full max-w-md mx-auto space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-500 py-8 px-4">
      
      {/* Authorizing State Tracker */}
      {status === 'authorizing' && (
         <div className="w-full bg-[#0F0E17]/90 backdrop-blur-2xl border border-blue-500/30 rounded-[48px] p-10 shadow-[0_0_50px_rgba(59,130,246,0.15)] flex flex-col items-center animate-in zoom-in duration-500">
             <div className="mb-8 relative">
                 <div className="w-20 h-20 bg-blue-500/20 rounded-full animate-ping absolute top-0 left-0" />
                 <div className="w-20 h-20 bg-[#162032] rounded-full flex items-center justify-center relative border border-blue-400/40 shadow-inner">
                     <Mic className="w-8 h-8 text-blue-400 animate-pulse" />
                 </div>
             </div>
             <h2 className="text-[22px] font-black text-white mb-3 tracking-tight">Requesting Access</h2>
             <p className="text-slate-400 text-center text-[15px] font-medium leading-relaxed px-2">
                 Please click <strong className="text-white px-1">Allow</strong> in your browser popup to enable the microphone.
             </p>
         </div>
      )}

      {/* Massive Active Recording Circle & Gen Alpha Guidance Card */}
      {status === 'recording' && (
        <div className="flex flex-col items-center w-full animate-in zoom-in duration-500">
          
          <div className="w-full bg-[#0F0E17]/80 backdrop-blur-2xl border border-white/5 rounded-[48px] p-6 sm:p-8 shadow-2xl flex flex-col items-center relative overflow-hidden">
             
             {/* Subtle Glow inside the card */}
             <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-brand-red/10 rounded-full blur-[60px] animate-pulse"></div>
             </div>
             
             {/* Title Text */}
             <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight text-center mb-10 relative z-10 w-full px-2 drop-shadow-md">
               Tell us about the patient's context and your proposed treatment plan.
             </h2>

             {/* Red Circle */}
             <div 
               onClick={stopRecording}
               className="relative flex flex-col items-center justify-center transition-all duration-300 cursor-pointer w-60 h-60 sm:w-64 sm:h-64 rounded-full shadow-[0_0_50px_rgba(255,50,50,0.3)] bg-brand-red text-white hover:bg-brand-red-hover active:scale-95 mb-10 z-10 shrink-0"
             >
               <div className="absolute inset-0 rounded-full border-[10px] border-brand-red opacity-30 animate-pulse shadow-[0_0_30px_rgba(255,100,100,0.5)]" />
               <div className="absolute inset-0 rounded-full border-[3px] border-white/20 scale-105 animate-ping opacity-40" />
               
               <div className="flex items-end justify-center space-x-1.5 h-10 mb-4 z-10 w-full mt-2">
                  <div className="w-2.5 bg-white rounded-full animate-wave shadow-sm" style={{ animationDelay: '0.0s' }}></div>
                  <div className="w-2.5 bg-white/90 rounded-full animate-wave shadow-sm" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2.5 bg-white/80 rounded-full animate-wave shadow-sm" style={{ animationDelay: '0.4s' }}></div>
                  <div className="w-2.5 bg-white/90 rounded-full animate-wave shadow-sm" style={{ animationDelay: '0.6s' }}></div>
                  <div className="w-2.5 bg-white/70 rounded-full animate-wave shadow-sm" style={{ animationDelay: '0.8s' }}></div>
               </div>

               <div className="text-6xl font-black z-10 tracking-tighter drop-shadow-md">
                 {formatTime(recordingTime)}
               </div>
               
               <p className="mt-4 text-[10px] sm:text-xs font-extrabold tracking-[0.2em] uppercase opacity-90 z-10 animate-pulse">
                 Tap Anywhere To Stop
               </p>
             </div>

             {/* Prompt Ideas */}
             <div className="flex flex-col items-center w-full z-10 mt-2">
                <span className="text-[11px] font-extrabold tracking-[0.25em] text-slate-500 uppercase mb-4">Prompt Ideas</span>
                <div className="flex flex-col space-y-3 w-full items-center">
                   {[
                     {
                       short: '"65y/o male, history of hypertension..."',
                       full: '"65y/o male, history of hypertension, presenting with severe headache and blurred vision. What is the recommended diagnostic pathway?"'
                     },
                     {
                       short: '"Suspected atrial fibrillation..."',
                       full: '"Suspected atrial fibrillation in a 50y/o female complaining of palpitations. What does the primary healthcare guideline recommend for management?"'
                     },
                     {
                       short: '"Next steps for DM Type 2..."',
                       full: '"Next steps for DM Type 2 patient with declining renal function and poorly controlled HbA1c on Metformin alone."'
                     }
                   ].map((prompt, index) => {
                     const isExpanded = expandedPromptIndex === index;
                     return (
                       <div 
                         key={index}
                         onClick={() => setExpandedPromptIndex(isExpanded ? null : index)}
                         className={`bg-white/5 border border-white/10 text-slate-300 text-[13px] sm:text-sm font-bold px-5 py-3.5 shadow-inner hover:bg-white/10 transition-all cursor-pointer w-full text-center ${isExpanded ? 'rounded-2xl whitespace-normal break-words leading-relaxed' : 'rounded-full truncate'}`}
                       >
                          {isExpanded ? prompt.full : prompt.short}
                       </div>
                     );
                   })}
                </div>
             </div>

          </div>
        </div>
      )}

      {status === 'processing' && (
         <div className="w-full space-y-8 animate-in fade-in duration-700">
           
           {/* Live Transcription Box (Dark variant) */}
           {(status === 'processing' && transcription) && (
             <div className="px-4 text-left w-full space-y-4 animate-in fade-in duration-500">
               <h3 className="text-xs font-bold tracking-[0.2em] text-emerald-400 uppercase flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-2" />
                  Transcription Captured
               </h3>
               <div className="bg-white/5 p-4 rounded-xl border border-white/10 shadow-lg relative overflow-hidden backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-l from-[#191522] to-transparent pointer-events-none z-10" />
                  <p className="text-lg italic text-slate-300 font-medium leading-relaxed">
                     "{transcription}"
                  </p>
               </div>
             </div>
           )}

           {/* Ghost Outline: Whisper Box Dark */}
           {(status === 'processing' && !transcription) && (
             <div className="px-4 text-left w-full space-y-4">
               <h3 className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase flex items-center">
                  <div className="w-3 h-3 border-2 border-brand-red border-t-transparent rounded-full animate-spin mr-2"></div>
                  Transcribing Audio...
               </h3>
               <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2.5 animate-pulse backdrop-blur-md">
                  <div className="h-3.5 bg-white/10 rounded block w-full"></div>
                  <div className="h-3.5 bg-white/10 rounded block w-[90%]"></div>
                  <div className="h-3.5 bg-white/10 rounded block w-[70%]"></div>
               </div>
             </div>
           )}

           {/* Ghost Outline: Feedback Card Dark */}
           <div className="relative bg-[#0F0E17]/80 backdrop-blur-md rounded-[32px] p-6 text-left border border-white/5 shadow-2xl mb-8 animate-pulse">
             <div className="absolute -left-3 top-8 bg-[#1A1825] p-2 rounded-full border border-white/10 shadow-lg w-10 h-10 flex items-center justify-center">
                 <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin"></div>
             </div>
             
             <div className="pl-6 space-y-5">
               {/* Badge Skeleton */}
               <div className="h-6 w-28 bg-white/10 rounded-full mb-3"></div>
               
               {/* Header Skeleton */}
               <div className="h-4 w-56 bg-white/20 rounded mb-5"></div>
               
               {/* Paragraph Box Skeleton */}
               <div className="space-y-4">
                 <div className="h-3 bg-white/10 rounded w-full"></div>
                 <div className="h-3 bg-white/10 rounded w-[94%]"></div>
                 <div className="h-3 bg-white/10 rounded w-[88%]"></div>
                 <div className="h-3 bg-white/10 rounded w-[75%]"></div>
               </div>

               {/* Extra details skeleton */}
               <div className="space-y-4 pt-4">
                 <div className="h-3 bg-white/5 rounded w-full"></div>
                 <div className="h-3 bg-white/5 rounded w-[60%]"></div>
               </div>

               {/* AI Loading Status */}
               <div className="pt-6 flex items-center space-x-2 text-indigo-300 text-[13px] font-bold tracking-wide">
                  <Brain className="w-5 h-5 animate-bounce text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                  <span>Evaluating against guidelines...</span>
               </div>
             </div>
           </div>

         </div>
      )}

      {(status === 'completed' || transcription !== '') && (
        <div className="w-full space-y-8 animate-in fade-in duration-700">
          
          <div className="px-4 text-left w-full space-y-4">
            <h3 className="text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">Live Whisper</h3>
            <p className="text-lg italic text-slate-300 font-medium bg-white/5 p-4 rounded-xl border border-white/10 shadow-inner leading-relaxed">
              {transcription || '...Processing transcription...'}
            </p>
          </div>

          {status === 'completed' && (() => {
             let bannerTheme = {
               bg: "bg-emerald-950/40",
               border: "border-emerald-500/20",
               iconBg: "bg-[#0B1510]",
               iconBorder: "border-emerald-500/30",
               iconColor: "text-emerald-400",
               badgeBg: "bg-emerald-500/20",
               badgeText: "text-emerald-300",
               BannerIcon: CheckCircle2,
               text: "Correct"
             };

             const upperFb = feedback.toUpperCase();
             if (upperFb.includes('STATUS: INCORRECT') || upperFb.includes('EVALUATION:** **INCORRECT')) {
               bannerTheme = {
                 bg: "bg-rose-950/40",
                 border: "border-rose-500/20",
                 iconBg: "bg-[#1A0B0E]",
                 iconBorder: "border-rose-500/30",
                 iconColor: "text-rose-400",
                 badgeBg: "bg-rose-500/20",
                 badgeText: "text-rose-300",
                 BannerIcon: XCircle,
                 text: "Incorrect"
               };
             } else if (upperFb.includes('PARTIALLY CORRECT')) {
               bannerTheme = {
                 bg: "bg-amber-950/30",
                 border: "border-amber-500/20",
                 iconBg: "bg-[#1A1308]",
                 iconBorder: "border-amber-500/30",
                 iconColor: "text-amber-400",
                 badgeBg: "bg-amber-500/20",
                 badgeText: "text-amber-300",
                 BannerIcon: AlertTriangle,
                 text: "Partially Correct"
               };
             }
             const { BannerIcon } = bannerTheme;

             return (
          <div className={`relative ${bannerTheme.bg} backdrop-blur-2xl rounded-[32px] p-6 text-left border ${bannerTheme.border} shadow-2xl mb-8 transition-colors duration-500`}>
            <div className={`absolute -left-3 top-8 ${bannerTheme.iconBg} p-2 rounded-full border ${bannerTheme.iconBorder} shadow-lg z-10`}>
                <BannerIcon className={`w-6 h-6 ${bannerTheme.iconColor}`} />
            </div>
            <div className="pl-6 space-y-3">
              <div className={`inline-flex items-center ${bannerTheme.badgeBg} ${bannerTheme.badgeText} text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3`}>
                <BannerIcon className="w-3 h-3 mr-1.5" />
                {bannerTheme.text}
              </div>
              <h4 className="text-white font-black text-[13px] tracking-widest uppercase mb-3">
                Feedback Based on Guidelines
              </h4>
              <div className="text-slate-300 font-medium text-[15px] leading-relaxed markdown-override">
                {feedback ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-2 opacity-90" {...props} />,
                      li: ({ node, ...props }) => <li className="..." {...props} />,
                      strong: ({ node, ...props }) => <strong className="font-black text-white px-1" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-[17px] font-black text-white mt-6 mb-3 tracking-tight" {...props} />
                    }}
                  >
                    {feedback}
                  </ReactMarkdown>
                ) : (
                  <span className="italic text-slate-500">Awaiting response...</span>
                )}
              </div>
            </div>
          </div>
          );
        })()}

          {status === 'completed' && (
              <button
                 onClick={() => setStatus('idle')}
                 className="w-full py-5 bg-indigo-600/60 text-white font-extrabold text-xl rounded-full shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:bg-indigo-500 hover:-translate-y-1 transition-all flex items-center justify-center space-x-3 border border-indigo-400/30 backdrop-blur-sm mt-4"
              >
                 <span>☁️ Clear & Reset ✨</span>
              </button>
          )}
        </div>
      )}

      {status === 'error' && (() => {
         const isPermissionError = errorDetails.toLowerCase().includes('denied') || errorDetails.toLowerCase().includes('not allowed');
         const displayError = isPermissionError 
            ? "Microphone access was blocked by your browser or device." 
            : errorDetails;

         return (
             <div className="w-full text-center text-red-500 font-bold p-8 bg-[#1B0F13]/90 backdrop-blur-xl rounded-[40px] border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.15)] animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                   <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-[17px] text-red-400 tracking-tight mb-2">Something went wrong.</p>
                {displayError && <p className="text-sm font-medium text-red-300/80 mt-2 mb-6 border-l-2 border-red-500/30 pl-3 break-words text-left mx-4">{displayError}</p>}
                
                {isPermissionError && (
                   <div className="bg-red-500/5 rounded-xl p-4 mb-6 text-[13px] text-red-300/90 text-left font-medium leading-relaxed">
                      <strong>Fix:</strong> Tap the lock icon <span className="inline-block align-middle pb-0.5">🔒</span> next to your URL bar and switch Microphone access from Block to Allow, then hit try again.
                   </div>
                )}

                <button onClick={() => setStatus('idle')} className="w-full py-4 bg-red-500/10 text-red-400 font-extrabold uppercase tracking-widest text-sm rounded-full hover:bg-red-500/20 transition-colors border border-red-500/30">
                   Try Again
                </button>
             </div>
         );
      })()}
    </div>
  );
}
