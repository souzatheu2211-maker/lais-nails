"use client";

import * as React from "react";
import { useSession } from "@/components/SessionContextProvider";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, Sparkles, User, LogOut, Instagram, History, Settings, Plus, Pencil, Trash2, ChevronRight, Heart, X, Check, DollarSign, Save, Info, Image as ImageIcon, Upload, Loader2, Lock, AlertCircle, CalendarDays, Users, Phone, ChevronLeft, LayoutGrid, CheckCircle2, TrendingUp, TrendingDown, Wallet } from "lucide-react";
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
import { format, addMinutes, parse, isSameDay, parseISO } from "date-fns";
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
  const [financials, setFinancials] = React.useState<any[]>([]);
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

  // Estados de Galeria Otimizada
  const [galleryImages, setGalleryImages] = React.useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [imageLoading, setImageLoading] = React.useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = React.useState(false);
  const [isFinancialModalOpen, setIsFinancialModalOpen] = React.useState(false);
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

  const [financialFormData, setFinancialFormData] = React.useState({
    id: '',
    type: 'expense',
    category: '',
    amount: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd')
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
    if (!isAdmin) query = query.eq('user_id', user.id);
    const { data, error } = await query.order('appointment_date', { ascending: true }).order('start_time', { ascending: true });
    if (error) console.error("Erro ao buscar agendamentos:", error);
    setAppointments(data || []);
  }, [user?.id, isAdmin]);

  const fetchClients = React.useCallback(async () => {
    if (!isAdmin) return;
    const { data } = await supabase.from('profiles').select('*').eq('role', 'client').order('full_name');
    setClients(data || []);
  }, [isAdmin]);

  const fetchFinancials = React.useCallback(async () => {
    if (!isAdmin) return;
    const { data } = await supabase.from('financial_transactions').select('*').order('date', { ascending: false }).order('created_at', { ascending: false });
    setFinancials(data || []);
  }, [isAdmin]);

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
        fetchFinancials();
      }
    } else {
      navigate('/');
    }
  }, [session, fetchProfile, fetchServices, fetchAppointments, fetchClients, fetchFinancials, fetchGallery, isAdmin, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleCompleteAppointment = async (id: string) => {
    try {
      const app = appointments.find(a => a.id === id);
      const price = app?.services?.price || 0;

      const { error } = await supabase.from('appointments').update({ status: 'completed' }).eq('id', id);
      if (error) throw error;

      // Lança no financeiro automaticamente
      await supabase.from('financial_transactions').insert([{
        type: 'income',
        category: 'Serviço',
        amount: price,
        description: `Atendimento: ${app?.profiles?.full_name} - ${app?.services?.name}`,
        appointment_id: id,
        date: format(new Date(), 'yyyy-MM-dd')
      }]);

      showSuccess("Atendimento concluído!");
      fetchAppointments();
      if (isAdmin) fetchFinancials();
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

  const handleSaveFinancial = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const payload = {
        type: financialFormData.type,
        category: financialFormData.category,
        amount: parseFloat(financialFormData.amount),
        description: financialFormData.description,
        date: financialFormData.date
      };
      if (financialFormData.id) {
        await supabase.from('financial_transactions').update(payload).eq('id', financialFormData.id);
      } else {
        await supabase.from('financial_transactions').insert([payload]);
      }
      showSuccess("Lançamento salvo!");
      setIsFinancialModalOpen(false);
      fetchFinancials();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteFinancial = async (id: string) => {
    if (!confirm("Excluir lançamento?")) return;
    await supabase.from('financial_transactions').delete().eq('id', id);
    fetchFinancials();
  };

  const openFinancialModal = (item: any = null) => {
    if (item) {
      setFinancialFormData({
        id: item.id,
        type: item.type,
        category: item.category,
        amount: item.amount.toString(),
        description: item.description || '',
        date: item.date
      });
    } else {
      setFinancialFormData({ id: '', type: 'expense', category: '', amount: '', description: '', date: format(new Date(), 'yyyy-MM-dd') });
    }
    setIsFinancialModalOpen(true);
  };

  const totals = React.useMemo(() => {
    const income = financials.filter(f => f.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const expense = financials.filter(f => f.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
    return { income, expense, balance: income - expense };
  }, [financials]);

  const getFirstName = (name: string) => name?.split(' ')[0] || 'Gata';
  const formatDateSafe = (date: Date | string) => {
    if (typeof date === 'string') return format(parseISO(date + 'T12:00:00'), "dd/MM/yyyy");
    return format(date, "dd/MM/yyyy");
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter'] relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.45]">
        <img src={laisBg} alt="Background" className="w-full h-full object-cover" loading="eager" />
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
                <Card className="relative h-[400px] w-full rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-slate-100 group">
                  {galleryImages.length > 0 ? (
                    <motion.img key={currentImageIndex} src={galleryImages[currentImageIndex]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2"><ImageIcon size={40} strokeWidth={1} /><p className="text-[10px] font-black uppercase tracking-widest">Galeria em breve</p></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </Card>
                <Button onClick={() => setActiveTab(isAdmin ? 'home' : 'services')} className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black text-[11px] py-7 rounded-2xl shadow-xl tracking-[0.2em] uppercase active:scale-95 transition-all">
                  {isAdmin ? 'GERENCIAR ATENDIMENTOS' : 'VER SERVIÇOS E AGENDAR'}
                </Button>
              </motion.div>
            )}

            {/* ABA DE FATURAMENTO (ADMIN) */}
            {isAdmin && activeTab === "financial" && (
              <motion.div key="admin-financial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em]">Faturamento</h3>
                  <Button onClick={() => openFinancialModal()} size="sm" className="bg-rose-500 hover:bg-rose-600 rounded-xl gap-1.5 font-black text-[9px] h-7 tracking-wider shadow-sm"><Plus size={12} /> DESPESA</Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Card className="p-3 border-none shadow-sm rounded-2xl bg-emerald-50/80 backdrop-blur-sm text-center">
                    <p className="text-[7px] font-black text-emerald-600 uppercase tracking-widest mb-1">Entradas</p>
                    <p className="text-[11px] font-black text-emerald-700">R$ {totals.income.toFixed(2)}</p>
                  </Card>
                  <Card className="p-3 border-none shadow-sm rounded-2xl bg-rose-50/80 backdrop-blur-sm text-center">
                    <p className="text-[7px] font-black text-rose-600 uppercase tracking-widest mb-1">Saídas</p>
                    <p className="text-[11px] font-black text-rose-700">R$ {totals.expense.toFixed(2)}</p>
                  </Card>
                  <Card className="p-3 border-none shadow-sm rounded-2xl bg-purple-50/80 backdrop-blur-sm text-center">
                    <p className="text-[7px] font-black text-purple-600 uppercase tracking-widest mb-1">Saldo</p>
                    <p className="text-[11px] font-black text-purple-700">R$ {totals.balance.toFixed(2)}</p>
                  </Card>
                </div>

                <div className="space-y-2.5">
                  {financials.map((item) => (
                    <Card key={item.id} className="p-3 border-none shadow-sm rounded-2xl bg-white/80 flex justify-between items-center group">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                          {item.type === 'income' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        </div>
                        <div>
                          <h4 className="font-black text-black text-[10px]">{item.description}</h4>
                          <p className="text-[8px] text-slate-400 font-bold uppercase">{formatDateSafe(item.date)} • {item.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className={`text-[10px] font-black ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {item.type === 'income' ? '+' : '-'} R$ {item.amount}
                        </p>
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button onClick={() => openFinancialModal(item)} variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-pink-500"><Pencil size={12} /></Button>
                          <Button onClick={() => handleDeleteFinancial(item.id)} variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-rose-500"><Trash2 size={12} /></Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
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
                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                              <p className="text-[8px] text-black font-bold uppercase">
                                {app.services?.name} • {app.start_time.substring(0, 5)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button onClick={() => handleCompleteAppointment(app.id)} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-7 px-3 font-black text-[8px] tracking-widest uppercase gap-1"><CheckCircle2 size={10} /> CONCLUIR</Button>
                          <Button onClick={() => handleCancelAppointment(app.id)} variant="ghost" size="icon" className="text-rose-400 hover:text-rose-600 h-7 w-7"><X size={14} /></Button>
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
                        <div className="w-8 h-8 bg-pink-50 rounded-xl flex items-center justify-center text-pink-400 font-black text-[10px]">{client.full_name?.charAt(0) || '?'}</div>
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

            {/* ABA DE SERVIÇOS (ADMIN) */}
            {isAdmin && activeTab === "services" && (
              <motion.div key="admin-services" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em]">Meus Serviços</h3>
                  <Button onClick={() => openServiceModal()} size="sm" className="bg-pink-500 hover:bg-pink-600 rounded-xl gap-1.5 font-black text-[9px] h-7 tracking-wider shadow-sm"><Plus size={12} /> NOVO</Button>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {services.map((service) => (
                    <Card key={service.id} className="p-3 border-none shadow-sm rounded-2xl flex justify-between items-center bg-white/80">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden">{service.image_url ? <img src={service.image_url} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-slate-300 m-auto" />}</div>
                        <div><h4 className="font-bold text-slate-700 text-[11px]">{service.name}</h4><p className="text-[8px] text-slate-400 font-bold uppercase">R$ {service.price} • {service.duration_minutes} min</p></div>
                      </div>
                      <div className="flex gap-1">
                        <Button onClick={() => openServiceModal(service)} variant="ghost" size="icon" className="text-pink-400 h-8 w-8 rounded-xl"><Pencil size={14} /></Button>
                        <Button onClick={() => handleDeleteService(service.id)} variant="ghost" size="icon" className="text-rose-400 h-8 w-8 rounded-xl"><Trash2 size={14} /></Button>
                      </div>
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
              </motion.div>
            )}

            {/* ABAS CLIENTE */}
            {!isAdmin && activeTab === "services" && (
              <motion.div key="services" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">Nossos Serviços <Sparkles size={12} className="text-pink-300" /></h3>
                <div className="grid grid-cols-1 gap-3">
                  {services.map((service) => (
                    <Card key={service.id} className="p-3 border-none shadow-sm rounded-2xl flex items-center gap-3 bg-white/80 backdrop-blur-sm">
                      <div onClick={() => openServiceDetails(service)} className="w-12 h-12 bg-pink-50 rounded-xl overflow-hidden cursor-pointer">{service.image_url ? <img src={service.image_url} className="w-full h-full object-cover" /> : <span className="text-xl flex items-center justify-center h-full">💅</span>}</div>
                      <div onClick={() => openServiceDetails(service)} className="flex-1 cursor-pointer"><h4 className="font-bold text-slate-700 text-[11px]">{service.name}</h4><p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">R$ {service.price} • {service.duration_minutes} min</p></div>
                      <div className="flex gap-1.5">
                        <Button onClick={() => openServiceDetails(service)} variant="outline" size="sm" className="border-pink-200 text-pink-500 hover:bg-pink-50 rounded-xl px-3 h-7 font-black text-[9px] tracking-wider">DETALHES</Button>
                        <Button onClick={() => openBookingModal(service)} size="sm" className="bg-pink-500 hover:bg-pink-600 rounded-xl px-4 h-7 font-black text-[9px] tracking-wider">AGENDAR</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {!isAdmin && activeTab === "history" && (
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Meu Histórico</h3>
                <div className="space-y-2.5">
                  {appointments.map((app) => (
                    <Card key={app.id} className="p-3 border-none shadow-sm rounded-2xl bg-white/80">
                      <div className="flex justify-between items-start">
                        <div><h4 className="font-bold text-slate-700 text-[11px]">{app.services?.name}</h4><p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{formatDateSafe(app.appointment_date)} • {app.start_time.substring(0, 5)}</p></div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${app.status === 'completed' ? 'bg-green-50 text-green-500' : app.status === 'cancelled' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                            {app.status === 'scheduled' ? 'Agendado' : app.status === 'cancelled' ? 'Cancelado' : 'Atendida'}
                          </span>
                          {app.status === 'scheduled' && <Button onClick={() => handleCancelAppointment(app.id)} variant="ghost" size="sm" className="text-rose-400 hover:text-rose-600 h-6 px-2 text-[8px] font-black uppercase tracking-widest">CANCELAR</Button>}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </main>

      {/* Modal Financeiro (Admin) */}
      <Dialog open={isFinancialModalOpen} onOpenChange={setIsFinancialModalOpen}>
        <DialogContent className="sm:max-w-[350px] rounded-[2rem] border-none shadow-2xl p-6 bg-white">
          <DialogHeader><DialogTitle className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2"><Wallet size={16} className="text-pink-500" /> {financialFormData.id ? 'Editar Lançamento' : 'Nova Despesa'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveFinancial} className="space-y-4 mt-4">
            <div className="space-y-1">
              <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">Tipo</Label>
              <div className="flex gap-2">
                <Button type="button" onClick={() => setFinancialFormData({...financialFormData, type: 'income'})} variant={financialFormData.type === 'income' ? 'default' : 'outline'} className={`flex-1 h-9 text-[10px] font-black ${financialFormData.type === 'income' ? 'bg-emerald-500' : ''}`}>ENTRADA</Button>
                <Button type="button" onClick={() => setFinancialFormData({...financialFormData, type: 'expense'})} variant={financialFormData.type === 'expense' ? 'default' : 'outline'} className={`flex-1 h-9 text-[10px] font-black ${financialFormData.type === 'expense' ? 'bg-rose-500' : ''}`}>SAÍDA</Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">Valor (R$)</Label>
              <Input required type="number" step="0.01" className="bg-slate-50 border-slate-100 rounded-xl h-10 text-[10px]" value={financialFormData.amount} onChange={(e) => setFinancialFormData({ ...financialFormData, amount: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">Categoria</Label>
              <Input required placeholder="Ex: Aluguel, Material, etc" className="bg-slate-50 border-slate-100 rounded-xl h-10 text-[10px]" value={financialFormData.category} onChange={(e) => setFinancialFormData({ ...financialFormData, category: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">Descrição</Label>
              <Input required className="bg-slate-50 border-slate-100 rounded-xl h-10 text-[10px]" value={financialFormData.description} onChange={(e) => setFinancialFormData({ ...financialFormData, description: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">Data</Label>
              <Input required type="date" className="bg-slate-50 border-slate-100 rounded-xl h-10 text-[10px]" value={financialFormData.date} onChange={(e) => setFinancialFormData({ ...financialFormData, date: e.target.value })} />
            </div>
            <Button type="submit" disabled={editLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] py-6 rounded-2xl tracking-widest uppercase mt-2">{editLoading ? 'SALVANDO...' : 'SALVAR LANÇAMENTO'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes da Cliente/Atendimento (Admin) */}
      <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
        <DialogContent className="sm:max-w-[350px] rounded-[2rem] border-none shadow-2xl p-6 bg-white">
          <DialogHeader><DialogTitle className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2"><User size={16} className="text-pink-500" /> {selectedAppointment ? 'Detalhes do Atendimento' : 'Dados da Cliente'}</DialogTitle></DialogHeader>
          {selectedClient && (
            <div className="space-y-5 mt-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-400 font-black text-xl shadow-inner">{selectedClient.full_name?.charAt(0) || '?'}</div>
                <h3 className="font-black text-black text-sm">{selectedClient.full_name || 'Sem nome'}</h3>
              </div>
              {selectedAppointment && (
                <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-2">
                  <div className="flex items-center gap-2"><Sparkles size={14} className="text-pink-500" /><p className="text-[10px] font-black text-black uppercase tracking-widest">{selectedAppointment.services?.name}</p></div>
                  <div className="flex items-center gap-2"><Clock size={14} className="text-pink-500" /><p className="text-[10px] font-black text-black uppercase tracking-widest">{formatDateSafe(selectedAppointment.appointment_date)} às {selectedAppointment.start_time.substring(0, 5)}</p></div>
                </div>
              )}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl"><Phone size={14} className="text-pink-400" /><div><p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Telefone</p><p className="text-[10px] font-black text-black">{selectedClient.phone || 'Não informado'}</p></div></div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl"><Instagram size={14} className="text-pink-400" /><div><p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Instagram</p><p className="text-[10px] font-black text-black">{selectedClient.instagram || '@sem_insta'}</p></div></div>
              </div>
              <div className="flex gap-2">
                {selectedAppointment && <Button onClick={() => { handleCompleteAppointment(selectedAppointment.id); setIsClientModalOpen(false); }} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] py-6 rounded-2xl tracking-widest uppercase">CONCLUIR</Button>}
                <Button onClick={() => setIsClientModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-black text-[10px] py-6 rounded-2xl tracking-widest uppercase">FECHAR</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Agendamento */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] border-none shadow-2xl p-0 bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white relative">
            <div className="absolute top-4 right-4"><Button onClick={() => setIsBookingModalOpen(false)} variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/20 rounded-full h-8 w-8"><X size={18} /></Button></div>
            <div className="flex flex-col items-center text-center space-y-1"><div className="bg-white/20 backdrop-blur-md p-2 rounded-xl mb-1"><Sparkles size={20} className="text-white animate-pulse" /></div><h2 className="text-lg font-black tracking-tight">Agende seu horário 💖</h2><p className="text-[10px] font-medium text-white/80">Escolha o dia e o horário perfeito para suas unhas</p></div>
          </div>
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
            <div className="space-y-3">
              <div className="flex items-center gap-2 ml-1"><CalendarDays size={14} className="text-pink-500" /><Label className="text-[10px] font-black text-pink-300 uppercase tracking-[0.2em]">1. Escolha o dia</Label></div>
              <Card className="p-2 border-none shadow-sm rounded-[2.5rem] bg-white/90 backdrop-blur-md border border-pink-50"><Calendar mode="single" selected={bookingDate} onSelect={setBookingDate} locale={ptBR} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} className="rounded-2xl border-none mx-auto" /></Card>
            </div>
            {selectedSlot && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-5 border-none bg-gradient-to-br from-slate-50 to-white shadow-xl rounded-[2rem] relative overflow-hidden border border-pink-50">
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-start">
                      <div><h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Resumo</h4><p className="text-sm font-black text-slate-700">{bookingService?.name}</p><p className="text-[10px] font-bold text-slate-400 mt-1">{bookingDate && formatDateSafe(bookingDate)} às {selectedSlot.start_time.substring(0, 5)}</p></div>
                      <p className="text-[10px] font-black text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">R$ {bookingService?.price}</p>
                    </div>
                    <Button onClick={() => {}} disabled={bookingLoading} className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black text-[11px] py-6 rounded-2xl shadow-lg tracking-widest uppercase active:scale-95 transition-all">CONFIRMAR AGENDAMENTO</Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
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
            <button onClick={() => setActiveTab('financial')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'financial' ? 'bg-pink-50/50 scale-105' : 'hover:bg-slate-50/50'}`}>
              <DollarSign size={18} className={activeTab === 'financial' ? 'text-pink-500' : ''} style={activeTab !== 'financial' ? { stroke: 'url(#purple-gradient)' } : {}} />
            </button>
            <button onClick={() => setActiveTab('services')} className={`p-2.5 rounded-xl transition-all ${activeTab === 'services' ? 'bg-pink-50/50 scale-105' : 'hover:bg-slate-50/50'}`}>
              <Settings size={18} className={activeTab === 'services' ? 'text-pink-500' : ''} style={activeTab !== 'services' ? { stroke: 'url(#purple-gradient)' } : {}} />
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