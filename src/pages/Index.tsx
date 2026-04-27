"use client";

import * as React from "react";
import { useSession } from "@/components/SessionContextProvider";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Sparkles, User, LogOut, Instagram, History, Settings, Plus, Edit2, Trash2, ChevronRight, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { showError, showSuccess } from "@/utils/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { session, user } = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState("home");
  const [profile, setProfile] = React.useState<any>(null);
  const [services, setServices] = React.useState<any[]>([]);
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const isAdmin = user?.email === 'lais@nails.com';

  const fetchProfile = React.useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data);
  }, [user?.id]);

  const fetchServices = React.useCallback(async () => {
    const { data } = await supabase.from('services').select('*').eq('active', true);
    setServices(data || []);
    setLoading(false);
  }, []);

  const fetchAppointments = React.useCallback(async () => {
    if (!user?.id) return;
    let query = supabase.from('appointments').select(`
      *,
      profiles:user_id (full_name, phone, instagram),
      services:service_id (name, price, duration_minutes),
      available_slots:slot_id (date, start_time)
    `);

    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data } = await query.order('created_at', { ascending: false });
    setAppointments(data || []);
  }, [user?.id, isAdmin]);

  React.useEffect(() => {
    if (session) {
      fetchProfile();
      fetchServices();
      fetchAppointments();
    }
  }, [session, fetchProfile, fetchServices, fetchAppointments]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getFirstName = (name: string) => name?.split(' ')[0] || 'Gata';

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-rose-400 p-6 text-white">
        <div className="text-center space-y-6 max-w-sm">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce duration-[3s]">
            <Sparkles size={48} className="text-white" />
          </div>
          <img 
            src="/logo.png" 
            alt="Lais Nails Logo" 
            className="w-72 h-auto object-contain mx-auto drop-shadow-2xl brightness-0 invert"
          />
          <p className="text-lg font-medium opacity-90 font-['Dancing_Script'] text-2xl">
            Sua beleza, nossa arte.
          </p>
          <div className="pt-8 space-y-4">
            <Button 
              onClick={() => navigate('/login')}
              className="w-full h-14 bg-white text-pink-600 hover:bg-pink-50 rounded-2xl text-lg font-bold shadow-lg transition-transform active:scale-95"
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
      <header className="bg-white px-6 pt-10 pb-8 rounded-b-[3.5rem] shadow-sm border-b border-pink-50 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-pink-50 rounded-full blur-3xl opacity-50" />
        
        <div className="flex flex-col items-center relative z-10">
          <div className="flex justify-between w-full items-start mb-4">
            <div className="w-10" /> {/* Spacer */}
            <img 
              src="/logo.png" 
              alt="Lais Nails Logo" 
              className="h-20 w-auto object-contain drop-shadow-sm"
            />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-300 hover:text-pink-500 transition-colors">
              <LogOut size={20} />
            </Button>
          </div>
          
          <p className="font-['Dancing_Script'] text-3xl text-pink-500 mt-1 animate-in fade-in slide-in-from-bottom-2 duration-700">
            Bem-vinda, {getFirstName(profile?.full_name)}!
          </p>
        </div>
        
        <div className="mt-8 px-2">
          <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-400 rounded-[2rem] p-5 text-white shadow-xl shadow-pink-200/60 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform duration-500">
              <Sparkles size={40} className="animate-pulse" />
            </div>
            <div className="relative z-10">
              <h3 className="text-base font-extrabold mb-0.5 flex items-center gap-2 tracking-tight">
                <Heart size={16} className="fill-white animate-pulse" />
                {isAdmin ? 'Gerencie sua agenda' : 'Pronta para brilhar?'}
              </h3>
              <p className="text-white/90 text-[11px] font-medium opacity-80">
                {isAdmin ? 'Veja seus atendimentos de hoje.' : 'Escolha o serviço ideal para você hoje.'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          
          {/* CLIENT TABS */}
          {!isAdmin && (
            <>
              <TabsContent value="home" className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    Nossos Serviços <Sparkles size={16} className="text-pink-400" />
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {services.map((service) => (
                    <Card key={service.id} className="p-4 border-none shadow-md rounded-3xl flex items-center gap-4 hover:shadow-lg transition-shadow group">
                      <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">💅</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{service.name}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1"><Clock size={12} /> {service.duration_minutes} min</span>
                          <span className="text-pink-500">R$ {service.price}</span>
                        </div>
                      </div>
                      <Button size="sm" className="bg-pink-500 hover:bg-pink-600 rounded-2xl px-5 font-bold text-[11px] shadow-sm">Agendar</Button>
                    </Card>
                  ))}
                  {services.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-gray-100">
                      <Sparkles className="mx-auto text-gray-200 mb-3" size={40} />
                      <p className="text-gray-400 text-sm font-medium">Nenhum serviço disponível no momento.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-6 animate-in fade-in duration-500">
                <h3 className="text-lg font-bold text-gray-800">Meu Histórico</h3>
                <div className="space-y-4">
                  {appointments.map((app) => (
                    <Card key={app.id} className="p-4 border-none shadow-sm rounded-3xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-800">{app.services?.name}</h4>
                          <p className="text-xs text-gray-400 font-medium mt-0.5">{app.available_slots?.date} às {app.available_slots?.start_time}</p>
                        </div>
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${app.status === 'completed' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                          {app.status}
                        </span>
                      </div>
                    </Card>
                  ))}
                  {appointments.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-gray-100">
                      <History className="mx-auto text-gray-200 mb-3" size={40} />
                      <p className="text-gray-400 text-sm font-medium">Você ainda não tem agendamentos.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6 animate-in fade-in duration-500">
                <h3 className="text-lg font-bold text-gray-800">Meu Perfil</h3>
                <Card className="p-7 border-none shadow-md rounded-[2.5rem] space-y-5">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nome Completo</p>
                    <p className="font-bold text-gray-800 text-sm">{profile?.full_name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">CPF</p>
                      <p className="font-bold text-gray-800 text-sm">{profile?.cpf || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Telefone</p>
                      <p className="font-bold text-gray-800 text-sm">{profile?.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nascimento</p>
                      <p className="font-bold text-gray-800 text-sm">{profile?.birth_date || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-1">Instagram</p>
                      <p className="font-bold text-pink-500 text-sm">{profile?.instagram || '-'}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full rounded-2xl border-pink-100 text-pink-500 font-bold text-xs py-6 hover:bg-pink-50 mt-2">Editar Dados</Button>
                </Card>
              </TabsContent>
            </>
          )}

          {/* ADMIN TABS */}
          {isAdmin && (
            <>
              <TabsContent value="home" className="space-y-6 animate-in fade-in duration-500">
                <h3 className="text-lg font-bold text-gray-800">Próximos Atendimentos</h3>
                <div className="space-y-4">
                  {appointments.map((app) => (
                    <Card key={app.id} className="p-4 border-none shadow-md rounded-3xl hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 font-black text-sm">
                            {app.profiles?.full_name?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 text-sm">{app.profiles?.full_name}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{app.services?.name} • {app.available_slots?.start_time}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-pink-500"><ChevronRight size={20} /></Button>
                      </div>
                    </Card>
                  ))}
                  {appointments.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-gray-100">
                      <Calendar className="mx-auto text-gray-200 mb-3" size={40} />
                      <p className="text-gray-400 text-sm font-medium">Nenhum agendamento para hoje.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">Meus Serviços</h3>
                  <Button size="sm" className="bg-pink-500 hover:bg-pink-600 rounded-2xl gap-2 font-bold text-xs"><Plus size={16} /> Novo</Button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {services.map((service) => (
                    <Card key={service.id} className="p-4 border-none shadow-sm rounded-3xl flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-gray-800">{service.name}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">R$ {service.price} • {service.duration_minutes} min</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-500"><Edit2 size={16} /></Button>
                        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-500"><Trash2 size={16} /></Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="calendar" className="space-y-6 animate-in fade-in duration-500">
                <h3 className="text-lg font-bold text-gray-800">Agenda do Mês</h3>
                <Card className="p-12 border-none shadow-sm rounded-[2.5rem] text-center text-gray-300">
                  <Calendar className="mx-auto mb-4 opacity-20" size={56} />
                  <p className="text-sm font-medium">Gerenciamento de horários em breve.</p>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Footer Credits */}
        <footer className="pt-16 pb-6 flex flex-col items-center gap-2 text-gray-300">
          <p className="text-[9px] font-black tracking-[0.3em] uppercase">Desenvolvido por Matheus Souza</p>
          <div className="flex items-center gap-5">
            <p className="text-[9px] font-bold opacity-60">© 2026 MATHEUS SOUZA</p>
            <a href="https://instagram.com/theu_souz2" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-pink-400 transition-colors group">
              <Instagram size={14} className="group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black">@theu_souz2</span>
            </a>
          </div>
        </footer>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-8 left-8 right-8 bg-white/90 backdrop-blur-xl border border-white/40 h-16 rounded-[2rem] shadow-2xl flex items-center justify-around px-4 z-50">
        <button onClick={() => setActiveTab('home')} className={`p-3 rounded-2xl transition-all ${activeTab === 'home' ? 'text-pink-500 bg-pink-50 scale-110' : 'text-gray-300 hover:text-pink-300'}`}>
          <Sparkles size={22} />
        </button>
        
        {isAdmin ? (
          <>
            <button onClick={() => setActiveTab('services')} className={`p-3 rounded-2xl transition-all ${activeTab === 'services' ? 'text-pink-500 bg-pink-50 scale-110' : 'text-gray-300 hover:text-pink-300'}`}>
              <Settings size={22} />
            </button>
            <button onClick={() => setActiveTab('calendar')} className={`p-3 rounded-2xl transition-all ${activeTab === 'calendar' ? 'text-pink-500 bg-pink-50 scale-110' : 'text-gray-300 hover:text-pink-300'}`}>
              <Calendar size={22} />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setActiveTab('history')} className={`p-3 rounded-2xl transition-all ${activeTab === 'history' ? 'text-pink-500 bg-pink-50 scale-110' : 'text-gray-300 hover:text-pink-300'}`}>
              <History size={22} />
            </button>
            <button onClick={() => setActiveTab('profile')} className={`p-3 rounded-2xl transition-all ${activeTab === 'profile' ? 'text-pink-500 bg-pink-50 scale-110' : 'text-gray-300 hover:text-pink-300'}`}>
              <User size={22} />
            </button>
          </>
        )}
      </nav>
    </div>
  );
};

export default Index;