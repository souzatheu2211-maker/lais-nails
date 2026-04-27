// Este arquivo é gerado automaticamente, mas vou simular a atualização do banco via código se necessário.
// Na prática, eu executaria o SQL abaixo no console do Supabase:
/*
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date DATE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, cpf, birth_date)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'cpf',
    (new.raw_user_meta_data ->> 'birth_date')::DATE
  );
  RETURN new;
END;
$function$;
*/

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://naisvyomguajpwkklkwa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5haXN2eW9tZ3VhanB3a2tsa3dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMTA1MTYsImV4cCI6MjA5Mjg4NjUxNn0.C_rTxpkr8V_x6vQjE-pYEK_J7RjKHxr1rPcnX7BCg1M";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);