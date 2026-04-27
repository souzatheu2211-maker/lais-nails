"use client";

import * as React from "react";
import { useSession } from "@/components/SessionContextProvider";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Sparkles, User, LogOut, Instagram, History, Settings, Plus, Edit2, Trash2, ChevronRight, Heart, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { showError, showSuccess } from "@/utils/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import InputMask from 'react-input-mask';

const Index = () => {
  const { session, user } = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState("home");
  const [profile, setProfile] = React.useState<any>(null);
  const [services, setServices] = React.useState<any[]>([]);
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editLoading, setEditLoading] = React.useState(false);

  const [editFormData, setEditFormData] = React.useState({
    full_name: '',
    phone: '',
    cpf: '',
    birth_date: '',
    instagram: ''
  });

  const isAdmin = user?.email === 'lais@nails.com';

  const fetchProfile = React.useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setProfile(data);
      setEditFormData({
        full_name: data.full_name || '',
        phone: data.phone || '',
        cpf: data.cpf || '',
        birth_date: data.birth_date || '',
        instagram: data.instagram || ''
      });
    }
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setEditLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editFormData.full_name,
          phone: editFormData.phone,
          cpf: editFormData.cpf,
          birth_date: editFormData.birth_date,
          instagram: editFormData.instagram,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      showSuccess("Perfil atualizado com sucesso!");
      fetchProfile();
      setIsEditModalOpen(false);
    } catch (error: any) {
      showError(error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const getFirstName = (name: string) => name?.split(' ')[0] || 'Gata';

  const tabVariants = {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-rose-400 p-6 text-white">
        <div className="text-center space-y-4 max-w-xs">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce duration-[3s]">
            <Sparkles size={40} className="text-white" />
          </div>
          <img 
            src="/logo.png" 
            alt="Lais Nails Logo" 
            className="w-56 h-auto object-contain mx-auto drop-shadow-2xl brightness-0 invert"
          />
          <p className="text-base font-medium opacity-90 font-['Dancing_Script'] text-xl">
            Sua beleza, nossa arte.
          </p>
          <div className="pt-4">
            <Button 
              onClick={() => navigate('/login')}
              className="w-full h-12 bg-white text-pink-600 hover:bg-pink-50 rounded-2xl text-base font-bold shadow-lg transition-transform active:scale-95"
            >
              Começar Agora
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white px-5 pt-6 pb-4 rounded-b-[2.5rem] shadow-sm border-b border-pink-50 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-24 h-24 bg-pink-50 rounded-full blur-3xl opacity-50" />
        
        <div className="flex flex-col items-center relative z-10">
          <div className="flex justify-between w-full items-center mb-2">
            <div className="w-8" />
            <img 
              src="/logo.png" 
              alt="Lais Nails Logo" 
              className="h-14 w-auto object-contain drop-shadow-sm"
            />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-300 hover:text-pink-500 transition-colors h-8 w-8">
              <LogOut size={18} />
            </Button>
          </div>
          
          <p className="font-['Dancing_Script'] text-2xl text-pink-500 mt-0.5 animate-in fade-in slide-in-from-bottom-1 duration-700">
            Bem-vinda, {getFirstName(profile?.full_name)}!
          </p>
        </div>
        
        <div className="mt-4 px-1">
          <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-400 rounded-[1.5rem] p-4 text-white shadow-lg shadow-pink-200/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:scale-110 transition-transform duration-500">
              <Sparkles size={32} className="animate-pulse" />
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-extrabold mb-0.5 flex items-center gap-1.5 tracking-tight">
                <Heart size={14} className="fill-white animate-pulse" />
                {isAdmin ? 'Gerencie sua agenda' : 'Pronta para brilhar?'}
              </h3>
              <p className="text-white/90 text-[10px] font-medium opacity-80">
                {isAdmin ? 'Veja seus atendimentos de hoje.' : 'Escolha o serviço ideal para você hoje.'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 mt-4 flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <AnimatePresence mode="wait">
            {/* CLIENT TABS */}
            {!isAdmin && (
              <>
                {activeTab === "home" && (
                  <motion.div
                    key="home"
                    variants={tabVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
                          Nossos Serviços <Sparkles size={14} className="text-pink-400 animate-spin duration-[5s]" />
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {services.map((service) => (
                          <Card key={service.id} className="p-3 border-none shadow-sm rounded-2xl flex items-center gap-3 hover:shadow-md transition-shadow group">
                            <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">💅</div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800 text-sm">{service.name}</h4>
                              <div className="flex items-center gap-2 text-[9px] text-gray-400 mt-0.5 font-bold uppercase tracking-wider">
                                <span className="flex items-center gap-1"><Clock size={10} className="animate-pulse" /> {service.duration_minutes} min</span>
                                <span className="text-pink-500">R$ {service.price}</span>
                              </div>
                            </div>
                            <Button size="sm" className="bg-pink-500 hover:bg-pink-600 rounded-xl px-4 h-8 font-bold text-[10px] shadow-sm active:scale-90 transition-transform">Agendar</Button>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "history" && (
                  <motion.div
                    key="history"
                    variants={tabVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-gray-800">Meu Histórico</h3>
                      <div className="space-y-3">
                        {appointments.map((app) => (
                          <Card key={app.id} className="p-3 border-none shadow-sm rounded-2xl">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-gray-800 text-sm">{app.services?.name}</h4>
                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{app.available_slots?.date} às {app.available_slots?.start_time}</p>
                              </div>
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${app.status === 'completed' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                                {app.status}
                              </span>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    variants={tabVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-gray-800">Meu Perfil</h3>
                      <Card className="p-5 border-none shadow-sm rounded-[2rem] space-y-4">
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Nome Completo</p>
                          <p className="font-bold text-gray-800 text-xs">{profile?.full_name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">CPF</p>
                            <p className="font-bold text-gray-800 text-xs">{profile?.cpf || '-'}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Telefone</p>
                            <p className="font-bold text-gray-800 text-xs">{profile?.phone || '-'}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Nascimento</p>
                            <p className="font-bold text-gray-800 text-xs">{profile?.birth_date || '-'}</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Instagram</p>
                            <p className="font-bold text-pink-500 text-xs">{profile?.instagram || '-'}</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setIsEditModalOpen(true)}
                          variant="outline" 
                          className="w-full rounded-xl border-pink-100 text-pink-500 font-bold text-[10px] h-10 hover:bg-pink-50 mt-1"
                        >
                          Editar Dados
                        </Button>
                      </Card>
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {/* ADMIN TABS */}
            {isAdmin && (
              <>
                {activeTab === "home" && (
                  <motion.div
                    key="admin-home"
                    variants={tabVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-gray-800">Próximos Atendimentos</h3>
                      <div className="space-y-3">
                        {appointments.map((app) => (
                          <Card key={app.id} className="p-3 border-none shadow-sm rounded-2xl hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500 font-black text-xs">
                                  {app.profiles?.full_name?.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-800 text-xs">{app.profiles?.full_name}</h4>
                                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{app.services?.name} • {app.available_slots?.start_time}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-pink-500 h-8 w-8"><ChevronRight size={18} /></Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "services" && (
                  <motion.div
                    key="admin-services"
                    variants={tabVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-bold text-gray-800">Meus Serviços</h3>
                        <Button size="sm" className="bg-pink-500 hover:bg-pink-600 rounded-xl gap-1.5 font-bold text-[10px] h-8"><Plus size={14} /> Novo</Button>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {services.map((service) => (
                          <Card key={service.id} className="p-3 border-none shadow-sm rounded-2xl flex justify-between items-center">
                            <div>
                              <h4 className="font-bold text-gray-800 text-sm">{service.name}</h4>
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">R$ {service.price} • {service.duration_minutes} min</p>
                            </div>
                            <div className="flex gap-0.5">
                              <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-500 h-8 w-8"><Edit2 size={14} /></Button>
                              <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-500 h-8 w-8"><Trash2 size={14} /></Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "calendar" && (
                  <motion.div
                    key="admin-calendar"
                    variants={tabVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-gray-800">Agenda do Mês</h3>
                      <Card className="p-10 border-none shadow-sm rounded-[2rem] text-center text-gray-300">
                        <Calendar className="mx-auto mb-3 opacity-20" size={40} />
                        <p className="text-xs font-medium">Em breve.</p>
                      </Card>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </Tabs>
      </main>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[350px] rounded-[2rem] border-none shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Edit2 size={18} className="text-pink-500" /> Editar Perfil
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-2">Nome Completo</Label>
              <Input
                required
                className="bg-slate-50/50 border-slate-100 rounded-2xl px-4 h-11 text-xs focus:bg-white focus:border-pink-200 focus:ring-pink-100 transition-all"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-2">CPF</Label>
                <InputMask
                  mask="999.999.999-99"
                  value={editFormData.cpf}
                  onChange={(e) => setEditFormData({ ...editFormData, cpf: e.target.value })}
                >
                  {(inputProps: any) => <Input required className="bg-slate-50/50 border-slate-100 rounded-2xl px-4 h-11 text-xs" {...inputProps} />}
                </InputMask>
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-2">Telefone</Label>
                <InputMask
                  mask="(99) 99999-9999"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                >
                  {(inputProps: any) => <Input required className="bg-slate-50/50 border-slate-100 rounded-2xl px-4 h-11 text-xs" {...inputProps} />}
                </InputMask>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-2">Nascimento</Label>
                <Input
                  required
                  type="date"
                  className="bg-slate-50/50 border-slate-100 rounded-2xl px-4 h-11 text-xs"
                  value={editFormData.birth_date}
                  onChange={(e) => setEditFormData({ ...editFormData, birth_date: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-2">Instagram (@)</Label>
                <Input
                  className="bg-slate-50/50 border-slate-100 rounded-2xl px-4 h-11 text-xs"
                  value={editFormData.instagram}
                  onChange={(e) => setEditFormData({ ...editFormData, instagram: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button 
                type="submit" 
                disabled={editLoading}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-[11px] py-6 rounded-2xl transition-all active:scale-95 shadow-md"
              >
                {editLoading ? 'Salvando...' : 'SALVAR ALTERAÇÕES'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer Credits */}
      <footer className="pt-12 pb-24 flex flex-col items-center gap-1.5 text-black">
        <p className="text-[8px] font-black tracking-[0.2em] uppercase">Desenvolvido por Matheus Souza</p>
        <div className="flex items-center gap-4">
          <p className="text-[8px] font-bold opacity-80">© 2026 MATHEUS SOUZA</p>
          <a href="https://instagram.com/theu_souz2" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-pink-600 transition-colors group">
            <Instagram size={12} className="group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-black">@theu_souz2</span>
          </a>
        </div>
      </footer>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-xl border border-white/40 h-14 rounded-[1.5rem] shadow-xl flex items-center justify-around px-2 z-50">
        <button onClick={() => setActiveTab('home')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'home' ? 'text-pink-500 bg-pink-50 scale-105' : 'text-gray-300 hover:text-pink-300'}`}>
          <Sparkles size={20} className={activeTab === 'home' ? 'animate-pulse' : ''} />
        </button>
        
        {isAdmin ? (
          <>
            <button onClick={() => setActiveTab('services')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'services' ? 'text-pink-500 bg-pink-50 scale-105' : 'text-gray-300 hover:text-pink-300'}`}>
              <Settings size={20} />
            </button>
            <button onClick={() => setActiveTab('calendar')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'calendar' ? 'text-pink-500 bg-pink-50 scale-105' : 'text-gray-300 hover:text-pink-300'}`}>
              <Calendar size={20} />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setActiveTab('history')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'history' ? 'text-pink-500 bg-pink-50 scale-105' : 'text-gray-300 hover:text-pink-300'}`}>
              <History size={20} />
            </button>
            <button onClick={() => setActiveTab('profile')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'profile' ? 'text-pink-500 bg-pink-50 scale-105' : 'text-gray-300 hover:text-pink-300'}`}>
              <User size={20} />
            </button>
          </>
        )}
      </nav>
    </div>
  );
};

export default Index;