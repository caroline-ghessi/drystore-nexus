-- Create enum for user permissions
CREATE TYPE public.user_permission AS ENUM ('admin', 'user');

-- Create job_positions table for company roles
CREATE TABLE public.job_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for user permissions
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  permission user_permission NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, permission)
);

-- Add job_position_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN job_position_id UUID REFERENCES public.job_positions(id);

-- Enable RLS on new tables
ALTER TABLE public.job_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user permissions
CREATE OR REPLACE FUNCTION public.has_user_permission(user_id UUID, permission_type user_permission)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_roles.user_id = has_user_permission.user_id 
    AND user_roles.permission = permission_type
  );
$$;

-- Create function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.has_user_permission(auth.uid(), 'admin'::user_permission);
$$;

-- RLS Policies for job_positions
CREATE POLICY "Everyone can view job positions" 
ON public.job_positions 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can insert job positions" 
ON public.job_positions 
FOR INSERT 
WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Only admins can update job positions" 
ON public.job_positions 
FOR UPDATE 
USING (public.is_current_user_admin());

CREATE POLICY "Only admins can delete job positions" 
ON public.job_positions 
FOR DELETE 
USING (public.is_current_user_admin());

-- RLS Policies for user_roles
CREATE POLICY "Only admins can view user roles" 
ON public.user_roles 
FOR SELECT 
USING (public.is_current_user_admin());

CREATE POLICY "Only admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.is_current_user_admin());

CREATE POLICY "Only admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.is_current_user_admin());

CREATE POLICY "Only admins can delete user roles" 
ON public.user_roles 
FOR DELETE 
USING (public.is_current_user_admin());

-- Update profiles policies to allow admins to edit other profiles
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (public.is_current_user_admin());

-- Create triggers for updated_at
CREATE TRIGGER update_job_positions_updated_at
  BEFORE UPDATE ON public.job_positions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default job positions
INSERT INTO public.job_positions (name, description, department) VALUES
('CEO', 'Chief Executive Officer', 'Executivo'),
('Gerente de Vendas', 'Responsável pela equipe de vendas', 'Vendas'),
('Vendedor', 'Especialista em vendas', 'Vendas'),
('Gerente de Marketing', 'Responsável pela estratégia de marketing', 'Marketing'),
('Analista de Marketing', 'Analista de campanhas e dados', 'Marketing'),
('Gerente de TI', 'Responsável pela infraestrutura tecnológica', 'Tecnologia'),
('Desenvolvedor', 'Desenvolvedor de sistemas', 'Tecnologia'),
('Gerente de RH', 'Responsável por recursos humanos', 'Recursos Humanos'),
('Analista de RH', 'Suporte em recursos humanos', 'Recursos Humanos'),
('Contador', 'Responsável pela contabilidade', 'Financeiro'),
('Auxiliar Administrativo', 'Suporte administrativo geral', 'Administrativo');