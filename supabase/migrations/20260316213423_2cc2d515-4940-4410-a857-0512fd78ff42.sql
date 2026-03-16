
CREATE OR REPLACE FUNCTION public.admin_set_role(_target_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can change roles';
  END IF;
  
  -- Remove existing role if any
  DELETE FROM public.user_roles WHERE user_id = _target_user_id AND role = _role;
  
  -- Insert the new role
  INSERT INTO public.user_roles (user_id, role) VALUES (_target_user_id, _role);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_remove_role(_target_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can change roles';
  END IF;
  
  DELETE FROM public.user_roles WHERE user_id = _target_user_id AND role = _role;
END;
$$;

-- Allow admins to read all user roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
