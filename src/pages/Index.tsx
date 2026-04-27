"use client";

import * as React from "react";
import { useSession } from "@/components/SessionContextProvider";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, Sparkles, User, LogOut, Instagram, History, Settings, Plus, Pencil, Trash2, ChevronRight, Heart, X, Check, DollarSign, Save, Info, Image as ImageIcon, Upload, Loader2, Lock, AlertCircle, CalendarDays } from "lucide-react";
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

  // Estados de Agendamento (Cliente)
  const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false);
  const [bookingService, setBookingService] = React.useState<any>(null);
  const [bookingDate, setBookingDate] = React.useState<Date | undefined>(new Date());
  const [allBookingSlots, setAllBookingSlots] = React.useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = React.useState<any>(null);
  const [bookingLoading, setBookingLoading] = React.useState(false);

  // Estados de Cancelamento
  const [isCancelModalOpen, setIsCancelModalOpen] = React.useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = React.useState<any>(null);
  const [cancelReason, setCancelReason] = React.useState("");
  const [cancelLoading, setCancelLoading] = React.useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = React.useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState<any>(null);
  const [editLoading, setEditLoading] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);

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
    const { data, error } = await supabase
      .from('available_slots')
      .select('*')
      .eq('date', formattedDate)
      .order('start_time');
    
    if (error) {
      showError("Erro ao carregar horários");
      return;
    }
    
    setAllBookingSlots(data || []);
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

  React.useEffect(() => {
    if (!isAdmin && bookingDate && isBookingModalOpen) {
      fetchBookingSlots(bookingDate);
    }
  }, [isAdmin, bookingDate, isBookingModalOpen, fetchBookingSlots]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('service-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('service-images')
        .getPublicUrl(filePath);

      setServiceFormData(prev => ({ ...prev, image_url: publicUrl }));
      showSuccess("Foto enviada com sucesso!");
    } catch (error: any) {
      showError("Erro ao enviar foto: " + error.message);
    } finally {
      setUploadingImage(false);
    }
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
        description: service.description || '',
        image_url: service.image_url || ''
      });
    } else {
      setServiceFormData({ id: '', name: '', price: '', duration_minutes: '', description: '', image_url: '' });
    }
    setIsServiceModalOpen(true);
  };

  const openDetailsModal = (service: any) => {
    setSelectedService(service);
    setIsDetailsModalOpen(true);
  };

  const openBookingModal = (service: any) => {
    setBookingService(service);
    setIsBookingModalOpen(true);
    setIsDetailsModalOpen(false);
    setSelectedSlot(null);
  };

  const handleCreateAppointment = async () => {
    if (!selectedSlot || !bookingService || !user?.id || !bookingDate) {
      showError("Selecione um horário para agendar");
      return;
    }

    setBookingLoading(true);
    try {
      const formattedDate = format(bookingDate, 'yyyy-MM-dd');
      const startTimeStr = selectedSlot.start_time;
      const startTime = parse(startTimeStr, 'HH:mm:ss', new Date());
      const endTimeStr = format(addMinutes(startTime, bookingService.duration_minutes), 'HH:mm:ss');

      // 1. Verificar conflito via RPC
      const { data: hasConflict, error: conflictError } = await supabase.rpc('check_appointment_conflict', {
        p_date: formattedDate,
        p_start: startTimeStr,
        p_end: endTimeStr
      });

      if (conflictError) throw conflictError;
      if (hasConflict) throw new Error("Horário indisponível. Alguém acabou de agendar este período.");

      // 2. Calcular slots para bloquear visualmente
      const slotsToBlock = Math.ceil(bookingService.duration_minutes / 30);
      const slotsToUpdate = [selectedSlot.id];
      
      for (let i = 1; i < slotsToBlock; i++) {
        const nextTime = format(addMinutes(startTime, i * 30), 'HH:mm:ss');
        const nextSlot = allBookingSlots.find(s => s.start_time === nextTime);
        if (nextSlot && nextSlot.is_available) {
          slotsToUpdate.push(nextSlot.id);
        } else if (nextSlot && !nextSlot.is_available) {
          throw new Error(`Este serviço precisa de ${bookingService.duration_minutes}min, mas há um conflito às ${nextTime.substring(0, 5)}.`);
        }
      }

      // 3. Criar o agendamento
      const { error: appError } = await supabase.from('appointments').insert([{
        user_id: user.id,
        service_id: bookingService.id,
        slot_id: selectedSlot.id,
        appointment_date: formattedDate,
        start_time: startTimeStr,
        end_time: endTimeStr,
        status: 'scheduled'
      }]);

      if (appError) throw appError;

      // 4. Marcar slots como indisponíveis
      await supabase.from('available_slots').update({ is_available: false }).in('id', slotsToUpdate);

      showSuccess("Agendamento realizado com sucesso!");
      setIsBookingModalOpen(false);
      fetchAppointments();
      setActiveTab('history');
    } catch (error: any) {
      showError(error.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const openCancelModal = (app: any) => {
    setAppointmentToCancel(app);
    setCancelReason("");
    setIsCancelModalOpen(true);
  };

  const handleCancelAppointment = async () => {
    if (!cancelReason.trim()) {
      showError("Por favor, informe o motivo do cancelamento.");
      return;
    }

    setCancelLoading(true);
    try {
      // 1. Atualizar status do agendamento
      const { error } = await supabase.from('appointments').update({
        status: 'cancelled',
        cancellation_reason: cancelReason
      }).eq('id', appointmentToCancel.id);

      if (error) throw error;

      // 2. Liberar os horários (slots) novamente
      const { data: slotsToFree, error: slotsError } = await supabase
        .from('available_slots')
        .select('id')
        .eq('date', appointmentToCancel.appointment_date)
        .gte('start_time', appointmentToCancel.start_time)
        .lt('start_time', appointmentToCancel.end_time);

      if (slotsError) throw slotsError;

      if (slotsToFree && slotsToFree.length > 0) {
        const ids = slotsToFree.map(s => s.id);
        await supabase.from('available_slots').update({ is_available: true }).in('id', ids);
      }

      showSuccess("Agendamento cancelado e horário liberado.");
      setIsCancelModalOpen(false);
      fetchAppointments();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setCancelLoading(false);
    }
  };

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
      await supabase.from('available_slots').delete().eq('date', formattedDate);
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter']">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="purple-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>

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
                    <div className="grid grid-cols-1 gap-3">
                      {services.map((service) => (
                        <Card key={service.id} className="p-3 border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] rounded-2xl flex items-center gap-3 hover:shadow-md transition-all group bg-white/80 backdrop-blur-sm">
                          <div className="w-12 h-12 bg-pink-50/50 rounded-xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                            {service.image_url ? (
                              <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl">💅</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-700 text-[11px] leading-tight">{service.name}</h4>
                            <div className="flex items-center gap-2 text-[8px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">
                              <span className="flex items-center gap-1"><Clock size={10} className="text-pink-200" /> {service.duration_minutes} min</span>
                              <span className="text-pink-400/80">R$ {service.price}</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Button 
                              onClick={() => openDetailsModal(service)}
                              variant="ghost" 
                              className="h-6 px-2 text-[8px] font-black text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-lg tracking-widest uppercase"
                            >
                              DETALHES
                            </Button>
                            <Button onClick={() => openBookingModal(service)} size="sm" className="bg-pink-500 hover:bg-pink-600 rounded-xl px-4 h-7 font-black text-[9px] tracking-wider shadow-sm active:scale-95 transition-all">AGENDAR</Button>
                          </div>
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
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-700 text-[11px]">{app.services?.name}</h4>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                {app.appointment_date ? format(new Date(app.appointment_date), "dd/MM/yyyy") : '-'} • {app.start_time?.substring(0, 5)} - {app.end_time?.substring(0, 5)}
                              </p>
                              {app.status === 'cancelled' && app.cancellation_reason && (
                                <p className="text-[8px] text-rose-400 font-medium mt-1 italic">Motivo: {app.cancellation_reason}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                app.status === 'completed' ? 'bg-green-50 text-green-500' : 
                                app.status === 'cancelled' ? 'bg-rose-50 text-rose-500' : 
                                'bg-blue-50 text-blue-500'
                              }`}>
                                {app.status === 'scheduled' ? 'Agendado' : app.status === 'cancelled' ? 'Cancelado' : 'Concluído'}
                              </span>
                              {app.status === 'scheduled' && (
                                <Button 
                                  onClick={() => openCancelModal(app)}
                                  variant="ghost" 
                                  className="h-6 px-2 text-[8px] font-black text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg tracking-widest uppercase"
                                >
                                  CANCELAR
                                </Button>
                              )}
                            </div>
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
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                  {app.services?.name} • {app.start_time?.substring(0, 5)} - {app.end_time?.substring(0, 5)}
                                </p>
                                {app.status === 'cancelled' && (
                                  <p className="text-[8px] text-rose-500 font-bold uppercase mt-0.5">CANCELADO: {app.cancellation_reason}</p>
                                )}
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
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden">
                              {service.image_url ? <img src={service.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={16} /></div>}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-700 text-[11px] leading-tight">{service.name}</h4>
                              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">R$ {service.price} • {service.duration_minutes} min</p>
                            </div>
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
                          day: "h-9 w-9 p-0 font-bold text-[10px] rounded-xl hover:bg-pink-50 transition-colors text-slate-900",
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
                          <Button onClick={saveDailySlots} disabled={savingSlots} size="sm" className="bg-purple-600 hover:bg-purple-700 rounded-xl gap-1.5 font-black text-[9px] h-7 tracking-wider shadow-md">
                            <Save size={12} /> {savingSlots ? 'SALVANDO...' : 'SALVAR'}
                          </Button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {timeSlots.map((time) => {
                            const isSelected = availableSlots.includes(time);
                            return (
                              <button key={time} onClick={() => toggleSlot(time)} className={`h-9 rounded-xl text-[10px] font-black transition-all border-2 ${isSelected ? 'bg-pink-500 border-pink-500 text-white shadow-md scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-pink-200'}`}>
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
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="sm:max-w-[350px] rounded-[2rem] border-none shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-sm font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle size={16} /> Cancelar Agendamento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              Poxa, que pena! Para cancelar seu horário de <strong>{appointmentToCancel?.services?.name}</strong>, por favor nos conte o motivo:
            </p>
            <div className="space-y-1">
              <Label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest ml-2">Motivo do Cancelamento</Label>
              <Textarea 
                required
                placeholder="Ex: Tive um imprevisto no trabalho..."
                className="bg-slate-50/50 border-slate-100 rounded-2xl px-4 text-[10px] min-h-[100px]" 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button 
                onClick={handleCancelAppointment}
                disabled={cancelLoading || !cancelReason.trim()} 
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] py-6 rounded-2xl shadow-md tracking-widest uppercase"
              >
                {cancelLoading ? 'CANCELANDO...' : 'CONFIRMAR CANCELAMENTO'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

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
              <Label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest ml-2">Foto do Resultado</Label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                  {serviceFormData.image_url ? (
                    <img src={serviceFormData.image_url} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={20} className="text-slate-300" />
                  )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="image-upload" className="cursor-pointer inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl text-[9px] font-black transition-colors">
                    {uploadingImage ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    {serviceFormData.image_url ? 'TROCAR FOTO' : 'ENVIAR FOTO'}
                  </Label>
                  <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                  <p className="text-[8px] text-slate-400 mt-1">JPG, PNG ou WEBP. Máx 5MB.</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[9px] font-bold text-slate-300 uppercase tracking-widest ml-2">Descrição Detalhada</Label>
              <Textarea className="bg-slate-50/50 border-slate-100 rounded-2xl px-4 text-[10px] min-h-[80px]" value={serviceFormData.description} onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })} />
            </div>
            <DialogFooter className="pt-2"><Button type="submit" disabled={editLoading || uploadingImage} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black text-[10px] py-6 rounded-2xl shadow-md tracking-widest uppercase">{editLoading ? 'SALVANDO...' : 'SALVAR SERVIÇO'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes do Serviço (Cliente) */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[380px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
          {selectedService && (
            <div className="flex flex-col">
              <div className="relative h-56 w-full bg-slate-100">
                {selectedService.image_url ? (
                  <img src={selectedService.image_url} alt={selectedService.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                    <ImageIcon size={40} strokeWidth={1} />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Sem foto disponível</p>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <Button onClick={() => setIsDetailsModalOpen(false)} variant="ghost" size="icon" className="bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full h-8 w-8">
                    <X size={18} />
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
              </div>
              
              <div className="px-6 pb-8 -mt-6 relative z-10">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 leading-tight">{selectedService.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Clock size={12} className="text-pink-300" /> {selectedService.duration_minutes} min
                      </span>
                      <span className="text-[10px] font-black text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">
                        R$ {selectedService.price}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Sobre o procedimento</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    {selectedService.description || "Nenhuma descrição detalhada disponível para este serviço no momento."}
                  </p>
                </div>

                <Button onClick={() => openBookingModal(selectedService)} className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-black text-[11px] py-6 rounded-2xl shadow-lg shadow-pink-200/50 mt-8 tracking-widest uppercase active:scale-95 transition-all">
                  AGENDAR AGORA
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Agendamento (Calendário Premium) */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] border-none shadow-2xl p-0 bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white relative">
            <div className="absolute top-4 right-4">
              <Button onClick={() => setIsBookingModalOpen(false)} variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/20 rounded-full h-8 w-8">
                <X size={18} />
              </Button>
            </div>
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl mb-1">
                <Sparkles size={20} className="text-white animate-pulse" />
              </div>
              <h2 className="text-lg font-black tracking-tight">Agende seu horário 💖</h2>
              <p className="text-[10px] font-medium text-white/80">Escolha o dia e o horário perfeito para suas unhas</p>
            </div>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
            {/* Calendário Estético */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 ml-1">
                <CalendarDays size={14} className="text-pink-500" />
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">1. Escolha o dia</Label>
              </div>
              <Card className="p-3 border-none shadow-sm rounded-[2rem] bg-slate-50/50">
                <Calendar
                  mode="single"
                  selected={bookingDate}
                  onSelect={setBookingDate}
                  locale={ptBR}
                  disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                  className="rounded-2xl border-none mx-auto"
                  classNames={{
                    day_selected: "bg-gradient-to-br from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 focus:from-purple-600 focus:to-pink-500 rounded-xl shadow-lg shadow-purple-200/50 scale-110 transition-all",
                    day_today: "bg-white text-pink-500 border-2 border-pink-100 rounded-xl font-black",
                    day: "h-9 w-9 p-0 font-bold text-[11px] rounded-xl hover:bg-pink-50 transition-all text-slate-900 relative",
                    head_cell: "text-slate-400 font-black text-[9px] uppercase tracking-widest w-9",
                    nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 text-pink-500",
                    day_disabled: "text-slate-200 opacity-50 cursor-not-allowed",
                  }}
                />
              </Card>
            </div>

            {/* Lista de Horários */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 ml-1">
                <Clock size={14} className="text-pink-500" />
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">2. Escolha o horário</Label>
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {allBookingSlots.length > 0 ? (
                  allBookingSlots.map((slot) => {
                    const isOccupied = !slot.is_available;
                    const isSelected = selectedSlot?.id === slot.id;
                    return (
                      <motion.button
                        key={slot.id}
                        whileTap={{ scale: 0.95 }}
                        disabled={isOccupied}
                        onClick={() => setSelectedSlot(slot)}
                        className={`h-10 rounded-xl text-[10px] font-black transition-all border-2 flex items-center justify-center gap-1 relative overflow-hidden ${
                          isOccupied 
                            ? 'bg-rose-50 border-rose-200 text-rose-500 cursor-not-allowed' 
                            : isSelected 
                              ? 'bg-gradient-to-br from-purple-600 to-pink-500 border-transparent text-white shadow-lg shadow-purple-200/50 scale-105' 
                              : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:border-emerald-300'
                        }`}
                      >
                        {isOccupied ? <Lock size={10} /> : isSelected ? <Check size={10} /> : null}
                        {slot.start_time.substring(0, 5)}
                        {isSelected && (
                          <motion.div 
                            layoutId="glow"
                            className="absolute inset-0 bg-white/20 blur-md"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}
                      </motion.button>
                    );
                  })
                ) : (
                  <div className="col-span-4 py-8 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                    <CalendarIcon size={24} className="mx-auto mb-2 text-slate-200" />
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Nenhum horário disponível</p>
                  </div>
                )}
              </div>
            </div>

            {/* Card de Confirmação */}
            <AnimatePresence>
              {selectedSlot && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  className="pt-2"
                >
                  <Card className="p-5 border-none bg-gradient-to-br from-slate-50 to-white shadow-xl rounded-[2rem] relative overflow-hidden border border-pink-50">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Heart size={60} className="fill-pink-500" />
                    </div>
                    <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Resumo do Agendamento</h4>
                          <p className="text-sm font-black text-slate-700">{bookingService?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full inline-block">R$ {bookingService?.price}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500">
                            <CalendarIcon size={14} />
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Data</p>
                            <p className="text-[10px] font-black text-slate-600">{bookingDate ? format(bookingDate, "dd/MM/yyyy") : '-'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-pink-50 rounded-lg flex items-center justify-center text-pink-500">
                            <Clock size={14} />
                          </div>
                          <div>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Horário</p>
                            <p className="text-[10px] font-black text-slate-600">{selectedSlot.start_time.substring(0, 5)}</p>
                          </div>
                        </div>
                      </div>

                      <Button 
                        onClick={handleCreateAppointment}
                        disabled={bookingLoading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-black text-[11px] py-6 rounded-2xl shadow-lg shadow-pink-200/50 mt-2 tracking-widest uppercase active:scale-95 transition-all"
                      >
                        {bookingLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin" />
                            <span>PROCESSANDO...</span>
                          </div>
                        ) : (
                          "CONFIRMAR AGENDAMENTO"
                        )}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>

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