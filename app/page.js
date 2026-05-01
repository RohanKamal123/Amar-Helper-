"use client";

import React, { useState, useEffect } from 'react';
// We import icons individually to prevent build errors
import { Mic, Send, AlertTriangle, FileText, CreditCard, ShieldCheck, ExternalLink } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function AmarDocHelper() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [language, setLanguage] = useState('bn');
  const [mounted, setMounted] = useState(false);

  // This ensures the page only renders once it's on the client browser
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAI = async () => {
    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_KEY;
    
    if (!input) return;
    if (!API_KEY) {
      alert("API Key is missing in Vercel settings!");
      return;
    }

    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `You are a Bangladesh Govt Document Helper. 
      Query: ${input}. 
      Language: ${language === 'bn' ? 'Bangla' : 'English'}.
      Return ONLY a JSON object with: service, fee, docs (array), warning, link.`;

      const result = await model.generateContent(prompt);
      const resultText = result.response.text();
      
      // Clean the text in case Gemini adds markdown code blocks
      const cleanJson = JSON.parse(resultText.replace(/```json|```/g, ""));
      setResponse(cleanJson);
    } catch (e) {
      console.error(e);
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  // Prevent Prerendering errors by returning null until mounted
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-[#006a4e] p-5 rounded-3xl text-white shadow-xl">
          <h1 className="font-bold text-xl tracking-tight">আমার ডক-হেল্পার 🇧🇩</h1>
          <button 
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')} 
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          >
            {language === 'bn' ? 'English' : 'বাংলা'}
          </button>
        </header>

        {/* Search Box */}
        <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 mb-8 transition-all">
          <div className="flex items-center gap-2 mb-4 text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full text-xs font-semibold">
            <ShieldCheck size={14}/>
            {language === 'bn' ? 'আপনার তথ্য নিরাপদ' : 'Your data is secure'}
          </div>
          
          <textarea 
            className="w-full h-32 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 outline-none text-slate-800 text-lg placeholder:text-slate-400"
            placeholder={language === 'bn' ? "কি সাহায্য প্রয়োজন? (যেমন: এনআইডি সংশোধন বা পাসপোর্ট)" : "What do you need help with? (e.g. NID or Passport)"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          
          <div className="flex gap-3 mt-4">
            <button 
              onClick={handleAI} 
              disabled={loading}
              className="flex-1 bg-[#006a4e] hover:bg-[#005a42] text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <><Send size={20}/> {language === 'bn' ? 'তথ্য দেখুন' : 'Get Info'}</>
              )}
            </button>
            <button className="bg-slate-100 p-4 rounded-2xl text-slate-500 hover:bg-slate-200 transition-colors">
              <Mic size={24}/>
            </button>
          </div>
        </div>

        {/* Result UI */}
        {response && (
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl border-t-[10px] border-[#006a4e] animate-in fade-in slide-in-from-bottom-5 duration-500">
            <h2 className="text-2xl font-black text-slate-800 mb-6">{response.service}</h2>
            
            <div className="bg-orange-50 p-4 rounded-2xl border-l-4 border-orange-500 mb-8">
              <p className="text-orange-900 text-sm flex gap-2 font-medium italic">
                <AlertTriangle size={20} className="shrink-0 text-orange-600"/> 
                {response.warning}
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="font-bold flex items-center gap-2 text-slate-700 mb-3 underline decoration-green-200 underline-offset-4">
                  <FileText size={20} className="text-green-600"/> 
                  {language === 'bn' ? 'প্রয়োজনীয় কাগজপত্র:' : 'Required Documents:'}
                </h3>
                <ul className="grid grid-cols-1 gap-2">
                  {response.docs.map((d, i) => (
                    <li key={i} className="text-slate-600 bg-slate-50 px-4 py-2 rounded-xl text-sm border border-slate-100 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span> {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div>
                  <h3 className="font-bold flex items-center gap-2 text-slate-700 mb-1">
                    <CreditCard size={20} className="text-green-600"/> 
                    {language === 'bn' ? 'সরকারি ফি:' : 'Official Fee:'}
                  </h3>
                  <p className="text-3xl font-black text-green-700">{response.fee}</p>
                </div>
                <a 
                  href={response.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2 shadow-lg"
                >
                  {language === 'bn' ? 'অফিশিয়াল ওয়েবসাইট' : 'Official Website'} <ExternalLink size={18}/>
                </a>
              </div>
            </div>
          </div>
        )}
        
        <footer className="mt-12 text-center text-slate-400 text-[10px] uppercase tracking-widest pb-10">
          Not a Government Application • Built with AI for Guidance
        </footer>
      </div>
    </div>
  );
}
