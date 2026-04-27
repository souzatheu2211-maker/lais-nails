"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSession } from '@/components/SessionContextProvider';
import { Instagram, Sparkles } from 'lucide-react';

const Login = () => {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-600 via-pink-500 to-rose-400 p-4 overflow-hidden relative">
      {/* Elementos decorativos animados de fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-900/20 rounded-full blur-3xl animate-bounce duration-[10s]" />

      {/* Container Principal - Alinhado ao topo com padding mínimo */}
      <div className="w-full flex flex-col items-center justify-start relative z-10 pt-2 pb-8">
        
        {/* Logo e Ícone - Reduzi as margens para subir tudo */}
        <div className="flex flex-col items-center mb-4 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl mb-2 animate-bounce duration-[3s] border border-white/30">
            <Sparkles className="text-white" size={24} />
          </div>
          <img 
            src="/logo.png" 
            alt="Lais Nails Logo" 
            className="w-44 h-auto object-contain drop-shadow-2xl"
          />
          <p className="text-white/90 text-[8px] font-black uppercase tracking-[0.4em] mt-1">Sua beleza, nossa arte</p>
        </div>

        {/* Caixa de Login Otimizada para Mobile */}
        <div className="w-full max-w-[310px] bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] p-8 border border-white/50 animate-in fade-in zoom-in duration-700">
          <div className="auth-container">
            <Auth
              supabaseClient={supabase}
              providers={[]}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#db2777',
                      brandAccent: '#be185d',
                      inputBackground: '#f9fafb',
                      inputText: '#000000',
                      inputPlaceholder: '#9ca3af',
                      inputBorder: '#e5e7eb',
                      inputBorderFocus: '#ec4899',
                      inputBorderHover: '#f472b6',
                    },
                    radii: {
                      buttonRadius: '18px',
                      inputRadius: '14px',
                    },
                    fonts: {
                      bodyFontFamily: `'Inter', sans-serif`,
                      buttonFontFamily: `'Inter', sans-serif`,
                    }
                  }
                },
                className: {
                  button: 'font-black text-xs py-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg mt-2 tracking-wider',
                  input: 'border-gray-100 focus:bg-white transition-all py-5 text-sm font-medium',
                  label: 'text-[10px] font-black text-gray-800 uppercase tracking-widest ml-1 mb-1.5',
                }
              }}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'SEU EMAIL',
                    password_label: 'SUA SENHA',
                    email_input_placeholder: 'exemplo@email.com',
                    password_input_placeholder: '••••••••',
                    button_label: 'ENTRAR AGORA',
                    loading_button_label: 'PROCESSANDO...',
                    link_text: 'Não tem conta? Cadastre-se',
                  },
                  sign_up: {
                    email_label: 'SEU EMAIL',
                    password_label: 'SUA SENHA',
                    button_label: 'CRIAR CONTA',
                    loading_button_label: 'CRIANDO...',
                    link_text: 'Já tem conta? Entre aqui',
                  },
                  forgotten_password: {
                    email_label: 'SEU EMAIL',
                    button_label: 'RECUPERAR ACESSO',
                    link_text: 'Esqueceu a senha?',
                  }
                }
              }}
              theme="light"
            />
          </div>
        </div>

        {/* Footer Credits */}
        <div className="mt-8 flex flex-col items-center gap-1.5 text-white/80">
          <p className="text-[9px] font-black tracking-[0.2em] uppercase">
            DESENVOLVIDO POR MATHEUS SOUZA
          </p>
          <div className="flex items-center gap-3">
            <p className="text-[9px] font-medium opacity-60">
              © 2026 MATHEUS SOUZA
            </p>
            <a 
              href="https://instagram.com/theu_souz2" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors group"
            >
              <Instagram size={12} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold">@theu_souz2</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;