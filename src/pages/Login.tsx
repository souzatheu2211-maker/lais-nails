"use client";

import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSession } from '@/components/SessionContextProvider';
import { Instagram, Sparkles, ArrowLeft } from 'lucide-react';
import { AuthForm } from '@/components/AuthForm';
import { Button } from '@/components/ui/button';

const Login = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/app');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-600 via-pink-500 to-rose-400 p-4 overflow-hidden relative">
      {/* Botão Voltar */}
      <Button 
        onClick={() => navigate('/')}
        variant="ghost" 
        size="icon" 
        className="absolute top-6 left-6 text-white/80 hover:text-white hover:bg-white/20 rounded-full z-20"
      >
        <ArrowLeft size={20} />
      </Button>

      {/* Elementos decorativos de fundo */}
      <div className="absolute top-[-5%] left-[-5%] w-48 h-48 bg-white/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-5%] right-[-5%] w-64 h-64 bg-purple-900/10 rounded-full blur-3xl" />

      {/* Container Principal */}
      <div className="w-full flex flex-col items-center justify-start relative z-10 pt-4 pb-6">
        
        {/* Logo e Título */}
        <div className="flex flex-col items-center mb-3 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl shadow-xl mb-1.5 animate-bounce duration-[3s] border border-white/30">
            <Sparkles className="text-white" size={20} />
          </div>
          <img 
            src="/logo.png" 
            alt="Lais Nails Logo" 
            className="w-40 h-auto object-contain drop-shadow-md brightness-0 invert"
          />
          <p className="text-white/70 text-[8px] font-light tracking-[0.3em] uppercase mt-0.5">Sua beleza, nossa arte</p>
        </div>

        {/* Caixa de Login */}
        <div className="w-full max-w-[280px] bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl p-6 border border-white/40 animate-in fade-in zoom-in duration-700">
          <AuthForm />
        </div>

        {/* Footer Credits */}
        <div className="mt-6 flex flex-col items-center gap-1 text-black">
          <p className="text-[7px] font-black tracking-[0.2em] uppercase">
            DESENVOLVIDO POR MATHEUS SOUZA
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[7px] font-bold">
              © 2026 MATHEUS SOUZA
            </p>
            <a 
              href="https://instagram.com/theu_souz2" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-pink-700 transition-colors"
            >
              <Instagram size={8} />
              <span className="text-[8px] font-black">@theu_souz2</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;