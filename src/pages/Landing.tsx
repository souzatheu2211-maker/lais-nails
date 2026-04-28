"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Heart, Star, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import laisBg from "@/assets/lais-bg.jpeg";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white overflow-hidden font-['Inter']">
      {/* Hero Section */}
      <div className="relative h-screen flex flex-col items-center justify-center text-center px-6">
        {/* Background Image com Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={laisBg} 
            alt="Lais Nails" 
            className="w-full h-full object-cover opacity-40 scale-110 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/40 to-white" />
        </div>

        {/* Conteúdo */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-md w-full space-y-8"
        >
          <div className="flex flex-col items-center space-y-4">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 bg-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-pink-200"
            >
              <Sparkles className="text-white" size={40} />
            </motion.div>
            
            <img src="/logo.png" alt="Lais Nails" className="h-24 w-auto drop-shadow-xl" />
            
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-slate-900 leading-tight tracking-tighter">
                Sua beleza, <br />
                <span className="text-pink-500 font-['Dancing_Script'] text-5xl">nossa arte.</span>
              </h1>
              <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
                Realce sua essência com o cuidado e a sofisticação que só a Lais Nails proporciona.
              </p>
            </div>
          </div>

          {/* Mini Galeria Criativa */}
          <div className="flex justify-center gap-3 py-4">
            {[1, 2, 3].map((i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10, rotate: i % 2 === 0 ? 5 : -5 }}
                className="w-20 h-28 bg-slate-100 rounded-2xl overflow-hidden shadow-lg border-2 border-white"
              >
                <img 
                  src={laisBg} 
                  className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all" 
                  alt="Trabalho Lais"
                />
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            <Button 
              onClick={() => navigate('/login')}
              className="w-full bg-slate-900 hover:bg-pink-600 text-white font-black text-xs py-8 rounded-[2rem] shadow-2xl shadow-slate-200 tracking-[0.2em] uppercase group transition-all"
            >
              COMEÇAR MINHA TRANSFORMAÇÃO
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-2 transition-transform" />
            </Button>
            
            <div className="flex items-center justify-center gap-6 text-slate-400">
              <div className="flex items-center gap-1">
                <Heart size={14} className="text-pink-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Cuidado</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Qualidade</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer da Landing */}
        <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Agende seu momento de luxo</p>
          <div className="flex items-center gap-2 text-slate-300">
            <Instagram size={12} />
            <span className="text-[9px] font-bold">@laisnails_</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;