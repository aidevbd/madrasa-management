-- Create fee structures table
CREATE TABLE public.fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'মাসিক',
  department TEXT,
  class_name TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create fee payments table
CREATE TABLE public.fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  fee_structure_id UUID NOT NULL REFERENCES public.fee_structures(id) ON DELETE RESTRICT,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'নগদ',
  month TEXT,
  year INTEGER,
  receipt_number TEXT,
  remarks TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, fee_structure_id, month, year)
);

-- Enable RLS
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fee_structures
CREATE POLICY "Admins can manage fee structures"
ON public.fee_structures
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view fee structures"
ON public.fee_structures
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL AND is_active = true);

-- RLS Policies for fee_payments
CREATE POLICY "Admins and accountants can manage fee payments"
ON public.fee_payments
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'accountant'::app_role));

CREATE POLICY "Students can view own fee payments"
ON public.fee_payments
FOR SELECT
TO authenticated
USING (
  student_id IN (
    SELECT id FROM public.students WHERE phone = (SELECT phone FROM public.profiles WHERE id = auth.uid())
  )
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
);

-- Create triggers for updated_at
CREATE TRIGGER update_fee_structures_updated_at
  BEFORE UPDATE ON public.fee_structures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fee_payments_updated_at
  BEFORE UPDATE ON public.fee_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create audit triggers
CREATE TRIGGER audit_fee_structures
  AFTER INSERT OR UPDATE OR DELETE ON public.fee_structures
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function();

CREATE TRIGGER audit_fee_payments
  AFTER INSERT OR UPDATE OR DELETE ON public.fee_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function();

-- Create index for better performance
CREATE INDEX idx_fee_payments_student_id ON public.fee_payments(student_id);
CREATE INDEX idx_fee_payments_date ON public.fee_payments(payment_date);
CREATE INDEX idx_fee_structures_active ON public.fee_structures(is_active) WHERE is_active = true;