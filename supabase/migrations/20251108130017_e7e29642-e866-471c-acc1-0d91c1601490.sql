-- Create salary_payments table
CREATE TABLE public.salary_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id TEXT NOT NULL UNIQUE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'নগদ',
  status TEXT NOT NULL DEFAULT 'পরিশোধিত',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(staff_id, month, year)
);

-- Enable RLS
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage salary payments"
ON public.salary_payments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view own salary payments"
ON public.salary_payments
FOR SELECT
USING (
  staff_id IN (
    SELECT id FROM public.staff 
    WHERE phone IN (SELECT phone FROM public.profiles WHERE id = auth.uid())
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Create trigger for updated_at
CREATE TRIGGER update_salary_payments_updated_at
BEFORE UPDATE ON public.salary_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create audit trigger
CREATE TRIGGER audit_salary_payments
AFTER INSERT OR UPDATE OR DELETE ON public.salary_payments
FOR EACH ROW
EXECUTE FUNCTION public.audit_trigger_function();

-- Create index for better query performance
CREATE INDEX idx_salary_payments_staff_id ON public.salary_payments(staff_id);
CREATE INDEX idx_salary_payments_date ON public.salary_payments(payment_date);
CREATE INDEX idx_salary_payments_month_year ON public.salary_payments(month, year);