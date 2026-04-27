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
      {/* Elementos decorativos de fundo mais suaves */}
      <div className="absolute top-[-5%] left-[-5%] w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-5%] right-[-5%] w-80 h-80 bg-purple-900/10 rounded-full blur-3xl" />

      {/* Container Principal */}
      <div className="w-full flex flex-col items-center justify-start relative z-10 pt-6 pb-8">
        
        {/* Logo e Título Cursivo */}
        <div className="flex flex-col items-center mb-4 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-md rounded-full mb-2 border border-white/20">
            <Sparkles className="text-white/80" size={20} />
          </div>
          <h1 className="text-white text-4xl font-['Dancing_Script'] drop-shadow-md">Lais Nails</h1>
          <p className="text-white/70 text-[10px] font-light tracking-[0.3em] uppercase mt-1">Sua beleza, nossa arte</p>
        </div>

        {/* Caixa de Login - Menor e mais Clean */}
        <div className="w-full max-w-[280px] bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-6 border border-white/40 animate-in fade-in zoom-in duration-700">
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
                      inputBackground: 'transparent',
                      inputText: '#1f2937',
                      inputPlaceholder: '#9ca3af',
                      inputBorder: '#f3f4f6',
                      inputBorderFocus: '#ec4899',
                      inputBorderHover: '#f472b6',
                    },
                    radii: {
                      buttonRadius: '12px',
                      inputRadius: '10px',
                    },
                    fonts: {
                      bodyFontFamily: `'Inter', sans-serif`,
                      buttonFontFamily: `'Inter', sans-serif`,
                    }
                  }
                },
                className: {
                  button: 'font-bold text-[11px] py-2.5 transition-all hover:opacity-90 active:scale-95 shadow-md mt-1',
                  input: 'border-b border-t-0 border-x-0 rounded-none bg-transparent focus:ring-0 px-1 py-2 text-sm',
                  label: 'text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-0 mb-0',
                  container: 'gap-3',
                }
              }}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email',
                    password_label: 'Senha',
                    email_input_placeholder: 'Seu email...',
                    password_input_placeholder: 'Sua senha...',
                    button_label: 'Entrar',
                    link_text: 'Criar conta',
                  },
                  sign_up: {
                    email_label: 'Email',
                    password_label: 'Senha',
                    button_label: 'Cadastrar',
                    link_text: 'Já tenho conta',
                  }
                }
              }}
              theme="light"
            />
          </div>
        </div>

        {/* Footer Credits */}
        <div className="mt-8 flex flex-col items-center gap-1 text-white/60">
          <p className="text-[8px] font-medium tracking-[0.2em] uppercase">
            DESENVOLVIDO POR MATHEUS SOUZA
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[8px] font-light">
              © 2026 MATHEUS SOUZA
            </p>
            <a 
              href="https://instagram.com/theu_souz2" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Instagram size={10} />
              <span className="text-[9px] font-semibold">@theu_souz2</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;