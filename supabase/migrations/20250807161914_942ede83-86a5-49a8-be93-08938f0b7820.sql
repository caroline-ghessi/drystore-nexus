-- Fix security warnings for functions by setting search_path

-- Update the security definer functions to set search_path
CREATE OR REPLACE FUNCTION public.can_access_document(document_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if document is public
  IF EXISTS (
    SELECT 1 FROM public.documents 
    WHERE id = document_id AND is_public = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user is the owner
  IF EXISTS (
    SELECT 1 FROM public.documents 
    WHERE id = document_id AND created_by = auth.uid()
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user has explicit permissions
  IF EXISTS (
    SELECT 1 FROM public.document_permissions 
    WHERE document_id = can_access_document.document_id AND user_id = auth.uid()
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = '';

CREATE OR REPLACE FUNCTION public.has_document_permission(document_id UUID, permission_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is the owner (owners have all permissions)
  IF EXISTS (
    SELECT 1 FROM public.documents 
    WHERE id = document_id AND created_by = auth.uid()
  ) THEN
    RETURN true;
  END IF;
  
  -- Check if user has the specific permission
  IF EXISTS (
    SELECT 1 FROM public.document_permissions 
    WHERE document_id = has_document_permission.document_id 
    AND user_id = auth.uid() 
    AND permission = ANY(ARRAY[permission_type, 'admin'])
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = '';