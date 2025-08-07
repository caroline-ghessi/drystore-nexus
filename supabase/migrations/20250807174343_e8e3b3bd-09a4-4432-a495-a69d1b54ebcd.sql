-- Corrigir permissão de administrador para o user_id correto
DELETE FROM public.user_roles WHERE user_id = 'da34993e-e5e5-486b-b772-3aa559d214c1';

INSERT INTO public.user_roles (user_id, permission) 
VALUES ('b7d6fb94-775d-495d-911a-8cce855dae75', 'admin');