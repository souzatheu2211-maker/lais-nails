"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Heart, Star, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import laisBg from "@/assets/lais-bg.jpeg";

const Landing = () => {
  const navigate = useNavigate();

  const galleryItems = [
    { icon: <Sparkles size={24} />, label: "Arte", color: "bg-pink-50 text-pink-500" },
    { icon: <Heart size={24} />, label: "Cuidado", color: "bg-purple-50 text-purple-500" },
    { icon: <Star size={24} />, label: "Brilho", color: "bg-rose-50 text-rose-500" },
  ];

  const instagramUrl = "https://www.instagram.com/lais.s.nails?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";

  return (
    <div className="min-h-screen bg-white overflow-hidden font-['Inter'] flex flex-col">
      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center text-center px-6">
        {/* Background Image com Visibilidade Aumentada */}
        <div className="absolute inset-0 z-0">
          <img 
            src={laisBg} 
            alt="Lais Nails" 
            className="w-full h-full object-cover opacity-70 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-white/40 to-white" />
        </div>

        {/* Conteúdo */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-md w-full space-y-8"
        >
          <div className="flex flex-col items-center space-y-4">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-16 h-16 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl border border-white"
            >
              <Sparkles className="text-pink-500" size={32} />
            </motion.div>
            
            <img src="/logo.png" alt="Lais Nails" className="h-24 w-auto drop-shadow-lg" />
            
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tighter">
                Sua beleza, <br />
                <span className="text-pink-500 font-['Dancing_Script'] text-5xl block mt-1">nossa arte.</span>
              </h1>
              <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed px-10">
                Onde cada detalhe realça o seu brilho único.
              </p>
            </div>
          </div>

          {/* Mini Galeria de Ícones */}
          <div className="flex justify-center gap-3 py-2">
            {galleryItems.map((item, i) => (
              <div 
                key={i}
                className={`w-16 h-20 ${item.color} rounded-2xl flex flex-col items-center justify-center shadow-md border border-white/50 backdrop-blur-sm`}
              >
                {item.icon}
                <span className="text-[7px] font-black uppercase tracking-widest mt-1.5 opacity-60">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <Button 
              onClick={() => navigate('/login')}
              className="w-full max-w-[240px] mx-auto bg-slate-900 hover:bg-pink-600 text-white font-black text-[9px] py-6 rounded-2xl shadow-xl tracking-[0.3em] uppercase group transition-all active:scale-95"
            >
              INICIAR AGENDAMENTO
              <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <div className="flex items-center justify-center gap-6 text-slate-400">
              <div className="flex items-center gap-1.5">
                <Heart size={12} className="text-pink-400" />
                <span className="text-[8px] font-black uppercase tracking-widest">Exclusivo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star size={12} className="text-yellow-400" />
                <span className="text-[8px] font-black uppercase tracking-widest">Premium</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer com Créditos e Instagram */}
      <footer className="relative z-10 pb-8 pt-4 flex flex-col items-center gap-4 bg-white">
        <div className="h-[1px] w-8 bg-slate-100" />
        
        <a 
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-400 hover:text-pink-500 transition-all group"
        >
          <div className="p-2 bg-slate-50 rounded-full group-hover:bg-pink-50 transition-colors">
            <Instagram size={16} />
          </div>
          <span className="text-[10px] font-bold tracking-wider">@lais.s.nails</span>
        </a>

        <div className="flex flex-col items-center gap-1">
          <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.3em]">
            DESENVOLVIDO POR MATHEUS SOUZA
          </p>
          <p className="text-[6px] font-bold text-slate-200">
            © 2026 TODOS OS DIREITOS RESERVADOS
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;