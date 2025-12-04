import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Home, Users, BedDouble, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudents } from "@/hooks/useStudents";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HostelRoom {
  id: string;
  room_number: string;
  capacity: number;
  current_occupancy: number;
  room_type: string;
  monthly_fee: number;
  description: string | null;
  is_active: boolean;
}

interface HostelAllocation {
  id: string;
  student_id: string;
  room_id: string;
  allocation_date: string;
  end_date: string | null;
  monthly_fee: number;
  status: string;
  notes: string | null;
  students?: { name: string; student_id: string };
  hostel_rooms?: { room_number: string };
}

export default function Hostel() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<HostelRoom | null>(null);
  const [editingAllocation, setEditingAllocation] = useState<HostelAllocation | null>(null);
  const { data: students } = useStudents();

  // Room form state
  const [roomForm, setRoomForm] = useState({
    room_number: '',
    capacity: 4,
    room_type: 'সাধারণ',
    monthly_fee: 0,
    description: ''
  });

  // Allocation form state
  const [allocationForm, setAllocationForm] = useState({
    student_id: '',
    room_id: '',
    monthly_fee: 0,
    notes: ''
  });

  // Fetch rooms
  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['hostel-rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hostel_rooms')
        .select('*')
        .eq('is_active', true)
        .order('room_number');
      if (error) throw error;
      return data as HostelRoom[];
    }
  });

  // Fetch allocations
  const { data: allocations, isLoading: allocationsLoading } = useQuery({
    queryKey: ['hostel-allocations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hostel_allocations')
        .select('*, students(name, student_id), hostel_rooms(room_number)')
        .eq('status', 'সক্রিয়')
        .order('allocation_date', { ascending: false });
      if (error) throw error;
      return data as HostelAllocation[];
    }
  });

  // Room mutations
  const createRoom = useMutation({
    mutationFn: async (data: typeof roomForm) => {
      const { error } = await supabase.from('hostel_rooms').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel-rooms'] });
      toast.success('রুম সফলভাবে যোগ করা হয়েছে');
      setRoomDialogOpen(false);
      resetRoomForm();
    },
    onError: () => toast.error('রুম যোগ করতে সমস্যা হয়েছে')
  });

  const updateRoom = useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & typeof roomForm) => {
      const { error } = await supabase.from('hostel_rooms').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel-rooms'] });
      toast.success('রুম আপডেট হয়েছে');
      setRoomDialogOpen(false);
      setEditingRoom(null);
      resetRoomForm();
    },
    onError: () => toast.error('রুম আপডেট করতে সমস্যা হয়েছে')
  });

  const deleteRoom = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('hostel_rooms').update({ is_active: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel-rooms'] });
      toast.success('রুম মুছে ফেলা হয়েছে');
    },
    onError: () => toast.error('রুম মুছতে সমস্যা হয়েছে')
  });

  // Allocation mutations
  const createAllocation = useMutation({
    mutationFn: async (data: typeof allocationForm) => {
      const { error } = await supabase.from('hostel_allocations').insert([data]);
      if (error) throw error;
      // Update room occupancy
      const room = rooms?.find(r => r.id === data.room_id);
      if (room) {
        await supabase.from('hostel_rooms').update({ 
          current_occupancy: room.current_occupancy + 1 
        }).eq('id', data.room_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['hostel-rooms'] });
      toast.success('ছাত্র রুমে বরাদ্দ হয়েছে');
      setAllocationDialogOpen(false);
      resetAllocationForm();
    },
    onError: () => toast.error('বরাদ্দ করতে সমস্যা হয়েছে')
  });

  const deleteAllocation = useMutation({
    mutationFn: async (allocation: HostelAllocation) => {
      const { error } = await supabase.from('hostel_allocations')
        .update({ status: 'বাতিল', end_date: new Date().toISOString().split('T')[0] })
        .eq('id', allocation.id);
      if (error) throw error;
      // Update room occupancy
      const room = rooms?.find(r => r.id === allocation.room_id);
      if (room && room.current_occupancy > 0) {
        await supabase.from('hostel_rooms').update({ 
          current_occupancy: room.current_occupancy - 1 
        }).eq('id', allocation.room_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostel-allocations'] });
      queryClient.invalidateQueries({ queryKey: ['hostel-rooms'] });
      toast.success('বরাদ্দ বাতিল হয়েছে');
    },
    onError: () => toast.error('বরাদ্দ বাতিল করতে সমস্যা হয়েছে')
  });

  const resetRoomForm = () => {
    setRoomForm({ room_number: '', capacity: 4, room_type: 'সাধারণ', monthly_fee: 0, description: '' });
  };

  const resetAllocationForm = () => {
    setAllocationForm({ student_id: '', room_id: '', monthly_fee: 0, notes: '' });
  };

  const handleEditRoom = (room: HostelRoom) => {
    setEditingRoom(room);
    setRoomForm({
      room_number: room.room_number,
      capacity: room.capacity,
      room_type: room.room_type,
      monthly_fee: room.monthly_fee,
      description: room.description || ''
    });
    setRoomDialogOpen(true);
  };

  const handleRoomSubmit = () => {
    if (editingRoom) {
      updateRoom.mutate({ id: editingRoom.id, ...roomForm });
    } else {
      createRoom.mutate(roomForm);
    }
  };

  const stats = {
    totalRooms: rooms?.length || 0,
    totalBeds: rooms?.reduce((sum, r) => sum + r.capacity, 0) || 0,
    occupied: rooms?.reduce((sum, r) => sum + r.current_occupancy, 0) || 0,
    available: (rooms?.reduce((sum, r) => sum + r.capacity, 0) || 0) - (rooms?.reduce((sum, r) => sum + r.current_occupancy, 0) || 0)
  };

  const availableStudents = students?.filter(s => 
    !allocations?.some(a => a.student_id === s.id && a.status === 'সক্রিয়')
  ) || [];

  const availableRooms = rooms?.filter(r => r.current_occupancy < r.capacity) || [];

  if (roomsLoading || allocationsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">হোস্টেল ব্যবস্থাপনা</h1>
          <p className="text-muted-foreground mt-1">রুম বরাদ্দ ও মাসিক ফি</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>মোট রুম</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Home className="w-6 h-6 text-primary" />
              {stats.totalRooms}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>মোট সিট</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <BedDouble className="w-6 h-6 text-blue-500" />
              {stats.totalBeds}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ভর্তি আছে</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Users className="w-6 h-6 text-success" />
              {stats.occupied}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>খালি সিট</CardDescription>
            <CardTitle className="text-3xl text-orange-500">{stats.available}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="rooms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rooms">রুম সমূহ</TabsTrigger>
          <TabsTrigger value="allocations">বরাদ্দ তালিকা</TabsTrigger>
        </TabsList>

        <TabsContent value="rooms">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>রুম তালিকা</CardTitle>
              <Dialog open={roomDialogOpen} onOpenChange={(open) => {
                setRoomDialogOpen(open);
                if (!open) { setEditingRoom(null); resetRoomForm(); }
              }}>
                <DialogTrigger asChild>
                  <Button><Plus className="w-4 h-4 mr-2" />নতুন রুম</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingRoom ? 'রুম সম্পাদনা' : 'নতুন রুম যোগ করুন'}</DialogTitle>
                    <DialogDescription>রুমের তথ্য দিন</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>রুম নম্বর</Label>
                      <Input value={roomForm.room_number} onChange={e => setRoomForm({...roomForm, room_number: e.target.value})} placeholder="যেমন: A-101" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>ধারণক্ষমতা</Label>
                        <Input type="number" value={roomForm.capacity} onChange={e => setRoomForm({...roomForm, capacity: parseInt(e.target.value) || 0})} />
                      </div>
                      <div>
                        <Label>মাসিক ফি (৳)</Label>
                        <Input type="number" value={roomForm.monthly_fee} onChange={e => setRoomForm({...roomForm, monthly_fee: parseInt(e.target.value) || 0})} />
                      </div>
                    </div>
                    <div>
                      <Label>রুমের ধরন</Label>
                      <Select value={roomForm.room_type} onValueChange={v => setRoomForm({...roomForm, room_type: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="সাধারণ">সাধারণ</SelectItem>
                          <SelectItem value="এসি">এসি</SelectItem>
                          <SelectItem value="সিঙ্গেল">সিঙ্গেল</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>বিবরণ</Label>
                      <Textarea value={roomForm.description} onChange={e => setRoomForm({...roomForm, description: e.target.value})} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleRoomSubmit}>{editingRoom ? 'আপডেট করুন' : 'যোগ করুন'}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>রুম নম্বর</TableHead>
                    <TableHead>ধরন</TableHead>
                    <TableHead>ধারণক্ষমতা</TableHead>
                    <TableHead>বর্তমান</TableHead>
                    <TableHead>মাসিক ফি</TableHead>
                    <TableHead className="text-right">কার্যক্রম</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms?.map(room => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.room_number}</TableCell>
                      <TableCell><Badge variant="outline">{room.room_type}</Badge></TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>
                        <Badge className={room.current_occupancy >= room.capacity ? 'bg-destructive' : 'bg-success'}>
                          {room.current_occupancy}/{room.capacity}
                        </Badge>
                      </TableCell>
                      <TableCell>৳{room.monthly_fee.toLocaleString('bn-BD')}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditRoom(room)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>রুম মুছে ফেলুন?</AlertDialogTitle>
                              <AlertDialogDescription>এই রুমটি মুছে ফেলা হবে।</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>বাতিল</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteRoom.mutate(room.id)}>মুছুন</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>বরাদ্দ তালিকা</CardTitle>
              <Dialog open={allocationDialogOpen} onOpenChange={setAllocationDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="w-4 h-4 mr-2" />নতুন বরাদ্দ</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>ছাত্র রুমে বরাদ্দ করুন</DialogTitle>
                    <DialogDescription>ছাত্র ও রুম নির্বাচন করুন</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>ছাত্র নির্বাচন করুন</Label>
                      <Select value={allocationForm.student_id} onValueChange={v => setAllocationForm({...allocationForm, student_id: v})}>
                        <SelectTrigger><SelectValue placeholder="ছাত্র নির্বাচন করুন" /></SelectTrigger>
                        <SelectContent>
                          {availableStudents.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name} ({s.student_id})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>রুম নির্বাচন করুন</Label>
                      <Select value={allocationForm.room_id} onValueChange={v => {
                        const room = rooms?.find(r => r.id === v);
                        setAllocationForm({...allocationForm, room_id: v, monthly_fee: room?.monthly_fee || 0});
                      }}>
                        <SelectTrigger><SelectValue placeholder="রুম নির্বাচন করুন" /></SelectTrigger>
                        <SelectContent>
                          {availableRooms.map(r => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.room_number} ({r.current_occupancy}/{r.capacity}) - ৳{r.monthly_fee}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>মাসিক ফি (৳)</Label>
                      <Input type="number" value={allocationForm.monthly_fee} onChange={e => setAllocationForm({...allocationForm, monthly_fee: parseInt(e.target.value) || 0})} />
                    </div>
                    <div>
                      <Label>নোট</Label>
                      <Textarea value={allocationForm.notes} onChange={e => setAllocationForm({...allocationForm, notes: e.target.value})} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => createAllocation.mutate(allocationForm)} disabled={!allocationForm.student_id || !allocationForm.room_id}>
                      বরাদ্দ করুন
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ছাত্র আইডি</TableHead>
                    <TableHead>নাম</TableHead>
                    <TableHead>রুম</TableHead>
                    <TableHead>মাসিক ফি</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead className="text-right">কার্যক্রম</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocations?.map(allocation => (
                    <TableRow key={allocation.id}>
                      <TableCell className="font-mono">{allocation.students?.student_id}</TableCell>
                      <TableCell className="font-medium">{allocation.students?.name}</TableCell>
                      <TableCell><Badge>{allocation.hostel_rooms?.room_number}</Badge></TableCell>
                      <TableCell>৳{allocation.monthly_fee.toLocaleString('bn-BD')}</TableCell>
                      <TableCell>{new Date(allocation.allocation_date).toLocaleDateString('bn-BD')}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>বরাদ্দ বাতিল করুন?</AlertDialogTitle>
                              <AlertDialogDescription>এই বরাদ্দটি বাতিল করা হবে।</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>না</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteAllocation.mutate(allocation)}>হ্যাঁ</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
