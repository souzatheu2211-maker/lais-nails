"use client";

import * as React from "react";
import { useSession } from "@/components/SessionContextProvider";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, Sparkles, User, LogOut, Instagram, History, Settings, Plus, Pencil, Trash2, ChevronRight, Heart, X, Check, DollarSign, Save, Info, Image as ImageIcon, Upload, Loader2, Lock, AlertCircle, CalendarDays, Users, Phone, ChevronLeft, LayoutGrid, CheckCircle2, TrendingUp, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
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
import { format, addMinutes, parse, isSameDay, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import InputMask from 'react-input-mask';
import { Skeleton } from "@/components/ui/skeleton";

// Importando a imagem de fundo para garantir que o Vite a processe corretamente
import laisBg from "@/assets/lais-bg.jpeg";

const Index = () => {
  const { session, user } = useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState("welcome");
  const [profile, setProfile] = React.useState<any>(null);
  const [services, setServices] = React.useState<any[]>([]);
  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [clients, setClients] = React.useState<any[]>([]);
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Estados da Agenda (Admin)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = React.useState<string[]>([]);
  const [savingSlots, setSavingSlots] = React.useState(false);

  // Estados de Agendamento (Cliente)
  const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false);
  const [bookingService, setBookingService] = React.useState<any>(null);
  const [bookingDate, setBookingDate] = React.useState<Date | undefined>(new Date());
  const [allBookingSlots, setAllBookingSlots] = React.useState<any[]>([]);
  const [dayAppointments, setDayAppointments] = React.useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = React.useState<any>(null);
  const [bookingLoading, setBookingLoading] = React.useState(false);

  // Estados de Detalhes do Serviço (Cliente)
  const [isServiceDetailsOpen, setIsServiceDetailsOpen] = React.useState(false);
  const [viewingService, setViewingService] = React.useState<any>(null);

  // Estados de Detalhes da Cliente/Atendimento (Admin)
  const [isClientModalOpen, setIsClientModalOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<any>(null);
  const [selectedAppointment, setSelectedAppointment] = React.useState<any>(null);

  // Estados de Faturamento (Admin)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = React.useState(false);
  const [expenseFormData, setExpenseFormData] = React.useState({
    description: '',
    amount: '',
    category: 'Material'
  });

  // Estados de Galeria Otimizada
  const [galleryImages, setGalleryImages] = React.useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [imageLoading, setImageLoading] = React.useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState<any>(null);
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
    description: '',
    image_url: ''
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
      profiles:user_id (id, full_name, phone, instagram, birth_date, cpf),
      services:service_id (id, name, price, duration_minutes)
    `);
    
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query.order('appointment_date', { ascending: true }).order('start_time', { ascending: true });
    
    if (error) {
      console.error("Erro ao buscar agendamentos:", error);
    }
    setAppointments(data || []);
  }, [user?.id, isAdmin]);

  const fetchClients = React.useCallback(async () => {
    if (!isAdmin) return;
    const { data } = await supabase.from('profiles').select('*').eq('role', 'client').order('full_name');
    setClients(data || []);
  }, [isAdmin]);

  const fetchTransactions = React.useCallback(async () => {
    if (!isAdmin) return;
    const { data } = await supabase.from('financial_transactions').select('*').order('date', { ascending: false });
    setTransactions(data || []);
  }, [isAdmin]);

  // Galeria com Cache Local (SessionStorage)
  const fetchGallery = React.useCallback(async () => {
    const cachedGallery = sessionStorage.getItem('lais_nails_gallery');
    if (cachedGallery) {
      setGalleryImages(JSON.parse(cachedGallery));
      return;
    }

    const { data } = await supabase.from('services').select('image_url').not('image_url', 'is', null);
    if (data) {
      const urls = data.map(d => d.image_url);
      setGalleryImages(urls);
      sessionStorage.setItem('lais_nails_gallery', JSON.stringify(urls));
    }
  }, []);

  React.useEffect(() => {
    if (session) {
      fetchProfile();
      fetchServices();
      fetchAppointments();
      fetchGallery();
      if (isAdmin) {
        fetchClients();
        fetchTransactions();
      }
    } else {
      navigate('/');
    }
  }, [session, fetchProfile, fetchServices, fetchAppointments, fetchClients, fetchGallery, fetchTransactions, isAdmin, navigate]);

  React.useEffect(() => {
    if (isAdmin && selectedDate) {
      fetchSlotsForDate(selectedDate);
    }
  }, [isAdmin, selectedDate]);

  const fetchSlotsForDate = async (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const { data } = await supabase.from('available_slots').select('start_time').eq('date', formattedDate);
    setAvailableSlots(data?.map(s => s.start_time.substring(0, 5)) || []);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleCompleteAppointment = async (app: any) => {
    try {
      // 1. Atualiza status do agendamento
      const { error: appError } = await supabase.from('appointments').update({ status: 'completed' }).eq('id', app.id);
      if (appError) throw appError;

      // 2. Registra no financeiro
      const { error: transError } = await supabase.from('financial_transactions').insert([{
        type: 'income',
        category: 'Serviço',
        amount: app.services?.price || 0,
        description: `Atendimento: ${app.profiles?.full_name} - ${app.services?.name}`,
        appointment_id: app.id,
        date: format(new Date(), 'yyyy-MM-dd')
      }]);
      if (transError) throw transError;

      showSuccess("Atendimento concluído e valor registrado!");
      fetchAppointments();
      fetchTransactions();
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('financial_transactions').insert([{
        type: 'expense',
        category: expenseFormData.category,
        amount: parseFloat(expenseFormData.amount),
        description: expenseFormData.description,
        date: format(new Date(), 'yyyy-MM-dd')
      }]);
      if (error) throw error;
      showSuccess("Despesa registrada!");
      setIsExpenseModalOpen(false);
      setExpenseFormData({ description: '', amount: '', category: 'Material' });
      fetchTransactions();
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Deseja realmente cancelar este agendamento?")) return;
    try {
      const { error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
      if (error) throw error;
      showSuccess("Agendamento cancelado.");
      fetchAppointments();
    } catch (error: any) {
      showError(error.message);
    }
  };

  const openClientDetails = (client: any, appointment: any = null) => {
    setSelectedClient(client);
    setSelectedAppointment(appointment);
    setIsClientModalOpen(true);
  };

  const openBookingModal = (service: any) => {
    setBookingService(service);
    setIsBookingModalOpen(true);
    setSelectedSlot(null);
  };

  const timeSlots = Array.from({ length: 25 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  const toggleSlot = (time: string) => {
    setAvailableSlots(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]);
  };

  const saveDailySlots = async () => {
    if (!selectedDate) return;
    setSavingSlots(true);
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    try {
      await supabase.from('available_slots').delete().eq('date', formattedDate);
      if (availableSlots.length > 0) {
        const newSlots = availableSlots.map(time => ({ date: formattedDate, start_time: `${time}:00`, is_available: true }));
        await supabase.from('available_slots').insert(newSlots);
      }
      showSuccess("Agenda salva!");
    } catch (error: any) {
      showError(error.message);
    } finally {
      setSavingSlots(false);
    }
  };

  const getFirstName = (name: string) => name?.split(' ')[0] || 'Gata';

  const formatDateSafe = (date: Date | string) => {
    if (typeof date === 'string') {
      return format(parseISO(date + 'T12:00:00'), "dd/MM/yyyy");
    }
    return format(date, "dd/MM/yyyy");
  };

  // Cálculos Financeiros
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const balance = totalIncome - totalExpense;

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter'] relative overflow-x-hidden">
      {/* IMAGEM DE FUNDO GLOBAL */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.45]">
        <img src={laisBg} alt="Background" className="w-full h-full object-cover" />
      </div>

      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="purple-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>

      <header className="bg-white/90 backdrop-blur-md px-5 pt-6 pb-4 rounded-b-[2.5rem] shadow-sm border-b border-pink-50 relative z-10">
        <div className="flex flex-col items-center">
          <div className="flex justify-between w-full items-center mb-2">
            <div className="w-8" />
            <img src="/logo.png" alt="Lais Nails Logo" className="h-14 w-auto object-contain drop-shadow-sm" />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-300 hover:text-pink-500 h-8 w-8">
              <LogOut size={18} />
            </Button>
          </div>
          <p className="font-['Dancing_Script'] text-2xl text-pink-500 mt-0.5">
            Bem-vinda, {getFirstName(profile?.full_name)}!
          </p>
        </div>
      </header>

      <main className="px-5 mt-4 flex-1 relative z-10 pb-32">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <AnimatePresence mode="wait">
            {activeTab === "welcome" && (
              <motion.div key="welcome" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="text-center space-y-1 px-2">
                  <h2 className="text-2xl font-black text-slate-800 leading-tight tracking-tight">
                    Sua beleza merece <span className="text-pink-500">protagonismo.</span>
                  </h2>
                  <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.3em]">Onde a arte encontra o cuidado</p>
                </div>
                <Button onClick={() => setActiveTab(isAdmin ? 'home' : 'services')} className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black text-[11px] py-7 rounded-2xl shadow-xl shadow-pink-200/50 tracking-[0.2em] uppercase active:scale-95 transition-all">
                  {isAdmin ? 'GERENCIAR ATENDIMENTOS' : 'VER SERVIÇOS E AGENDAR'}
                </Button>
              </motion.div>
            )}

            {/* ABA DE PRÓXIMOS ATENDIMENTOS (ADMIN) */}
            {isAdmin && activeTab === "home" && (
              <motion.div key="admin-home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Próximos Atendimentos</h3>
                <div className="space-y-2.5">
                  {appointments.filter(a => a.status === 'scheduled').map((app) => (
                    <Card key={app.id} className="p-3 border-none shadow-sm rounded-2xl bg-white/80 hover:shadow-md transition-all group">
                      <div className="flex justify-between items-center">
                        <div onClick={() => openClientDetails(app.profiles, app)} className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center text-purple-400 font-black text-[10px] group-hover:bg-purple-100 transition-colors">
                            {app.profiles?.full_name?.charAt(0) || '?'}
                          </div>
                          <div className="flex flex-col">
                            <h4 className="font-black text-black text-[10px]">{app.profiles?.full_name || 'Cliente sem nome'}</h4>
                            <p className="text-[8px] text-black font-bold uppercase mt-0.5">
                              {app.services?.name} • {app.start_time.substring(0, 5)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button onClick={() => handleCompleteAppointment(app)} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-7 px-3 font-black text-[8px] tracking-widest uppercase gap-1">
                            <CheckCircle2 size={10} /> CONCLUIR
                          </Button>
                          <Button onClick={() => handleCancelAppointment(app.id)} variant="ghost" size="icon" className="text-rose-400 hover:text-rose-600 h-7 w-7">
                            <X size={14} />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ABA DE CLIENTES (ADMIN) */}
            {isAdmin && activeTab === "clients" && (
              <motion.div key="admin-clients" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Minhas Clientes</h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {clients.map((client) => (
                    <Card key={client.id} onClick={() => openClientDetails(client)} className="p-3 border-none shadow-sm rounded-2xl bg-white/80 hover:shadow-md transition-all cursor-pointer flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-pink-50 rounded-xl flex items-center justify-center text-pink-400 font-black text-[10px]">
                          {client.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <h4 className="font-black text-black text-[10px]">{client.full_name || 'Sem nome'}</h4>
                          <div className="flex gap-3 mt-0.5">
                            <p className="text-[8px] text-black font-bold uppercase">{client.phone || 'Sem tel'}</p>
                            <p className="text-[8px] text-black font-bold uppercase">{client.instagram || '@sem_insta'}</p>
                          </div>
                        </div>
                      </div>
                      <Phone size={12} className="text-slate-300" />
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ABA DE FATURAMENTO (ADMIN) */}
            {isAdmin && activeTab === "finance" && (
              <motion.div key="admin-finance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em]">Faturamento</h3>
                  <Button onClick={() => setIsExpenseModalOpen(true)} size="sm" className="bg-rose-500 hover:bg-rose-600 rounded-xl gap-1.5 font-black text-[9px] h-7 tracking-wider shadow-sm">
                    <ArrowDownCircle size={12} /> DESPESA
                  </Button>
                </div>

                {/* Cards de Resumo */}
                <div className="grid grid-cols-3 gap-2">
                  <Card className="p-3 border-none bg-emerald-50 rounded-2xl text-center">
                    <p className="text-[7px] font-black text-emerald-600 uppercase tracking-widest mb-1">Entradas</p>
                    <p className="text-[11px] font-black text-emerald-700">R$ {totalIncome.toFixed(2)}</p>
                  </Card>
                  <Card className="p-3 border-none bg-rose-50 rounded-2xl text-center">
                    <p className="text-[7px] font-black text-rose-600 uppercase tracking-widest mb-1">Saídas</p>
                    <p className="text-[11px] font-black text-rose-700">R$ {totalExpense.toFixed(2)}</p>
                  </Card>
                  <Card className="p-3 border-none bg-purple-50 rounded-2xl text-center">
                    <p className="text-[7px] font-black text-purple-600 uppercase tracking-widest mb-1">Saldo</p>
                    <p className="text-[11px] font-black text-purple-700">R$ {balance.toFixed(2)}</p>
                  </Card>
                </div>

                {/* Lista de Transações */}
                <div className="space-y-2">
                  {transactions.map((t) => (
                    <Card key={t.id} className="p-3 border-none shadow-sm rounded-2xl bg-white/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                          {t.type === 'income' ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                        </div>
                        <div>
                          <h4 className="font-black text-black text-[10px]">{t.description}</h4>
                          <p className="text-[8px] text-slate-400 font-bold uppercase">{formatDateSafe(t.date)} • {t.category}</p>
                        </div>
                      </div>
                      <p className={`text-[10px] font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                      </p>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ABA DE AGENDA (ADMIN) */}
            {isAdmin && activeTab === "calendar" && (
              <motion.div key="admin-calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Gerenciar Agenda</h3>
                <Card className="p-2 border-none shadow-sm rounded-[2.5rem] bg-white/90 backdrop-blur-md">
                  <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} locale={ptBR} className="rounded-2xl border-none mx-auto" />
                </Card>
                {selectedDate && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <h4 className="text-[11px] font-black text-pink-400 uppercase tracking-widest">Horários para {format(selectedDate, "dd/MM", { locale: ptBR })}</h4>
                      <Button onClick={saveDailySlots} disabled={savingSlots} size="sm" className="bg-purple-600 hover:bg-purple-700 rounded-xl gap-1.5 font-black text-[9px] h-7 tracking-wider shadow-md">
                        <Save size={12} /> {savingSlots ? 'SALVANDO...' : 'SALVAR'}
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((time) => {
                        const isSelected = availableSlots.includes(time);
                        return (
                          <button key={time} onClick={() => toggleSlot(time)} className={`h-9 rounded-xl text-[10px] font-black transition-all border-2 ${isSelected ? 'bg-pink-500 border-pink-500 text-white shadow-md scale-105' : 'bg-slate-200 border-slate-300 text-slate-400 hover:border-pink-200'}`}>
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </main>

      {/* Modal de Despesa */}
      <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
        <DialogContent className="sm:max-w-[350px] rounded-[2rem] border-none shadow-2xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
              <ArrowDownCircle size={16} /> Registrar Despesa
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddExpense} className="space-y-4 mt-4">
            <div className="space-y-1">
              <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">Descrição</Label>
              <Input required placeholder="Ex: Compra de esmaltes" className="bg-slate-50 border-slate-100 rounded-xl h-10 text-[10px]" value={expenseFormData.description} onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">Valor (R$)</Label>
                <Input required type="number" step="0.01" placeholder="0.00" className="bg-slate-50 border-slate-100 rounded-xl h-10 text-[10px]" value={expenseFormData.amount} onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">Categoria</Label>
                <select className="w-full bg-slate-50 border-slate-100 rounded-xl h-10 text-[10px] px-2" value={expenseFormData.category} onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })}>
                  <option>Material</option>
                  <option>Aluguel</option>
                  <option>Energia</option>
                  <option>Outros</option>
                </select>
              </div>
            </div>
            <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] py-6 rounded-2xl tracking-widest uppercase mt-2">SALVAR DESPESA</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes da Cliente/Atendimento (Admin) */}
      <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
        <DialogContent className="sm:max-w-[350px] rounded-[2rem] border-none shadow-2xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <User size={16} className="text-pink-500" /> {selectedAppointment ? 'Detalhes do Atendimento' : 'Dados da Cliente'}
            </DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-5 mt-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-400 font-black text-xl shadow-inner">
                  {selectedClient.full_name?.charAt(0) || '?'}
                </div>
                <h3 className="font-black text-black text-sm">{selectedClient.full_name || 'Sem nome'}</h3>
              </div>

              {selectedAppointment && (
                <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-pink-500" />
                    <p className="text-[10px] font-black text-black uppercase tracking-widest">{selectedAppointment.services?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-pink-500" />
                    <p className="text-[10px] font-black text-black uppercase tracking-widest">
                      {formatDateSafe(selectedAppointment.appointment_date)} às {selectedAppointment.start_time.substring(0, 5)}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <Phone size={14} className="text-pink-400" />
                  <div>
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Telefone</p>
                    <p className="text-[10px] font-black text-black">{selectedClient.phone || 'Não informado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <Instagram size={14} className="text-pink-400" />
                  <div>
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Instagram</p>
                    <p className="text-[10px] font-black text-black">{selectedClient.instagram || '@sem_insta'}</p>
                  </div>
                </div>
                {!selectedAppointment && (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                      <CalendarIcon size={14} className="text-pink-400" />
                      <div>
                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Nascimento</p>
                        <p className="text-[10px] font-black text-black">{selectedClient.birth_date || 'Não informado'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                      <Info size={14} className="text-pink-400" />
                      <div>
                        <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">CPF</p>
                        <p className="text-[10px] font-black text-black">{selectedClient.cpf || 'Não informado'}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex gap-2">
                {selectedAppointment && selectedAppointment.status === 'scheduled' && (
                  <Button onClick={() => { handleCompleteAppointment(selectedAppointment); setIsClientModalOpen(false); }} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] py-6 rounded-2xl tracking-widest uppercase">CONCLUIR</Button>
                )}
                <Button onClick={() => setIsClientModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-black text-[10px] py-6 rounded-2xl tracking-widest uppercase">FECHAR</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* BARRA DE NAVEGAÇÃO */}
      <nav className="fixed bottom-4 left-4 right-4 bg-white/80 backdrop-blur-xl border border-white/40 h-14 rounded-[1.5rem] shadow-xl flex items-center justify-around px-2 z-50">
        <button onClick={() => setActiveTab('welcome')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'welcome' ? 'bg-pink-50/50 scale-105' : 'hover:bg-slate-50/50'}`}>
          <Sparkles size={18} className={activeTab === 'welcome' ? 'text-pink-500 animate-pulse' : ''} style={activeTab !== 'welcome' ? { stroke: 'url(#purple-gradient)' } : {}} />
        </button>

        {isAdmin ? (
          <>
            <button onClick={() => setActiveTab('home')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'home' ? 'bg-pink-50/50 scale-105' : 'hover:bg-slate-50/50'}`}>
              <LayoutGrid size={18} className={activeTab === 'home' ? 'text-pink-500' : ''} style={activeTab !== 'home' ? { stroke: 'url(#purple-gradient)' } : {}} />
            </button>
            <button onClick={() => setActiveTab('clients')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'clients' ? 'bg-pink-50/50 scale-105' : 'hover:bg-slate-50/50'}`}>
              <Users size={18} className={activeTab === 'clients' ? 'text-pink-500' : ''} style={activeTab !== 'clients' ? { stroke: 'url(#purple-gradient)' } : {}} />
            </button>
            <button onClick={() => setActiveTab('finance')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'finance' ? 'bg-pink-50/50 scale-105' : 'hover:bg-slate-50/50'}`}>
              <TrendingUp size={18} className={activeTab === 'finance' ? 'text-pink-500' : ''} style={activeTab !== 'finance' ? { stroke: 'url(#purple-gradient)' } : {}} />
            </button>
            <button onClick={() => setActiveTab('calendar')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'calendar' ? 'bg-pink-50/50 scale-105' : 'hover:bg-slate-50/50'}`}>
              <CalendarIcon size={18} className={activeTab === 'calendar' ? 'text-pink-500' : ''} style={activeTab !== 'calendar' ? { stroke: 'url(#purple-gradient)' } : {}} />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setActiveTab('services')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'services' ? 'bg-pink-50/50 scale-105' : 'hover:bg-slate-50/50'}`}>
              <LayoutGrid size={18} className={activeTab === 'services' ? 'text-pink-500' : ''} style={activeTab !== 'services' ? { stroke: 'url(#purple-gradient)' } : {}} />
            </button>
            <button onClick={() => setActiveTab('history')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'history' ? 'bg-pink-50/50 scale-105' : 'hover:bg-slate-50/50'}`}>
              <History size={18} className={activeTab === 'history' ? 'text-pink-500' : ''} style={activeTab !== 'history' ? { stroke: 'url(#purple-gradient)' } : {}} />
            </button>
            <button onClick={() => setActiveTab('profile')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-pink-50/50 scale-105' : 'hover:bg-slate-50/50'}`}>
              <User size={18} className={activeTab === 'profile' ? 'text-pink-500' : ''} style={activeTab !== 'profile' ? { stroke: 'url(#purple-gradient)' } : {}} />
            </button>
          </>
        )}
      </nav>
    </div>
  );
};

export default Index;