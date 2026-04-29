import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email({ message: 'সঠিক ইমেইল দিন' }),
});

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      schema.parse({ email });
      setLoading(true);
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || '');
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
          <CardTitle className="text-2xl">পাসওয়ার্ড ভুলে গেছেন?</CardTitle>
          <CardDescription>
            {sent
              ? 'আপনার ইমেইল চেক করুন এবং লিংকে ক্লিক করুন'
              : 'রিসেট লিংক পেতে আপনার ইমেইল দিন'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">ইমেইল</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="আপনার ইমেইল"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'পাঠানো হচ্ছে...' : 'রিসেট লিংক পাঠান'}
              </Button>
            </form>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              যদি ইমেইলটি আমাদের সিস্টেমে থাকে, তবে রিসেট লিংক পাঠানো হয়েছে।
            </div>
          )}
          <Link to="/auth" className="flex items-center justify-center gap-2 mt-4 text-sm text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> লগইন পেজে ফিরে যান
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
