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
      expenses: {
        Row: {
          amount: number
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
