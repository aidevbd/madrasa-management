export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          id: string
          remarks: string | null
          status: string
          updated_at: string | null
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date: string
          id?: string
          remarks?: string | null
          status: string
          updated_at?: string | null
          user_id: string
          user_type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          remarks?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          timestamp: string
          user_id: string
        }
        Insert: {
          action: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          timestamp?: string
          user_id: string
        }
        Update: {
          action?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"]
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["document_category"]
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          event_type: string
          id: string
          is_active: boolean | null
          is_holiday: boolean | null
          location: string | null
          start_date: string
          start_time: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type?: string
          id?: string
          is_active?: boolean | null
          is_holiday?: boolean | null
          location?: string | null
          start_date: string
          start_time?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_type?: string
          id?: string
          is_active?: boolean | null
          is_holiday?: boolean | null
          location?: string | null
          start_date?: string
          start_time?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      exam_results: {
        Row: {
          created_at: string
          created_by: string | null
          exam_id: string
          grade: string | null
          id: string
          is_absent: boolean | null
          marks_obtained: number
          remarks: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          exam_id: string
          grade?: string | null
          id?: string
          is_absent?: boolean | null
          marks_obtained: number
          remarks?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          exam_id?: string
          grade?: string | null
          id?: string
          is_absent?: boolean | null
          marks_obtained?: number
          remarks?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          academic_year: number
          class_name: string
          created_at: string
          created_by: string | null
          department: string
          end_time: string | null
          exam_date: string
          exam_name: string
          exam_type: string
          id: string
          is_active: boolean | null
          pass_marks: number
          start_time: string | null
          subject: string
          total_marks: number
          updated_at: string
        }
        Insert: {
          academic_year?: number
          class_name: string
          created_at?: string
          created_by?: string | null
          department: string
          end_time?: string | null
          exam_date: string
          exam_name: string
          exam_type?: string
          id?: string
          is_active?: boolean | null
          pass_marks?: number
          start_time?: string | null
          subject: string
          total_marks?: number
          updated_at?: string
        }
        Update: {
          academic_year?: number
          class_name?: string
          created_at?: string
          created_by?: string | null
          department?: string
          end_time?: string | null
          exam_date?: string
          exam_name?: string
          exam_type?: string
          id?: string
          is_active?: boolean | null
          pass_marks?: number
          start_time?: string | null
          subject?: string
          total_marks?: number
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          batch_id: string | null
          batch_name: string | null
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          created_by: string | null
          description: string | null
          expense_date: string
          expense_id: string
          id: string
          receipt_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          batch_id?: string | null
          batch_name?: string | null
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date?: string
          expense_id: string
          id?: string
          receipt_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          batch_id?: string | null
          batch_name?: string | null
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date?: string
          expense_id?: string
          id?: string
          receipt_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      fee_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          fee_structure_id: string
          id: string
          month: string | null
          payment_date: string
          payment_method: string | null
          receipt_number: string | null
          remarks: string | null
          student_id: string
          updated_at: string
          year: number | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          fee_structure_id: string
          id?: string
          month?: string | null
          payment_date?: string
          payment_method?: string | null
          receipt_number?: string | null
          remarks?: string | null
          student_id: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          fee_structure_id?: string
          id?: string
          month?: string | null
          payment_date?: string
          payment_method?: string | null
          receipt_number?: string | null
          remarks?: string | null
          student_id?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          amount: number
          class_name: string | null
          created_at: string
          created_by: string | null
          department: string | null
          description: string | null
          fee_type: string
          frequency: string
          id: string
          is_active: boolean | null
          updated_at: string
        }
        Insert: {
          amount: number
          class_name?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          fee_type: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Update: {
          amount?: number
          class_name?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          fee_type?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      homework: {
        Row: {
          assigned_date: string
          attachment_url: string | null
          class_name: string
          created_at: string
          created_by: string | null
          department: string
          description: string | null
          due_date: string
          id: string
          is_active: boolean | null
          subject: string
          teacher_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_date?: string
          attachment_url?: string | null
          class_name: string
          created_at?: string
          created_by?: string | null
          department: string
          description?: string | null
          due_date: string
          id?: string
          is_active?: boolean | null
          subject: string
          teacher_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_date?: string
          attachment_url?: string | null
          class_name?: string
          created_at?: string
          created_by?: string | null
          department?: string
          description?: string | null
          due_date?: string
          id?: string
          is_active?: boolean | null
          subject?: string
          teacher_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_allocations: {
        Row: {
          allocation_date: string
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          monthly_fee: number
          notes: string | null
          room_id: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          allocation_date?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          monthly_fee: number
          notes?: string | null
          room_id: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          allocation_date?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          monthly_fee?: number
          notes?: string | null
          room_id?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostel_allocations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "hostel_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostel_allocations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_rooms: {
        Row: {
          capacity: number
          created_at: string
          created_by: string | null
          current_occupancy: number
          description: string | null
          id: string
          is_active: boolean | null
          monthly_fee: number
          room_number: string
          room_type: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          created_by?: string | null
          current_occupancy?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          monthly_fee?: number
          room_number: string
          room_type?: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          created_by?: string | null
          current_occupancy?: number
          description?: string | null
          id?: string
          is_active?: boolean | null
          monthly_fee?: number
          room_number?: string
          room_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          attachment_url: string | null
          content: string
          created_at: string
          created_by: string | null
          expire_date: string | null
          id: string
          is_active: boolean | null
          priority: string | null
          publish_date: string
          title: string
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          expire_date?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          publish_date?: string
          title: string
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          expire_date?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          publish_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      salary_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          month: string
          notes: string | null
          payment_date: string
          payment_id: string
          payment_method: string | null
          staff_id: string
          status: string
          updated_at: string
          year: number
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          month: string
          notes?: string | null
          payment_date?: string
          payment_id: string
          payment_method?: string | null
          staff_id: string
          status?: string
          updated_at?: string
          year: number
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          month?: string
          notes?: string | null
          payment_date?: string
          payment_id?: string
          payment_method?: string | null
          staff_id?: string
          status?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "salary_payments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          designation: string
          education: string | null
          email: string | null
          id: string
          join_date: string | null
          name: string
          nid: string | null
          notes: string | null
          phone: string
          photo_url: string | null
          salary: number | null
          staff_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          designation: string
          education?: string | null
          email?: string | null
          id?: string
          join_date?: string | null
          name: string
          nid?: string | null
          notes?: string | null
          phone: string
          photo_url?: string | null
          salary?: number | null
          staff_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          designation?: string
          education?: string | null
          email?: string | null
          id?: string
          join_date?: string | null
          name?: string
          nid?: string | null
          notes?: string | null
          phone?: string
          photo_url?: string | null
          salary?: number | null
          staff_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          address: string | null
          admission_date: string | null
          class_name: string
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          department: Database["public"]["Enums"]["department_type"]
          father_name: string | null
          guardian_phone: string
          id: string
          mother_name: string | null
          name: string
          notes: string | null
          phone: string | null
          photo_url: string | null
          status: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          admission_date?: string | null
          class_name: string
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          department: Database["public"]["Enums"]["department_type"]
          father_name?: string | null
          guardian_phone: string
          id?: string
          mother_name?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          status?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          admission_date?: string | null
          class_name?: string
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          department?: Database["public"]["Enums"]["department_type"]
          father_name?: string | null
          guardian_phone?: string
          id?: string
          mother_name?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          photo_url?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      timetables: {
        Row: {
          class_name: string
          created_at: string
          created_by: string | null
          day_of_week: string
          department: string
          end_time: string
          id: string
          is_active: boolean | null
          room_number: string | null
          start_time: string
          subject: string
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          class_name: string
          created_at?: string
          created_by?: string | null
          day_of_week: string
          department: string
          end_time: string
          id?: string
          is_active?: boolean | null
          room_number?: string | null
          start_time: string
          subject: string
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          class_name?: string
          created_at?: string
          created_by?: string | null
          day_of_week?: string
          department?: string
          end_time?: string
          id?: string
          is_active?: boolean | null
          room_number?: string | null
          start_time?: string
          subject?: string
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetables_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          title: string
          transaction_date: string
          transaction_id: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title: string
          transaction_date?: string
          transaction_id: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          title?: string
          transaction_date?: string
          transaction_id?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_attendance_stats: {
        Args: {
          p_end_date: string
          p_start_date: string
          p_user_id: string
          p_user_type: string
        }
        Returns: {
          absent_days: number
          attendance_percentage: number
          late_days: number
          leave_days: number
          present_days: number
          total_days: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "accountant" | "user"
      department_type: "মক্তব" | "হিফজ" | "কিতাব"
      document_category:
        | "নীতিমালা"
        | "সার্টিফিকেট"
        | "রিপোর্ট"
        | "ফর্ম"
        | "অন্যান্য"
      expense_category:
        | "বাজার"
        | "বেতন"
        | "বিদ্যুৎ"
        | "পানি"
        | "গ্যাস"
        | "রক্ষণাবেক্ষণ"
        | "অন্যান্য"
      transaction_type: "আয়" | "ব্যয়"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "teacher", "accountant", "user"],
      department_type: ["মক্তব", "হিফজ", "কিতাব"],
      document_category: [
        "নীতিমালা",
        "সার্টিফিকেট",
        "রিপোর্ট",
        "ফর্ম",
        "অন্যান্য",
      ],
      expense_category: [
        "বাজার",
        "বেতন",
        "বিদ্যুৎ",
        "পানি",
        "গ্যাস",
        "রক্ষণাবেক্ষণ",
        "অন্যান্য",
      ],
      transaction_type: ["আয়", "ব্যয়"],
    },
  },
} as const
