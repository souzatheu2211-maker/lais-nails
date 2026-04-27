"use client";

import * as React from "react";
import { useSession } from "@/components/SessionContextProvider";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Sparkles, User, LogOut, Instagram, History, Settings, Plus, Edit2, Trash2, ChevronRight } from "lucide-react";
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
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles size={48} className="text-white" />
          </div>
          <img 
            src="/logo.png" 
            alt="Lais Nails Logo" 
            className="w-64 h-auto object-contain mx-auto drop-shadow-xl brightness-0 invert"
          />
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
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Bem-vinda, {getFirstName(profile?.full_name)}!</p>
            <div className="mt-1">
              {isAdmin ? (
                <h2 className="text-xl font-bold text-gray-900">Painel Admin</h2>
              ) : (
                <img 
                  src="/logo.png" 
                  alt="Lais Nails Logo" 
                  className="h-8 w-auto object-contain"
                />
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-400 hover:text-pink-500 transition-colors">
            <LogOut size={20} />
          </Button>
        </div>
        
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-xl shadow-pink-200/50">
          <h3 className="text-xl font-bold mb-1">{isAdmin ? 'Gerencie sua agenda' : 'Pronta para brilhar?'}</h3>
          <p className="text-white/80 text-sm mb-4">
            {isAdmin ? 'Veja seus atendimentos de hoje.' : 'Escolha o serviço ideal para você hoje.'}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          
          {/* CLIENT TABS */}
          {!isAdmin && (
            <>
              <TabsContent value="home" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">Nossos Serviços</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {services.map((service) => (
                    <Card key={service.id} className="p-4 border-none shadow-md rounded-2xl flex items-center gap-4">
                      <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-2xl">💅</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{service.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1"><Clock size={12} /> {service.duration_minutes} min</span>
                          <span className="font-bold text-pink-600">R$ {service.price}</span>
                        </div>
                      </div>
                      <Button size="sm" className="bg-pink-500 hover:bg-pink-600 rounded-xl px-4">Agendar</Button>
                    </Card>
                  ))}
                  {services.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                      <Sparkles className="mx-auto text-gray-200 mb-2" size={32} />
                      <p className="text-gray-400 text-sm">Nenhum serviço disponível no momento.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800">Meu Histórico</h3>
                <div className="space-y-4">
                  {appointments.map((app) => (
                    <Card key={app.id} className="p-4 border-none shadow-sm rounded-2xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-800">{app.services?.name}</h4>
                          <p className="text-xs text-gray-500">{app.available_slots?.date} às {app.available_slots?.start_time}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${app.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                          {app.status.toUpperCase()}
                        </span>
                      </div>
                    </Card>
                  ))}
                  {appointments.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                      <History className="mx-auto text-gray-200 mb-2" size={32} />
                      <p className="text-gray-400 text-sm">Você ainda não tem agendamentos.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800">Meu Perfil</h3>
                <Card className="p-6 border-none shadow-md rounded-3xl space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nome</p>
                    <p className="font-medium text-gray-900">{profile?.full_name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CPF</p>
                      <p className="font-medium text-gray-900">{profile?.cpf || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Telefone</p>
                      <p className="font-medium text-gray-900">{profile?.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nascimento</p>
                      <p className="font-medium text-gray-900">{profile?.birth_date || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instagram</p>
                      <p className="font-medium text-pink-600">{profile?.instagram || '-'}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full rounded-2xl border-pink-100 text-pink-600 hover:bg-pink-50 mt-4">Editar Dados</Button>
                </Card>
              </TabsContent>
            </>
          )}

          {/* ADMIN TABS */}
          {isAdmin && (
            <>
              <TabsContent value="home" className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800">Próximos Atendimentos</h3>
                <div className="space-y-4">
                  {appointments.map((app) => (
                    <Card key={app.id} className="p-4 border-none shadow-md rounded-2xl">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 font-bold">
                            {app.profiles?.full_name?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">{app.profiles?.full_name}</h4>
                            <p className="text-xs text-gray-500">{app.services?.name} • {app.available_slots?.start_time}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-gray-400"><ChevronRight size={20} /></Button>
                      </div>
                    </Card>
                  ))}
                  {appointments.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                      <Calendar className="mx-auto text-gray-200 mb-2" size={32} />
                      <p className="text-gray-400 text-sm">Nenhum agendamento para hoje.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800">Meus Serviços</h3>
                  <Button size="sm" className="bg-pink-500 hover:bg-pink-600 rounded-xl gap-2"><Plus size={16} /> Novo</Button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {services.map((service) => (
                    <Card key={service.id} className="p-4 border-none shadow-sm rounded-2xl flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-gray-800">{service.name}</h4>
                        <p className="text-xs text-gray-500">R$ {service.price} • {service.duration_minutes} min</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="text-blue-500"><Edit2 size={16} /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500"><Trash2 size={16} /></Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="calendar" className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800">Agenda do Mês</h3>
                <Card className="p-8 border-none shadow-sm rounded-3xl text-center text-gray-400">
                  <Calendar className="mx-auto mb-4 opacity-20" size={48} />
                  <p>Gerenciamento de horários em breve.</p>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Footer Credits */}
        <footer className="pt-12 pb-4 flex flex-col items-center gap-2 text-gray-400">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase">Desenvolvido por Matheus Souza</p>
          <div className="flex items-center gap-4">
            <p className="text-[10px] font-medium opacity-60">© 2026 MATHEUS SOUZA</p>
            <a href="https://instagram.com/theu_souz2" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-pink-500 transition-colors group">
              <Instagram size={14} className="group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-bold">@theu_souz2</span>
            </a>
          </div>
        </footer>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 bg-white/80 backdrop-blur-lg border border-white/20 h-16 rounded-2xl shadow-2xl flex items-center justify-around px-4">
        <button onClick={() => setActiveTab('home')} className={`p-2 transition-colors ${activeTab === 'home' ? 'text-pink-500' : 'text-gray-400'}`}>
          <Sparkles size={24} />
        </button>
        
        {isAdmin ? (
          <>
            <button onClick={() => setActiveTab('services')} className={`p-2 transition-colors ${activeTab === 'services' ? 'text-pink-500' : 'text-gray-400'}`}>
              <Settings size={24} />
            </button>
            <button onClick={() => setActiveTab('calendar')} className={`p-2 transition-colors ${activeTab === 'calendar' ? 'text-pink-500' : 'text-gray-400'}`}>
              <Calendar size={24} />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setActiveTab('history')} className={`p-2 transition-colors ${activeTab === 'history' ? 'text-pink-500' : 'text-gray-400'}`}>
              <History size={24} />
            </button>
            <button onClick={() => setActiveTab('profile')} className={`p-2 transition-colors ${activeTab === 'profile' ? 'text-pink-500' : 'text-gray-400'}`}>
              <User size={24} />
            </button>
          </>
        )}
      </nav>
    </div>
  );
};

export default Index;