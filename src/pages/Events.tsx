import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Calendar as CalendarIcon, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay, parseISO } from "date-fns";
import { bn } from "date-fns/locale";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  is_holiday: boolean;
  is_active: boolean;
}

const EVENT_TYPES = ["সাধারণ", "পরীক্ষা", "ছুটি", "অনুষ্ঠান", "সভা", "অন্যান্য"];

export default function Events() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "সাধারণ",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
    start_time: "",
    end_time: "",
    location: "",
    is_holiday: false,
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data as Event[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("events").insert({
        title: data.title,
        description: data.description || null,
        event_type: data.event_type,
        start_date: data.start_date,
        end_date: data.end_date || null,
        start_time: data.start_time || null,
        end_time: data.end_time || null,
        location: data.location || null,
        is_holiday: data.is_holiday,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("ইভেন্ট যোগ করা হয়েছে");
      resetForm();
    },
    onError: () => toast.error("ইভেন্ট যোগ করতে সমস্যা হয়েছে"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("events")
        .update({
          title: data.title,
          description: data.description || null,
          event_type: data.event_type,
          start_date: data.start_date,
          end_date: data.end_date || null,
          start_time: data.start_time || null,
          end_time: data.end_time || null,
          location: data.location || null,
          is_holiday: data.is_holiday,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("ইভেন্ট আপডেট হয়েছে");
      resetForm();
    },
    onError: () => toast.error("আপডেট করতে সমস্যা হয়েছে"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("ইভেন্ট মুছে ফেলা হয়েছে");
      setDeleteId(null);
    },
    onError: () => toast.error("মুছতে সমস্যা হয়েছে"),
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      event_type: "সাধারণ",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: "",
      start_time: "",
      end_time: "",
      location: "",
      is_holiday: false,
    });
    setEditingEvent(null);
    setIsFormOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.start_date) {
      toast.error("শিরোনাম ও তারিখ আবশ্যক");
      return;
    }

    if (editingEvent) {
      updateMutation.mutate({ id: editingEvent.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      event_type: event.event_type,
      start_date: event.start_date,
      end_date: event.end_date || "",
      start_time: event.start_time || "",
      end_time: event.end_time || "",
      location: event.location || "",
      is_holiday: event.is_holiday,
    });
    setIsFormOpen(true);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "পরীক্ষা": return "destructive";
      case "ছুটি": return "secondary";
      case "অনুষ্ঠান": return "default";
      case "সভা": return "outline";
      default: return "default";
    }
  };

  const eventsOnSelectedDate = events.filter(
    (event) => selectedDate && isSameDay(parseISO(event.start_date), selectedDate)
  );

  const eventDates = events.map((e) => parseISO(e.start_date));

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">ইভেন্ট ক্যালেন্ডার</h1>
          <p className="text-muted-foreground mt-1 text-sm">অনুষ্ঠান, পরীক্ষা ও ছুটি পরিচালনা করুন</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsFormOpen(true); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              নতুন ইভেন্ট
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "ইভেন্ট সম্পাদনা" : "নতুন ইভেন্ট"}</DialogTitle>
              <DialogDescription>ইভেন্টের তথ্য দিন</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>শিরোনাম *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="ইভেন্টের শিরোনাম"
                />
              </div>

              <div className="space-y-2">
                <Label>ধরন</Label>
                <Select value={formData.event_type} onValueChange={(v) => setFormData({ ...formData, event_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>শুরুর তারিখ *</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>শেষ তারিখ</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>শুরুর সময়</Label>
                  <Input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>শেষ সময়</Label>
                  <Input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>স্থান</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="স্থান"
                />
              </div>

              <div className="space-y-2">
                <Label>বিবরণ</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="বিবরণ লিখুন"
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_holiday}
                  onCheckedChange={(v) => setFormData({ ...formData, is_holiday: v })}
                />
                <Label>ছুটির দিন হিসেবে চিহ্নিত করুন</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingEvent ? "আপডেট করুন" : "যোগ করুন"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>বাতিল</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              ক্যালেন্ডার
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasEvent: eventDates,
              }}
              modifiersStyles={{
                hasEvent: { fontWeight: "bold", backgroundColor: "hsl(var(--primary) / 0.1)" },
              }}
            />
          </CardContent>
        </Card>

        {/* Events on Selected Date */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: bn }) : "তারিখ নির্বাচন করুন"} - ইভেন্ট
            </CardTitle>
          </CardHeader>
          <CardContent>
            {eventsOnSelectedDate.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">এই তারিখে কোনো ইভেন্ট নেই</p>
            ) : (
              <div className="space-y-3">
                {eventsOnSelectedDate.map((event) => (
                  <div key={event.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          <Badge variant={getEventTypeColor(event.event_type)}>{event.event_type}</Badge>
                          {event.is_holiday && <Badge variant="secondary">ছুটি</Badge>}
                        </div>
                        {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          {event.start_time && <span>সময়: {event.start_time}{event.end_time && ` - ${event.end_time}`}</span>}
                          {event.location && <span>স্থান: {event.location}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(event.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>আসন্ন ইভেন্ট</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">লোড হচ্ছে...</p>
          ) : events.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">কোনো ইভেন্ট নেই</p>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 10).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(event.start_date), "MMM", { locale: bn })}
                      </span>
                      <span className="font-bold text-primary">
                        {format(parseISO(event.start_date), "dd")}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={getEventTypeColor(event.event_type)} className="text-xs">{event.event_type}</Badge>
                        {event.location && <span className="text-xs text-muted-foreground">{event.location}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(event.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
            <AlertDialogDescription>এই ইভেন্ট স্থায়ীভাবে মুছে যাবে।</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>মুছুন</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
