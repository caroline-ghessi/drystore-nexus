-- Fix infinite recursion in RLS policies by creating security definer functions

-- 1. Create security definer functions to break recursion
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view public documents or documents they have permissi" ON public.documents;
DROP POLICY IF EXISTS "Users can update documents they created or have write permissio" ON public.documents;
DROP POLICY IF EXISTS "Users can view permissions for documents they can access" ON public.document_permissions;

-- 3. Create new simplified policies using security definer functions

-- Documents table policies
CREATE POLICY "Users can view accessible documents" 
ON public.documents 
FOR SELECT 
USING (public.can_access_document(id));

CREATE POLICY "Users can update documents with write permission" 
ON public.documents 
FOR UPDATE 
USING (public.has_document_permission(id, 'write'));

-- Document permissions table policies  
CREATE POLICY "Users can view permissions for accessible documents" 
ON public.document_permissions 
FOR SELECT 
USING (public.can_access_document(document_id));