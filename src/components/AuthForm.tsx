"use client";

import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showError, showSuccess } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

export const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="space-y-4 w-full">
      <form onSubmit={handleAuth} className="space-y-3">
        {isSignUp && (
          <>
            <div className="space-y-1">
              <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Nome Completo</Label>
              <Input
                required
                placeholder="Seu nome..."
                className="border-b border-t-0 border-x-0 rounded-none bg-transparent focus:ring-0 px-1 py-2 text-sm"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">CPF</Label>
                <Input
                  required
                  placeholder="000.000.000-00"
                  className="border-b border-t-0 border-x-0 rounded-none bg-transparent focus:ring-0 px-1 py-2 text-sm"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Nascimento</Label>
                <Input
                  required
                  type="date"
                  className="border-b border-t-0 border-x-0 rounded-none bg-transparent focus:ring-0 px-1 py-2 text-sm"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-1">
          <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Email</Label>
          <Input
            required
            type="email"
            placeholder="Seu email..."
            className="border-b border-t-0 border-x-0 rounded-none bg-transparent focus:ring-0 px-1 py-2 text-sm"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Senha</Label>
          <Input
            required
            type="password"
            placeholder="Sua senha..."
            className="border-b border-t-0 border-x-0 rounded-none bg-transparent focus:ring-0 px-1 py-2 text-sm"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-[11px] py-5 rounded-xl transition-all active:scale-95 shadow-md mt-2"
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
            (Esqueceu sua senha, gata?)
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