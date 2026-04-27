"use client";

import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showError, showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    cpf: '',
    birthDate: '',
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              cpf: formData.cpf,
              birth_date: formData.birthDate,
            },
          },
        });
        if (error) throw error;
        showSuccess("Conta criada! Verifique seu email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        navigate('/');
      }
    } catch (error: any) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "bg-slate-50/50 border-slate-100 rounded-2xl px-4 h-11 text-xs focus:bg-white focus:border-pink-200 focus:ring-pink-100 transition-all w-full";

  return (
    <div className="space-y-4 w-full">
      <form onSubmit={handleAuth} className="space-y-3">
        {isSignUp && (
          <>
            <div className="space-y-1">
              <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-2">Nome Completo</Label>
              <Input
                required
                placeholder="Seu nome..."
                className={inputClasses}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-2">CPF</Label>
                <Input
                  required
                  placeholder="000.000.000-00"
                  className={inputClasses}
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-2">Nascimento</Label>
                <Input
                  required
                  type="date"
                  className={inputClasses}
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-1">
          <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-2">Email</Label>
          <Input
            required
            type="email"
            placeholder="Seu email..."
            className={inputClasses}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-2">Senha</Label>
          <div className="relative">
            <Input
              required
              type={showPassword ? "text" : "password"}
              placeholder="Sua senha..."
              className={inputClasses}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-[11px] py-6 rounded-2xl transition-all active:scale-95 shadow-md mt-2"
        >
          {loading ? 'Carregando...' : isSignUp ? 'CADASTRAR' : 'ENTRAR'}
        </Button>
      </form>

      <div className="text-center pt-2 flex flex-col items-center gap-2">
        {!isSignUp && (
          <button 
            type="button"
            className="text-[10px] text-pink-600 font-medium hover:underline"
            onClick={() => showSuccess("Enviamos um link para seu email!")}
          >
            Esqueceu sua senha, gata?
          </button>
        )}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-[11px] text-gray-500 font-semibold hover:text-pink-600 transition-colors"
        >
          {isSignUp ? 'Já tenho conta' : 'Criar conta'}
        </button>
      </div>
    </div>
  );
};