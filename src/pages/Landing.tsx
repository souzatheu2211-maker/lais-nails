"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Heart, Star, Instagram, Scissors, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import laisBg from "@/assets/lais-bg.jpeg";

const Landing = () => {
  const navigate = useNavigate();

  const galleryItems = [
    { icon: <Sparkles size={28} />, label: "Arte", color: "bg-pink-50 text-pink-500" },
    { icon: <Heart size={28} />, label: "Cuidado", color: "bg-purple-50 text-purple-500" },
    { icon: <Star size={28} />, label: "Brilho", color: "bg-rose-50 text-rose-500" },
  ];

  const instagramUrl = "https://www.instagram.com/lais.s.nails?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";

  return (
    <div className="min-h-screen bg-white overflow-hidden font-['Inter']">
      {/* Hero Section */}
      <div className="relative h-screen flex flex-col items-center justify-center text-center px-6">
        {/* Background Image com Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={laisBg} 
            alt="Lais Nails" 
            className="w-full h-full object-cover opacity-30 scale-110 blur-[3px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/60 to-white" />
        </div>

        {/* Conteúdo */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-md w-full space-y-10"
        >
          <div className="flex flex-col items-center space-y-6">
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 5, repeat: Infinity }}
              className="w-24 h-24 bg-gradient-to-br from-pink-500 to-rose-400 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-pink-200 border-4 border-white"
            >
              <Sparkles className="text-white" size={44} />
            </motion.div>
            
            <img src="/logo.png" alt="Lais Nails" className="h-28 w-auto drop-shadow-2xl" />
            
            <div className="space-y-3">
              <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tighter">
                Sua beleza, <br />
                <span className="text-pink-500 font-['Dancing_Script'] text-6xl block mt-2">nossa arte.</span>
              </h1>
              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed px-8">
                Onde cada detalhe é pensado para <br /> realçar o seu brilho único.
              </p>
            </div>
          </div>

          {/* Mini Galeria de Ícones Criativa */}
          <div className="flex justify-center gap-4 py-2">
            {galleryItems.map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -8, scale: 1.1 }}
                className={`w-20 h-24 ${item.color} rounded-[2rem] flex flex-col items-center justify-center shadow-xl border-2 border-white/50 backdrop-blur-sm transition-all`}
              >
                {item.icon}
                <span className="text-[8px] font-black uppercase tracking-widest mt-2 opacity-60">{item.label}</span>
              </motion.div>
            ))}
          </div>

          <div className="space-y-6">
            <Button 
              onClick={() => navigate('/login')}
              className="w-full bg-slate-900 hover:bg-pink-600 text-white font-black text-[10px] py-9 rounded-[2.5rem] shadow-2xl shadow-slate-300 tracking-[0.4em] uppercase group transition-all border-b-4 border-slate-800 active:border-b-0 active:translate-y-1"
            >
              INICIAR TRANSFORMAÇÃO
              <ArrowRight size={18} className="ml-3 group-hover:translate-x-2 transition-transform" />
            </Button>
            
            <div className="flex items-center justify-center gap-8 text-slate-400">
              <div className="flex items-center gap-2">
                <Heart size={14} className="text-pink-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Exclusividade</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={14} className="text-yellow-400" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Excelência</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer da Landing */}
        <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2">
          <div className="flex flex-col items-center gap-1 mb-2">
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em]">Agende sua experiência de luxo</p>
            <a 
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-400 hover:text-pink-500 transition-colors cursor-pointer bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 shadow-sm"
            >
              <Instagram size={12} />
              <span className="text-[9px] font-bold tracking-wider">@lais.s.nails</span>
            </a>
          </div>
          
          <div className="flex flex-col items-center gap-0.5 opacity-40">
            <p className="text-[6px] font-black text-slate-900 uppercase tracking-[0.2em]">Desenvolvido por</p>
            <p className="text-[7px] font-black text-slate-900 uppercase tracking-[0.1em]">Matheus Souza</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;