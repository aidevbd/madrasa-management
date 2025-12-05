-- Add batch_id column to expenses table for grouping market purchases
ALTER TABLE public.expenses 
ADD COLUMN batch_id uuid DEFAULT NULL,
ADD COLUMN batch_name text DEFAULT NULL;

-- Create index for efficient batch queries
CREATE INDEX idx_expenses_batch_id ON public.expenses(batch_id) WHERE batch_id IS NOT NULL;