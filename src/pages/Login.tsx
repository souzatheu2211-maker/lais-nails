"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useSession } from '@/components/SessionContextProvider';
import { Sparkles, Instagram } from 'lucide-react';

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

      <div className="w-full max-w-sm bg-white/90 backdrop-blur-2xl rounded-[3.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] p-10 border border-white/50 relative z-10 animate-in fade-in zoom-in duration-700 slide-in-from-bottom-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-3xl shadow-lg mb-6 animate-bounce duration-[3s]">
            <Sparkles className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            LAIS NAILS
          </h1>
          <p className="text-gray-400 text-sm font-medium mt-1">Sua beleza, nossa arte</p>
        </div>
        
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
                button: 'font-bold text-base py-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md',
                input: 'bg-gray-50/50 border-gray-100 focus:bg-white transition-all py-6',
                label: 'text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-2',
              }
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'E-mail',
                  password_label: 'Senha',
                  button_label: 'Entrar na conta',
                  loading_button_label: 'Entrando...',
                  link_text: 'Já tem uma conta? Entre aqui',
                },
                sign_up: {
                  email_label: 'E-mail',
                  password_label: 'Senha',
                  button_label: 'Criar minha conta',
                  loading_button_label: 'Criando...',
                  link_text: 'Não tem conta? Cadastre-se',
                },
                forgotten_password: {
                  email_label: 'E-mail',
                  button_label: 'Recuperar senha',
                  link_text: 'Esqueceu sua senha?',
                }
              }
            }}
            theme="light"
          />
        </div>
      </div>
      
      <div className="mt-8 flex flex-col items-center gap-2 relative z-10 text-white/70">
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