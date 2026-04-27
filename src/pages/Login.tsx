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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-600 via-pink-500 to-rose-400 p-6 overflow-hidden relative">
      {/* Elementos decorativos animados de fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-900/20 rounded-full blur-3xl animate-bounce duration-[10s]" />

      {/* Logo e Ícone fora da caixa */}
      <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-top-4 duration-1000 relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl mb-6 animate-bounce duration-[3s] border border-white/30">
          <Sparkles className="text-white" size={32} />
        </div>
        <img 
          src="/logo.png" 
          alt="Lais Nails Logo" 
          className="w-64 h-auto object-contain drop-shadow-2xl"
        />
        <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Sua beleza, nossa arte</p>
      </div>

      <div className="w-full max-w-[360px] bg-white/95 backdrop-blur-2xl rounded-[3.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.3)] p-10 border border-white/50 relative z-10 animate-in fade-in zoom-in duration-700">
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
                    buttonRadius: '20px',
                    inputRadius: '16px',
                  },
                  fonts: {
                    bodyFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
                    buttonFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
                  }
                }
              },
              className: {
                button: 'font-bold text-sm py-3.5 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg mt-4',
                input: 'border-gray-200 focus:bg-white transition-all py-6 text-sm font-medium',
                label: 'text-[11px] font-black text-black uppercase tracking-wider ml-1 mb-2',
              }
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'SEU EMAIL',
                  password_label: 'SUA SENHA',
                  email_input_placeholder: 'SEU EMAIL',
                  password_input_placeholder: 'SUA SENHA',
                  button_label: 'ENTRAR NA CONTA',
                  loading_button_label: 'ENTRANDO...',
                  link_text: 'Já tem uma conta? Entre aqui',
                },
                sign_up: {
                  email_label: 'SEU EMAIL',
                  password_label: 'SUA SENHA',
                  email_input_placeholder: 'SEU EMAIL',
                  password_input_placeholder: 'SUA SENHA',
                  button_label: 'CRIAR MINHA CONTA',
                  loading_button_label: 'CRIANDO...',
                  link_text: 'Não tem conta? Cadastre-se',
                },
                forgotten_password: {
                  email_label: 'SEU EMAIL',
                  button_label: 'RECUPERAR SENHA',
                  link_text: 'Esqueceu sua senha?',
                }
              }
            }}
            theme="light"
          />
        </div>
      </div>
      
      <div className="mt-10 flex flex-col items-center gap-2 relative z-10 text-white/80">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase">
          Desenvolvido por Matheus Souza
        </p>
        <div className="flex items-center gap-4">
          <p className="text-[10px] font-medium opacity-60">
            © 2026 Todos os direitos reservados
          </p>
          <a 
            href="https://instagram.com/theu_souz2" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors group"
          >
            <Instagram size={14} className="group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold">@theu_souz2</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;