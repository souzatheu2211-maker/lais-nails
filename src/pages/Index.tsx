"use client";

import { useSession } from "@/components/SessionContextProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Sparkles, User, LogOut, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { session, user } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-rose-400 p-6 text-white">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles size={48} className="text-white" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter">LAIS NAILS</h1>
          <p className="text-lg font-medium opacity-90">
            Agende seu horário e transforme seu visual com elegância e sofisticação.
          </p>
          <div className="pt-8 space-y-4">
            <Button 
              onClick={() => navigate('/login')}
              className="w-full h-14 bg-white text-pink-600 hover:bg-pink-50 rounded-2xl text-lg font-bold shadow-lg"
            >
              Começar Agora
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <header className="bg-white px-6 pt-12 pb-6 rounded-b-[3rem] shadow-sm border-b border-pink-50">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-gray-500 font-medium">Olá, bem-vinda!</p>
            <h2 className="text-2xl font-bold text-gray-900">Lais Nails</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-400">
            <LogOut size={20} />
          </Button>
        </div>
        
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl shadow-pink-200/50">
          <h3 className="text-xl font-bold mb-1">Pronta para brilhar?</h3>
          <p className="text-white/80 text-sm mb-4">Escolha o serviço ideal para você hoje.</p>
          <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-md border-none text-white rounded-xl">
            Ver Meus Agendamentos
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 mt-8 space-y-8">
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Nossos Serviços</h3>
            <button className="text-pink-500 text-sm font-semibold">Ver todos</button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {[
              { name: 'Pé e Mão', price: 'R$ 60,00', time: '60 min', icon: '💅' },
              { name: 'Alongamento em Gel', price: 'R$ 120,00', time: '120 min', icon: '✨' },
              { name: 'Banho de Gel', price: 'R$ 80,00', time: '90 min', icon: '💎' },
            ].map((service, i) => (
              <Card key={i} className="p-4 border-none shadow-md hover:shadow-lg transition-shadow rounded-2xl flex items-center gap-4">
                <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-2xl">
                  {service.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{service.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Clock size={12} /> {service.time}</span>
                    <span className="font-bold text-pink-600">{service.price}</span>
                  </div>
                </div>
                <Button size="sm" className="bg-pink-500 hover:bg-pink-600 rounded-xl px-4">
                  Agendar
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer Credits */}
        <footer className="pt-8 pb-4 flex flex-col items-center gap-2 text-gray-400">
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
              className="flex items-center gap-1.5 hover:text-pink-500 transition-colors group"
            >
              <Instagram size={14} className="group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold">@theu_souz2</span>
            </a>
          </div>
        </footer>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 bg-white/80 backdrop-blur-lg border border-white/20 h-16 rounded-2xl shadow-2xl flex items-center justify-around px-4">
        <button className="p-2 text-pink-500"><Sparkles size={24} /></button>
        <button className="p-2 text-gray-400"><Calendar size={24} /></button>
        <button className="p-2 text-gray-400"><User size={24} /></button>
      </nav>
    </div>
  );
};

export default Index;