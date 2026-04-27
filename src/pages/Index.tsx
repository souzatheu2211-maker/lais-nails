"use client";

import * as React from "react";
import { useSession } from "@/components/SessionContextProvider";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, Sparkles, User, LogOut, Instagram, History, Settings, Plus, Pencil, Trash2, ChevronRight, Heart, X, Check, DollarSign, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { showError, showSuccess } from "@/utils/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import InputMask from 'react-input-mask';

const Index = () => {
  const { session, user } = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState("home");
  const [profile, setProfile] = React.useState<any>(null);
  const [services, setServices] = React.useState<any[]>([]);
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Estados da Agenda (Admin)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = React.useState<string[]>([]);
  const [savingSlots, setSavingSlots] = React.useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = React.useState(false);
  const [editLoading, setEditLoading] = React.useState(false);

  const [editFormData, setEditFormData] = React.useState({
    full_name: '',
    phone: '',
    cpf: '',
    birth_date: '',
    instagram: ''
  });

  const [serviceFormData, setServiceFormData] = React.useState({
    id: '',
    name: '',
    price: '',
    duration_minutes: '',
    description: ''
  });

  const isAdmin = user?.email === 'lais@nails.com';

  const fetchProfile = React.useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
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
    const { data } = await supabase.from('services').select('*').eq('active', true).order('name');
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
    if (!isAdmin) query = query.eq('user_id', user.id);
    const { data } = await query.order('created_at', { ascending: false });
    setAppointments(data || []);
  }, [user?.id, isAdmin]);

  // Buscar horários disponíveis para a data selecionada
  const fetchSlotsForDate = React.useCallback(async (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('available_slots')
      .select('start_time')
      .eq('date', formattedDate);
    
    if (error) {
      showError("Erro ao carregar horários");
      return;
    }
    
    setAvailableSlots(data.map(s => s.start_time.substring(0, 5)));
  }, []);

  React.useEffect(() => {
    if (session) {
      fetchProfile();
      fetchServices();
      fetchAppointments();
    }
  }, [session, fetchProfile, fetchServices, fetchAppointments]);

  React.useEffect(() => {
    if (isAdmin && selectedDate) {
      fetchSlotsForDate(selectedDate);
    }
  }, [isAdmin, selectedDate, fetchSlotsForDate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setEditLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: editFormData.full_name,
        phone: editFormData.phone,
        cpf: editFormData.cpf,
        birth_date: editFormData.birth_date,
        instagram: editFormData.instagram,
        updated_at: new Date().toISOString()
      }).eq('id', user.id);
      if (error) throw error;
      showSuccess("Perfil atualizado!");
      setIsEditModalOpen(false);
      fetchProfile();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const payload = {
        name: serviceFormData.name,
        price: parseFloat(serviceFormData.price),
        duration_minutes: parseInt(serviceFormData.duration_minutes),
        description: serviceFormData.description
      };
      if (serviceFormData.id) {
        const { error } = await supabase.from('services').update(payload).eq('id', serviceFormData.id);
        if (error) throw error;
        showSuccess("Serviço atualizado!");
      } else {
        const { error } = await supabase.from('services').insert([payload]);
        if (error) throw error;
        showSuccess("Serviço criado!");
      }
      setIsServiceModalOpen(false);
      fetchServices();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    try {
      const { error } = await supabase.from('services').update({ active: false }).eq('id', id);
      if (error) throw error;
      showSuccess("Serviço removido!");
      fetchServices();
    } catch (error: any) {
      showError(error.message);
    }
  };

  const openServiceModal = (service?: any) => {
    if (service) {
      setServiceFormData({
        id: service.id,
        name: service.name,
        price: service.price.toString(),
        duration_minutes: service.duration_minutes.toString(),
        description: service.description || ''
      });
    } else {
      setServiceFormData({ id: '', name: '', price: '', duration_minutes: '', description: '' });
    }
    setIsServiceModalOpen(true);
  };

  // Gerenciamento de Horários
  const timeSlots = Array.from({ length: 25 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  const toggleSlot = (time: string) => {
    setAvailableSlots(prev => 
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  const saveDailySlots = async () => {
    if (!selectedDate) return;
    setSavingSlots(true);
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    try {
      // 1. Remover todos os horários existentes para este dia
      await supabase.from('available_slots').delete().eq('date', formattedDate);

      // 2. Inserir os novos horários selecionados
      if (availableSlots.length > 0) {
        const newSlots = availableSlots.map(time => ({
          date: formattedDate,
          start_time: `${time}:00`,
          is_available: true
        }));
        const { error } = await supabase.from('available_slots').insert(newSlots);
        if (error) throw error;
      }

      showSuccess("Agenda do dia salva!");
    } catch (error: any) {
      showError(error.message);
    } finally {
      setSavingSlots(false);
    }
  };

  const getFirstName = (name: string) => name?.split(' ')[0] || 'Gata';

  const tabVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Definição do Gradiente SVG */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="purple-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Header */}
      <header className="bg-white px-5 pt-6 pb-4 rounded-b-[2.5rem] shadow-sm border-b border-pink-50 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-24 h-24 bg-pink-50 rounded-full blur-3xl opacity-50" />
        <div className="flex flex-col items-center relative z-10">
          <div className="flex justify-between w-full items-center mb-2">
            <div className="w-8" />
            <img src="/logo.png" alt="Lais Nails Logo" className="h-14 w-auto object-contain drop-shadow-sm" />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-300 hover:text-pink-500 h-8 w-8">
              <LogOut size={18} />
            </Button>
          </div>
          <p className="font-['Dancing_Script'] text-2xl text-pink-500 mt-0.5">
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
            {!isAdmin ? (
              <>
                {activeTab === "home" && (
                  <motion.div key="home" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
                    <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                      Nossos Serviços <Sparkles size={12} className="text-pink-300" />
                    </h3>
                    <div className="grid grid-cols-1 gap-2.5">
                      {services.map((service) => (
                        <Card key={service.id} className="p-3 border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl flex items-center gap-3 hover:shadow-md transition-all group bg-white/80 backdrop-blur-sm">
                          <div className="w-10 h-10 bg-pink-50/50 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition-transform">💅</div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-700 text-[11px] leading-tight">{service.name}</h4>
                            <div className="flex items-center gap-2 text-[8px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">
                              <span className="flex items-center gap-1"><Clock size={10} className="text-pink-200" /> {service.duration_minutes} min</span>
                              <span className="text-pink-400/80">R$ {service.price}</span>
                            </div>
                          </div>
                          <Button size="sm" className="bg-pink-500 hover:bg-pink-600 rounded-xl px-4 h-7 font-black text-[9px] tracking-wider shadow-sm active:scale-95 transition-all">AGENDAR</Button>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                )}
                {activeTab === "history" && (
                  <motion.div key="history" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
                    <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Meu Histórico</h3>
                    <div className="space-y-2.5">
                      {appointments.length > 0 ? appointments.map((app) => (
                        <Card key={app.id} className="p-3 border-none shadow-sm rounded-2xl bg-white/80">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-slate-700 text-[11px]">{app.services?.name}</h4>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{app.available_slots?.date} • {app.available_slots?.start_time}</p>
                            </div>
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${app.status === 'completed' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                              {app.status}
                            </span>
                          </div>
                        </Card>
                      )) : <div className="text-center py-10 text-slate-300"><History size={32} className="mx-auto mb-2 opacity-20" /><p className="text-[10px] font-bold uppercase tracking-widest">Vazio</p></div>}
                    </div>
                  </motion.div>
                )}
                {activeTab === "profile" && (
                  <motion.div key="profile" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
                    <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Meu Perfil</h3>
                    <Card className="p-5 border-none shadow-sm rounded-[2rem] space-y-4 bg-white/80">
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest ml-0.5">Nome Completo</p>
                        <p className="font-bold text-slate-700 text-[10px]">{profile?.full_name || 'Não informado'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest ml-0.5">CPF</p>
                          <p className="font-bold text-slate-700 text-[10px]">{profile?.cpf || '-'}</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest ml-0.5">Telefone</p>
                          <p className="font-bold text-slate-700 text-[10px]">{profile?.phone || '-'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest ml-0.5">Nascimento</p>
                          <p className="font-bold text-slate-700 text-[10px]">{profile?.birth_date || '-'}</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest ml-0.5">Instagram</p>
                          <p className="font-bold text-pink-500 text-[10px]">{profile?.instagram || '-'}</p>
                        </div>
                      </div>
                      <Button onClick={() => setIsEditModalOpen(true)} variant="outline" className="w-full rounded-xl border-pink-100 text-pink-500 font-black text-[9px] h-9 hover:bg-pink-50 mt-1 tracking-widest uppercase">EDITAR DADOS</Button>
                    </Card>
                  </motion.div>
                )}
              </>
            ) : (
              <>
                {activeTab === "home" && (
                  <motion.div key="admin-home" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
                    <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Próximos Atendimentos</h3>
                    <div className="space-y-2.5">
                      {appointments.length > 0 ? appointments.map((app) => (
                        <Card key={app.id} className="p-3 border-none shadow-sm rounded-2xl hover:shadow-md transition-all bg-white/80">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center text-purple-400 font-black text-[10px]">{app.profiles?.full_name?.charAt(0)}</div>
                              <div>
                                <h4 className="font-bold text-slate-700 text-[10px]">{app.profiles?.full_name}</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{app.services?.name} • {app.available_slots?.start_time}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-slate-200 hover:text-pink-400 h-8 w-8"><ChevronRight size={16} /></Button>
                          </div>
                        </Card>
                      )) : <div className="text-center py-10 text-slate-300"><CalendarIcon size={32} className="mx-auto mb-2 opacity-20" /><p className="text-[10px] font-bold uppercase tracking-widest">Sem agenda</p></div>}
                    </div>
                  </motion.div>
                )}
                {activeTab === "services" && (
                  <motion.div key="admin-services" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em]">Meus Serviços</h3>
                      <Button onClick={() => openServiceModal()} size="sm" className="bg-pink-500 hover:bg-pink-600 rounded-xl gap-1.5 font-black text-[9px] h-7 tracking-wider shadow-sm"><Plus size={12} /> NOVO</Button>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      {services.map((service) => (
                        <Card key={service.id} className="p-3 border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl flex justify-between items-center bg-white/80 backdrop-blur-sm">
                          <div>
                            <h4 className="font-bold text-slate-700 text-[11px] leading-tight">{service.name}</h4>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">R$ {service.price} • {service.duration_minutes} min</p>
                          </div>
                          <div className="flex gap-1">
                            <Button onClick={() => openServiceModal(service)} variant="ghost" size="icon" className="text-pink-400 hover:text-pink-600 hover:bg-pink-50 h-8 w-8 rounded-xl transition-colors">
                              <Pencil size={14} />
                            </Button>
                            <Button onClick={() => handleDeleteService(service.id)} variant="ghost" size="icon" className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 rounded-xl transition-colors">
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                )}
                {activeTab === "calendar" && (
                  <motion.div key="admin-calendar" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
                    <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Gerenciar Agenda</h3>
                    
                    <Card className="p-4 border-none shadow-sm rounded-[2rem] bg-white/80 overflow-hidden">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        locale={ptBR}
                        className="rounded-2xl border-none mx-auto"
                        classNames={{
                          day_selected: "bg-pink-500 text-white hover:bg-pink-600 focus:bg-pink-500 rounded-xl",
                          day_today: "bg-slate-100 text-slate-900 rounded-xl",
                          day: "h-9 w-9 p-0 font-bold text-[10px] rounded-xl hover:bg-pink-50 transition-colors",
                          head_cell: "text-slate-400 font-black text-[9px] uppercase tracking-widest w-9",
                          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-pink-500",
                        }}
                      />
                    </Card>

                    {selectedDate && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                        <div className="flex justify-between items-center px-1">
                          <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                            Horários para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                          </h4>
                          <Button 
                            onClick={saveDailySlots} 
                            disabled={savingSlots}
                            size="sm" 
                            className="bg-purple-600 hover:bg-purple-700 rounded-xl gap-1.5 font-black text-[9px] h-7 tracking-wider shadow-md"
                          >
                            <Save size={12} /> {savingSlots ? 'SALVANDO...' : 'SALVAR'}
                          </Button>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {timeSlots.map((time) => {
                            const isSelected = availableSlots.includes(time);
                            return (
                              <button
                                key={time}
                                onClick={() => toggleSlot(time)}
                                className={`h-9 rounded-xl text-[10px] font-black transition-all border-2 ${
                                  isSelected 
                                    ? 'bg-pink-500 border-pink-500 text-white shadow-md scale-105' 
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-pink-200'
                                }`}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </Tabs>
      </main>

      {/* Modals */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[350px] rounded-[2rem] border-none shadow-2xl p-6">
          <DialogHeader><DialogTitle className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2"><Pencil size={16} className="text-pink-500" /> Editar Perfil</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest ml-2">Nome Completo</Label>
              <Input required className="bg-slate-50/50 border-slate-100 rounded-2xl px-4 h-10 text-[10px]" value={editFormData.full_name} onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest ml-2">CPF</Label>
                <InputMask mask="999.999.999-99" value={editFormData.cpf} onChange={(e) => setEditFormData({ ...editFormData, cpf: e.target.value })}>{(inputProps: any) => <Input required className="bg-slate-50/50 border-slate-100 rounded-2xl px-4 h-10 text-[10px]" {...inputProps} />}</InputMask>
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest ml-2">Telefone</Label>
                <InputMask mask="(99) 99999-9999" value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}>{(inputProps: any) => <Input required className="bg-slate-50/50 border-slate-100 rounded-2xl px-4 h-10 text-[10px]" {...inputProps} />}</InputMask>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest ml-2">Nascimento</Label>
                <InputMask mask="99/99/9999" value={editFormData.birth_date} onChange={(e) => setEditFormData({ ...editFormData, birth_date: e.target.value })}>{(inputProps: any) => <Input required placeholder="DD/MM/AAAA" className="bg-slate-50/50 border-slate-100 rounded-2xl px-4 h-10 text-[10px]" {...inputProps} />}</InputMask>
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest ml-2">Instagram (@)</Label>
                <Input className="bg-slate-50/50 border-slate-100 rounded-2xl px-4 h-10 text-[10px]" value={editFormData.instagram} onChange={(e) => setEditFormData({ ...editFormData, instagram: e.target.value })} />
              </div>
            </div>
            <DialogFooter className="pt-2"><Button type="submit" disabled={editLoading} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black text-[10px] py-6 rounded-2xl shadow-md tracking-widest uppercase">{editLoading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isServiceModalOpen} onOpenChange={setIsServiceModalOpen}>
        <DialogContent className="sm:max-w-[350px] rounded-[2rem] border-none shadow-2xl p-6">
          <DialogHeader><DialogTitle className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2"><Sparkles size={16} className="text-pink-500" /> {serviceFormData.id ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveService} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest ml-2">Nome do Serviço</Label>
              <Input required className="bg-slate-50/50 border-slate-100 rounded-2xl px-4 h-10 text-[10px]" value={serviceFormData.name} onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest ml-2">Preço (R$)</Label>
                <Input required type="number" step="0.01" className="bg-slate-50/50 border-slate-100 rounded-2xl px-4 h-10 text-[10px]" value={serviceFormData.price} onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest ml-2">Duração (min)</Label>
                <Input required type="number" className="bg-slate-50/50 border-slate-100 rounded-2xl px-4 h-10 text-[10px]" value={serviceFormData.duration_minutes} onChange={(e) => setServiceFormData({ ...serviceFormData, duration_minutes: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest ml-2">Descrição (Opcional)</Label>
              <Textarea className="bg-slate-50/50 border-slate-100 rounded-2xl px-4 text-[10px] min-h-[80px]" value={serviceFormData.description} onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })} />
            </div>
            <DialogFooter className="pt-2"><Button type="submit" disabled={editLoading} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black text-[10px] py-6 rounded-2xl shadow-md tracking-widest uppercase">{editLoading ? 'SALVANDO...' : 'SALVAR SERVIÇO'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer Credits */}
      <footer className="pt-12 pb-24 flex flex-col items-center gap-1.5 text-black">
        <p className="text-[7px] font-black tracking-[0.2em] uppercase">Desenvolvido por Matheus Souza</p>
        <div className="flex items-center gap-4">
          <p className="text-[7px] font-bold">© 2026 MATHEUS SOUZA</p>
          <a href="https://instagram.com/theu_souz2" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-pink-600 transition-colors group">
            <Instagram size={10} className="group-hover:scale-110 transition-transform" />
            <span className="text-[8px] font-black">@theu_souz2</span>
          </a>
        </div>
      </footer>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-4 left-4 right-4 bg-white/80 backdrop-blur-xl border border-white/40 h-14 rounded-[1.5rem] shadow-xl flex items-center justify-around px-2 z-50">
        <button onClick={() => setActiveTab('home')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'home' ? 'bg-pink-50/50 scale-105' : 'hover:bg-slate-50/50'}`}>
          <Sparkles 
            size={18} 
            className={activeTab === 'home' ? 'text-pink-500 animate-pulse' : ''} 
            style={activeTab !== 'home' ? { stroke: 'url(#purple-gradient)' } : {}}
          />
        </button>
        {isAdmin ? (
          <>
            <button onClick={() => setActiveTab('services')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'services' ? 'bg-pink-50/50 scale-105' : 'hover:bg-slate-50/50'}`}>
              <Settings 
                size={18} 
                className={activeTab === 'services' ? 'text-pink-500' : ''} 
                style={activeTab !== 'services' ? { stroke: 'url(#purple-gradient)' } : {}}
              />
            </button>
            <button onClick={() => setActiveTab('calendar')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'calendar' ? 'bg-pink-50/50 scale-105' : 'hover:bg-slate-50/50'}`}>
              <CalendarIcon 
                size={18} 
                className={activeTab === 'calendar' ? 'text-pink-500' : ''} 
                style={activeTab !== 'calendar' ? { stroke: 'url(#purple-gradient)' } : {}}
              />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setActiveTab('history')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'history' ? 'bg-pink-50/50 scale-105' : 'hover:bg-slate-50/50'}`}>
              <History 
                size={18} 
                className={activeTab === 'history' ? 'text-pink-500' : ''} 
                style={activeTab !== 'history' ? { stroke: 'url(#purple-gradient)' } : {}}
              />
            </button>
            <button onClick={() => setActiveTab('profile')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-pink-50/50 scale-105' : 'hover:bg-slate-50/50'}`}>
              <User 
                size={18} 
                className={activeTab === 'profile' ? 'text-pink-500' : ''} 
                style={activeTab !== 'profile' ? { stroke: 'url(#purple-gradient)' } : {}}
              />
            </button>
          </>
        )}
      </nav>
    </div>
  );
};

export default Index;