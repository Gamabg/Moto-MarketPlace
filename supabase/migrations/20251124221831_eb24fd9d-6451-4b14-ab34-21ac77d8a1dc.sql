-- Create profiles table for admin users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create brands table
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on brands
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Brands policies - anyone can view, only authenticated users can modify
CREATE POLICY "Anyone can view brands"
  ON public.brands FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert brands"
  ON public.brands FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update brands"
  ON public.brands FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete brands"
  ON public.brands FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create motorcycles table
CREATE TABLE public.motorcycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  displacement INTEGER NOT NULL, -- cilindrada em cc
  price DECIMAL(10, 2) NOT NULL,
  color TEXT,
  mileage INTEGER DEFAULT 0, -- quilometragem
  description TEXT,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on motorcycles
ALTER TABLE public.motorcycles ENABLE ROW LEVEL SECURITY;

-- Motorcycles policies - anyone can view, only authenticated users can modify
CREATE POLICY "Anyone can view motorcycles"
  ON public.motorcycles FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert motorcycles"
  ON public.motorcycles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update motorcycles"
  ON public.motorcycles FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete motorcycles"
  ON public.motorcycles FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create audit log table for tracking all changes
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Audit log policies
CREATE POLICY "Authenticated users can view audit logs"
  ON public.audit_log FOR SELECT
  USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_motorcycles_updated_at
  BEFORE UPDATE ON public.motorcycles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile automatically
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to log changes to motorcycles
CREATE OR REPLACE FUNCTION public.log_motorcycle_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), 'INSERT', 'motorcycles', NEW.id, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), 'UPDATE', 'motorcycles', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), 'DELETE', 'motorcycles', OLD.id, to_jsonb(OLD));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log motorcycle changes
CREATE TRIGGER log_motorcycle_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.motorcycles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_motorcycle_changes();

-- Function to log changes to brands
CREATE OR REPLACE FUNCTION public.log_brand_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), 'INSERT', 'brands', NEW.id, to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), 'UPDATE', 'brands', NEW.id, to_jsonb(OLD), to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), 'DELETE', 'brands', OLD.id, to_jsonb(OLD));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log brand changes
CREATE TRIGGER log_brand_changes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.brands
  FOR EACH ROW
  EXECUTE FUNCTION public.log_brand_changes();

-- Insert some initial brands
INSERT INTO public.brands (name) VALUES
  ('Honda'),
  ('Yamaha'),
  ('Kawasaki'),
  ('Suzuki'),
  ('Harley-Davidson'),
  ('BMW'),
  ('Ducati'),
  ('Triumph');