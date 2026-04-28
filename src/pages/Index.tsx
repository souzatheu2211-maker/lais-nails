"use client";

import * as React from "react";
import { useSession } from "@/components/SessionContextProvider";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, Sparkles, User, LogOut, Instagram, History, Settings, Plus, Pencil, Trash2, ChevronRight, Heart, X, Check, DollarSign, Save, Info, Image as ImageIcon, Upload, Loader2, Lock, AlertCircle, CalendarDays, Users, Phone, ChevronLeft, LayoutGrid } from "lucide-react";
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
import { format, addMinutes, parse, isSameDay } from "date-fns";
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

  // Estados de Detalhes da Cliente (Admin)
  const [isClientModalOpen, setIsClientModalOpen] = React.useState(false);
  const [selectedClient, setSelectedClient] = React.useState<any>(null);

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
      profiles:user_id (full_name, phone, instagram),
      services:service_id (name, price, duration_minutes)
    `);
    if (!isAdmin) query = query.eq('user_id', user.id);
    const { data } = await query.order('created_at', { ascending: false });
    setAppointments(data || []);
  }, [user?.id, isAdmin]);

  const fetchClients = React.useCallback(async () => {
    if (!isAdmin) return;
    const { data } = await supabase.from('profiles').select('*').eq('role', 'client').order('full_name');
    setClients(data || []);
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

  // Pré-carregamento da próxima imagem
  React.useEffect(() => {
    if (galleryImages.length > 0) {
      const nextIndex = (currentImageIndex + 1) % galleryImages.length;
      const img = new Image();
      img.src = galleryImages[nextIndex];
    }
  }, [currentImageIndex, galleryImages]);

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

  const fetchBookingSlots = React.useCallback(async (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const { data: slots } = await supabase.from('available_slots').select('*').eq('date', formattedDate).order('start_time');
    const { data: apps } = await supabase.from('appointments').select('start_time, end_time').eq('appointment_date', formattedDate).eq('status', 'scheduled');
    setAllBookingSlots(slots || []);
    setDayAppointments(apps || []);
  }, []);

  React.useEffect(() => {
    if (session) {
      fetchProfile();
      fetchServices();
      fetchAppointments();
      fetchGallery();
      if (isAdmin) fetchClients();
    }
  }, [session, fetchProfile, fetchServices, fetchAppointments, fetchClients, fetchGallery, isAdmin]);

  React.useEffect(() => {
    if (isAdmin && selectedDate) {
      fetchSlotsForDate(selectedDate);
    }
  }, [isAdmin, selectedDate, fetchSlotsForDate]);

  React.useEffect(() => {
    if (!isAdmin && bookingDate && isBookingModalOpen) {
      fetchBookingSlots(bookingDate);
    }
  }, [isAdmin, bookingDate, isBookingModalOpen, fetchBookingSlots]);

  // Auto-play galeria
  React.useEffect(() => {
    if (activeTab === "welcome" && galleryImages.length > 1) {
      const timer = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % galleryImages.length);
        setImageLoading(true);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [activeTab, galleryImages.length]);

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
        description: serviceFormData.description,
        image_url: serviceFormData.image_url
      };
      if (serviceFormData.id) {
        await supabase.from('services').update(payload).eq('id', serviceFormData.id);
      } else {
        await supabase.from('services').insert([payload]);
      }
      showSuccess("Serviço salvo!");
      setIsServiceModalOpen(false);
      fetchServices();
      sessionStorage.removeItem('lais_nails_gallery'); // Limpa cache para atualizar galeria
    } catch (error: any) {
      showError(error.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm("Excluir serviço?")) return;
    await supabase.from('services').update({ active: false }).eq('id', id);
    fetchServices();
    sessionStorage.removeItem('lais_nails_gallery');
  };

  const handleCreateAppointment = async () => {
    if (!selectedSlot || !bookingService || !user?.id || !bookingDate) return;
    setBookingLoading(true);
    try {
      const formattedDate = format(bookingDate, 'yyyy-MM-dd');
      const startTimeStr = selectedSlot.start_time;
      const startTime = parse(startTimeStr, 'HH:mm:ss', new Date());
      const endTimeStr = format(addMinutes(startTime, bookingService.duration_minutes), 'HH:mm:ss');

      const { data: hasConflict } = await supabase.rpc('check_appointment_conflict', {
        p_date: formattedDate,
        p_start: startTimeStr,
        p_end: endTimeStr
      });

      if (hasConflict) throw new Error("Horário indisponível.");

      await supabase.from('appointments').insert([{
        user_id: user.id,
        service_id: bookingService.id,
        slot_id: selectedSlot.id,
        appointment_date: formattedDate,
        start_time: startTimeStr,
        end_time: endTimeStr,
        status: 'scheduled'
      }]);

      showSuccess("Agendado com sucesso!");
      setIsBookingModalOpen(false);
      fetchAppointments();
      setActiveTab('history');
    } catch (error: any) {
      showError(error.message);
    } finally {
      setBookingLoading(false);
    }
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

  const openClientDetails = (client: any) => {
    setSelectedClient(client);
    setIsClientModalOpen(true);
  };

  const openServiceDetails = (service: any) => {
    setViewingService(service);
    setIsServiceDetailsOpen(true);
  };

  const openBookingModal = (service: any) => {
    setBookingService(service);
    setIsBookingModalOpen(true);
    setSelectedSlot(null);
  };

  const openServiceModal = (service: any = null) => {
    if (service) {
      setServiceFormData({
        id: service.id,
        name: service.name,
        price: service.price.toString(),
        duration_minutes: service.duration_minutes.toString(),
        description: service.description || '',
        image_url: service.image_url || ''
      });
    } else {
      setServiceFormData({ id: '', name: '', price: '', duration_minutes: '', description: '', image_url: '' });
    }
    setIsServiceModalOpen(true);
  };

  const timeSlots = Array.from({ length: 25 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  const toggleSlot = (time: string) => {
    setAvailableSlots(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]);
  };

  const getFirstName = (name: string) => name?.split(' ')[0] || 'Gata';

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter'] relative overflow-x-hidden">
      {/* IMAGEM DE FUNDO GLOBAL */}
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center opacity-[0.45]">
        <img 
          src={laisBg} 
          alt="Background" 
          className="w-full h-full object-cover" 
          loading="eager"
          decoding="async"
        />
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

      <main className="px-5 mt-4 flex-1 relative z-10">
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

                {/* Carrossel de Galeria Otimizado */}
                <Card className="relative h-[400px] w-full rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-slate-100 group">
                  <AnimatePresence mode="wait">
                    {galleryImages.length > 0 ? (
                      <div className="relative w-full h-full">
                        {imageLoading && (
                          <Skeleton className="absolute inset-0 w-full h-full rounded-[2.5rem]" />
                        )}
                        <motion.img
                          key={currentImageIndex}
                          src={galleryImages[currentImageIndex]}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          onLoad={() => setImageLoading(false)}
                          className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                        <ImageIcon size={40} strokeWidth={1} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Galeria em breve</p>
                      </div>
                    )}
                  </AnimatePresence>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                    <Button onClick={() => { setCurrentImageIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length); setImageLoading(true); }} variant="ghost" size="icon" className="text-white bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full h-10 w-10">
                      <ChevronLeft size={20} />
                    </Button>
                    <div className="flex gap-1.5">
                      {galleryImages.map((_, i) => (
                        <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === currentImageIndex ? 'w-6 bg-pink-500' : 'w-2 bg-white/30'}`} />
                      ))}
                    </div>
                    <Button onClick={() => { setCurrentImageIndex(prev => (prev + 1) % galleryImages.length); setImageLoading(true); }} variant="ghost" size="icon" className="text-white bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full h-10 w-10">
                      <ChevronRight size={20} />
                    </Button>
                  </div>
                </Card>

                <Button onClick={() => setActiveTab(isAdmin ? 'home' : 'services')} className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black text-[11px] py-7 rounded-2xl shadow-xl shadow-pink-200/50 tracking-[0.2em] uppercase active:scale-95 transition-all">
                  {isAdmin ? 'GERENCIAR ATENDIMENTOS' : 'VER SERVIÇOS E AGENDAR'}
                </Button>
              </motion.div>
            )}

            {/* ABA DE SERVIÇOS (CLIENTE) */}
            {!isAdmin && activeTab === "services" && (
              <motion.div key="services" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                  Nossos Serviços <Sparkles size={12} className="text-pink-300" />
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {services.map((service) => (
                    <Card key={service.id} className="p-3 border-none shadow-sm rounded-2xl flex items-center gap-3 bg-white/80 backdrop-blur-sm">
                      <div onClick={() => openServiceDetails(service)} className="w-12 h-12 bg-pink-50 rounded-xl overflow-hidden cursor-pointer">
                        {service.image_url ? (
                          <img 
                            src={service.image_url} 
                            className="w-full h-full object-cover" 
                            loading="lazy" 
                            decoding="async" 
                          />
                        ) : (
                          <span className="text-xl flex items-center justify-center h-full">💅</span>
                        )}
                      </div>
                      <div onClick={() => openServiceDetails(service)} className="flex-1 cursor-pointer">
                        <h4 className="font-bold text-slate-700 text-[11px]">{service.name}</h4>
                        <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">R$ {service.price} • {service.duration_minutes} min</p>
                      </div>
                      <div className="flex gap-1.5">
                        <Button onClick={() => openServiceDetails(service)} variant="outline" size="sm" className="border-pink-200 text-pink-500 hover:bg-pink-50 rounded-xl px-3 h-7 font-black text-[9px] tracking-wider">DETALHES</Button>
                        <Button onClick={() => openBookingModal(service)} size="sm" className="bg-pink-500 hover:bg-pink-600 rounded-xl px-4 h-7 font-black text-[9px] tracking-wider">AGENDAR</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ABA DE HISTÓRICO (CLIENTE) */}
            {!isAdmin && activeTab === "history" && (
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Meu Histórico</h3>
                <div className="space-y-2.5">
                  {appointments.map((app) => (
                    <Card key={app.id} className="p-3 border-none shadow-sm rounded-2xl bg-white/80">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-700 text-[11px]">{app.services?.name}</h4>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                            {format(new Date(app.appointment_date), "dd/MM/yyyy")} • {app.start_time.substring(0, 5)}
                          </p>
                        </div>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${app.status === 'completed' ? 'bg-green-50 text-green-500' : app.status === 'cancelled' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                          {app.status === 'scheduled' ? 'Agendado' : app.status === 'cancelled' ? 'Cancelado' : 'Concluído'}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ABA DE PERFIL (CLIENTE) */}
            {!isAdmin && activeTab === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Meu Perfil</h3>
                <Card className="p-5 border-none shadow-sm rounded-[2rem] space-y-4 bg-white/80">
                  <div className="space-y-0.5">
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Nome Completo</p>
                    <p className="font-bold text-slate-700 text-[10px]">{profile?.full_name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Telefone</p>
                      <p className="font-bold text-slate-700 text-[10px]">{profile?.phone}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Instagram</p>
                      <p className="font-bold text-pink-500 text-[10px]">{profile?.instagram}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">CPF</p>
                      <p className="font-bold text-slate-700 text-[10px]">{profile?.cpf || 'Não informado'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Nascimento</p>
                      <p className="font-bold text-slate-700 text-[10px]">{profile?.birth_date || 'Não informado'}</p>
                    </div>
                  </div>
                  <Button onClick={() => setIsEditModalOpen(true)} variant="outline" className="w-full rounded-xl border-pink-100 text-pink-500 font-black text-[9px] h-9 tracking-widest uppercase">EDITAR DADOS</Button>
                </Card>
              </motion.div>
            )}

            {/* ABA DE PRÓXIMOS ATENDIMENTOS (ADMIN) */}
            {isAdmin && activeTab === "home" && (
              <motion.div key="admin-home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h3 className="text-[13px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Próximos Atendimentos</h3>
                <div className="space-y-2.5">
                  {appointments.map((app) => (
                    <Card key={app.id} onClick={() => openClientDetails(app.profiles)} className="p-3 border-none shadow-sm rounded-2xl bg-white/80 hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center text-purple-400 font-black text-[10px] group-hover:bg-purple-100 transition-colors">
                            {app.profiles?.full_name?.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <h4 className="font-bold text-slate-700 text-[10px]">{app.profiles?.full_name}</h4>
                            <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                              <p className="text-[8px] text-slate-400 font-bold uppercase">
                                {app.services?.name} • {app.start_time.substring(0, 5)}
                              </p>
                              <p className="text-[8px] text-pink-500 font-bold uppercase flex items-center gap-0.5">
                                <Phone size={8} /> {app.profiles?.phone}
                              </p>
                              <p className="text-[8px] text-purple-500 font-bold uppercase flex items-center gap-0.5">
                                <Instagram size={8} /> {app.profiles?.instagram || '@sem_insta'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-slate-200 group-hover:text-pink-400 transition-colors" />
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
                          {client.full_name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-700 text-[10px]">{client.full_name}</h4>
                          <p className="text-[8px] text-pink-400 font-bold uppercase">{client.instagram || '@sem_insta'}</p>
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
                        <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden">
                          {service.image_url ? (
                            <img 
                              src={service.image_url} 
                              className="w-full h-full object-cover" 
                              loading="lazy" 
                              decoding="async" 
                            />
                          ) : (
                            <ImageIcon size={16} className="text-slate-300 m-auto" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-700 text-[11px]">{service.name}</h4>
                          <p className="text-[8px] text-slate-400 font-bold uppercase">R$ {service.price} • {service.duration_minutes} min</p>
                        </div>
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

      {/* Modal de Detalhes do Serviço (Cliente) */}
      <Dialog open={isServiceDetailsOpen} onOpenChange={setIsServiceDetailsOpen}>
        <DialogContent className="sm:max-w-[350px] rounded-[2rem] border-none shadow-2xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={16} className="text-pink-500" /> Detalhes do Serviço
            </DialogTitle>
          </DialogHeader>
          {viewingService && (
            <div className="space-y-4 mt-4">
              <div className="w-full h-40 bg-pink-50 rounded-2xl overflow-hidden">
                {viewingService.image_url ? (
                  <img src={viewingService.image_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">💅</div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-slate-800 text-sm">{viewingService.name}</h3>
                <div className="flex gap-3">
                  <p className="text-[10px] font-black text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">R$ {viewingService.price}</p>
                  <p className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{viewingService.duration_minutes} min</p>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed">{viewingService.description || 'Sem descrição disponível.'}</p>
              </div>
              <Button onClick={() => { setIsServiceDetailsOpen(false); openBookingModal(viewingService); }} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-black text-[10px] py-6 rounded-2xl tracking-widest uppercase">AGENDAR AGORA</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Perfil (Cliente) */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[350px] rounded-[2rem] border-none shadow-2xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <User size={16} className="text-pink-500" /> Editar Meus Dados
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-4 mt-4">
            <div className="space-y-1">
              <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">Nome Completo</Label>
              <Input
                required
                className="bg-slate-50 border-slate-100 rounded-xl h-10 text-[10px]"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">CPF</Label>
                <InputMask
                  mask="999.999.999-99"
                  value={editFormData.cpf}
                  onChange={(e) => setEditFormData({ ...editFormData, cpf: e.target.value })}
                >
                  {(inputProps: any) => <Input required className="bg-slate-50 border-slate-100 rounded-xl h-10 text-[10px]" {...inputProps} />}
                </InputMask>
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">Telefone</Label>
                <InputMask
                  mask="(99) 99999-9999"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                >
                  {(inputProps: any) => <Input required className="bg-slate-50 border-slate-100 rounded-xl h-10 text-[10px]" {...inputProps} />}
                </InputMask>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">Nascimento</Label>
                <InputMask
                  mask="99/99/9999"
                  value={editFormData.birth_date}
                  onChange={(e) => setEditFormData({ ...editFormData, birth_date: e.target.value })}
                >
                  {(inputProps: any) => <Input required className="bg-slate-50 border-slate-100 rounded-xl h-10 text-[10px]" {...inputProps} />}
                </InputMask>
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-2">Instagram (@)</Label>
                <Input
                  className="bg-slate-50 border-slate-100 rounded-xl h-10 text-[10px]"
                  value={editFormData.instagram}
                  onChange={(e) => setEditFormData({ ...editFormData, instagram: e.target.value })}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={editLoading}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black text-[10px] py-6 rounded-2xl tracking-widest uppercase mt-2"
            >
              {editLoading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes da Cliente (Admin) */}
      <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
        <DialogContent className="sm:max-w-[350px] rounded-[2rem] border-none shadow-2xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
              <User size={16} className="text-pink-500" /> Dados da Cliente
            </DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-5 mt-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-400 font-black text-xl shadow-inner">
                  {selectedClient.full_name?.charAt(0)}
                </div>
                <h3 className="font-black text-slate-800 text-sm">{selectedClient.full_name}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <Phone size={14} className="text-pink-400" />
                  <div>
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Telefone</p>
                    <p className="text-[10px] font-black text-slate-600">{selectedClient.phone || 'Não informado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                  <Instagram size={14} className="text-pink-400" />
                  <div>
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Instagram</p>
                    <p className="text-[10px] font-black text-pink-500">{selectedClient.instagram || '@sem_insta'}</p>
                  </div>
                </div>
              </div>
              <Button onClick={() => setIsClientModalOpen(false)} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black text-[10px] py-6 rounded-2xl tracking-widest uppercase">FECHAR</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Agendamento */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] border-none shadow-2xl p-0 bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white relative">
            <div className="absolute top-4 right-4">
              <Button onClick={() => setIsBookingModalOpen(false)} variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/20 rounded-full h-8 w-8"><X size={18} /></Button>
            </div>
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl mb-1"><Sparkles size={20} className="text-white animate-pulse" /></div>
              <h2 className="text-lg font-black tracking-tight">Agende seu horário 💖</h2>
              <p className="text-[10px] font-medium text-white/80">Escolha o dia e o horário perfeito para suas unhas</p>
            </div>
          </div>
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
            <div className="space-y-3">
              <div className="flex items-center gap-2 ml-1"><CalendarDays size={14} className="text-pink-500" /><Label className="text-[10px] font-black text-pink-300 uppercase tracking-[0.2em]">1. Escolha o dia</Label></div>
              <Card className="p-2 border-none shadow-sm rounded-[2.5rem] bg-white/90 backdrop-blur-md border border-pink-50">
                <Calendar mode="single" selected={bookingDate} onSelect={setBookingDate} locale={ptBR} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} className="rounded-2xl border-none mx-auto" />
              </Card>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 ml-1"><Clock size={14} className="text-pink-500" /><Label className="text-[10px] font-black text-pink-300 uppercase tracking-[0.2em]">2. Escolha o horário</Label></div>
              <div className="grid grid-cols-4 gap-2.5">
                {timeSlots.map((time) => {
                  const slotInDb = allBookingSlots.find(s => s.start_time.substring(0, 5) === time);
                  const isBooked = dayAppointments.some(app => {
                    const start = app.start_time.substring(0, 5);
                    const end = app.end_time.substring(0, 5);
                    return time >= start && time < end;
                  });
                  const isAvailable = slotInDb?.is_available === true && !isBooked;
                  const isSelected = selectedSlot?.id === slotInDb?.id && slotInDb?.id !== undefined;
                  return (
                    <motion.button key={time} whileTap={{ scale: 0.95 }} disabled={!isAvailable} onClick={() => isAvailable && setSelectedSlot(slotInDb)} className={`h-10 rounded-xl text-[10px] font-black transition-all border-2 flex items-center justify-center gap-1 relative overflow-hidden ${!isAvailable ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed' : isSelected ? 'bg-pink-500 border-pink-600 text-white shadow-lg scale-105' : 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600'}`}>
                      {!isAvailable ? <Lock size={10} /> : isSelected ? <Check size={10} /> : null}
                      {time}
                    </motion.button>
                  );
                })}
              </div>
            </div>
            {selectedSlot && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-5 border-none bg-gradient-to-br from-slate-50 to-white shadow-xl rounded-[2rem] relative overflow-hidden border border-pink-50">
                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Resumo</h4>
                        <p className="text-sm font-black text-slate-700">{bookingService?.name}</p>
                      </div>
                      <p className="text-[10px] font-black text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">R$ {bookingService?.price}</p>
                    </div>
                    <Button onClick={handleCreateAppointment} disabled={bookingLoading} className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black text-[11px] py-6 rounded-2xl shadow-lg tracking-widest uppercase active:scale-95 transition-all">
                      {bookingLoading ? "PROCESSANDO..." : "CONFIRMAR AGENDAMENTO"}
                    </Button>
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