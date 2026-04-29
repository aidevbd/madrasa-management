import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

const schema = z.object({
  password: z.string().min(6, { message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' }),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'পাসওয়ার্ড মিলছে না',
  path: ['confirmPassword'],
});

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase auto-handles the recovery token from URL hash via onAuthStateChange
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true);
      }
    });
    // Also check existing session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      schema.parse(form);
      setLoading(true);
      await updatePassword(form.password);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const fe: Record<string, string> = {};
        err.errors.forEach((e) => { if (e.path) fe[e.path[0]] = e.message; });
        setErrors(fe);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">নতুন পাসওয়ার্ড সেট করুন</CardTitle>
          <CardDescription>আপনার নতুন পাসওয়ার্ড লিখুন</CardDescription>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <p className="text-center text-sm text-muted-foreground">
              রিসেট লিংক যাচাই করা হচ্ছে... ইমেইল থেকে আসা লিংকে ক্লিক করেছেন তো?
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">নতুন পাসওয়ার্ড</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">পাসওয়ার্ড নিশ্চিত করুন</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="আবার লিখুন"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'সংরক্ষণ হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
