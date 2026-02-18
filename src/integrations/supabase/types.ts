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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bank_alerts: {
        Row: {
          alert_type: string
          amount: number | null
          bank_connection_id: string
          created_at: string
          currency: string | null
          id: string
          is_dismissed: boolean
          is_read: boolean
          message: string
          priority: string
          read_at: string | null
          read_by: string | null
          title: string
          transaction_id: string | null
        }
        Insert: {
          alert_type: string
          amount?: number | null
          bank_connection_id: string
          created_at?: string
          currency?: string | null
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          message: string
          priority?: string
          read_at?: string | null
          read_by?: string | null
          title: string
          transaction_id?: string | null
        }
        Update: {
          alert_type?: string
          amount?: number | null
          bank_connection_id?: string
          created_at?: string
          currency?: string | null
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          message?: string
          priority?: string
          read_at?: string | null
          read_by?: string | null
          title?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_alerts_bank_connection_id_fkey"
            columns: ["bank_connection_id"]
            isOneToOne: false
            referencedRelation: "bank_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_alerts_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "bank_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_connections: {
        Row: {
          account_name: string
          account_number: string
          account_type: string
          api_endpoint: string | null
          available_balance: number | null
          balance: number | null
          bank_display_name: string
          bank_name: string
          created_at: string
          currency: string
          error_message: string | null
          id: string
          is_active: boolean
          last_sync_at: string | null
          sync_status: string
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          account_type?: string
          api_endpoint?: string | null
          available_balance?: number | null
          balance?: number | null
          bank_display_name: string
          bank_name: string
          created_at?: string
          currency?: string
          error_message?: string | null
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          sync_status?: string
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: string
          api_endpoint?: string | null
          available_balance?: number | null
          balance?: number | null
          bank_display_name?: string
          bank_name?: string
          created_at?: string
          currency?: string
          error_message?: string | null
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          sync_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      bank_reconciliations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bank_closing_balance: number
          bank_connection_id: string
          bank_opening_balance: number
          book_closing_balance: number
          book_opening_balance: number
          completed_at: string | null
          completed_by: string | null
          created_at: string
          discrepancy_amount: number
          id: string
          matched_count: number
          notes: string | null
          period_end: string
          period_start: string
          status: string
          total_credits: number
          total_debits: number
          unmatched_count: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bank_closing_balance?: number
          bank_connection_id: string
          bank_opening_balance?: number
          book_closing_balance?: number
          book_opening_balance?: number
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          discrepancy_amount?: number
          id?: string
          matched_count?: number
          notes?: string | null
          period_end: string
          period_start: string
          status?: string
          total_credits?: number
          total_debits?: number
          unmatched_count?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bank_closing_balance?: number
          bank_connection_id?: string
          bank_opening_balance?: number
          book_closing_balance?: number
          book_opening_balance?: number
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          discrepancy_amount?: number
          id?: string
          matched_count?: number
          notes?: string | null
          period_end?: string
          period_start?: string
          status?: string
          total_credits?: number
          total_debits?: number
          unmatched_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_reconciliations_bank_connection_id_fkey"
            columns: ["bank_connection_id"]
            isOneToOne: false
            referencedRelation: "bank_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_transactions: {
        Row: {
          amount: number
          balance_after: number | null
          bank_connection_id: string
          counterparty_account: string | null
          counterparty_name: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          is_reconciled: boolean
          match_confidence: number | null
          match_status: string
          matched_invoice_id: string | null
          matched_receivable_id: string | null
          notes: string | null
          raw_data: Json | null
          reconciled_at: string | null
          reconciled_by: string | null
          transaction_date: string
          transaction_ref: string
          transaction_type: string
          value_date: string | null
        }
        Insert: {
          amount: number
          balance_after?: number | null
          bank_connection_id: string
          counterparty_account?: string | null
          counterparty_name?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_reconciled?: boolean
          match_confidence?: number | null
          match_status?: string
          matched_invoice_id?: string | null
          matched_receivable_id?: string | null
          notes?: string | null
          raw_data?: Json | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          transaction_date: string
          transaction_ref: string
          transaction_type: string
          value_date?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number | null
          bank_connection_id?: string
          counterparty_account?: string | null
          counterparty_name?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_reconciled?: boolean
          match_confidence?: number | null
          match_status?: string
          matched_invoice_id?: string | null
          matched_receivable_id?: string | null
          notes?: string | null
          raw_data?: Json | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          transaction_date?: string
          transaction_ref?: string
          transaction_type?: string
          value_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_bank_connection_id_fkey"
            columns: ["bank_connection_id"]
            isOneToOne: false
            referencedRelation: "bank_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          created_at: string
          customer_id: string
          document_name: string
          document_type: string
          file_size: string | null
          file_url: string | null
          id: string
          notes: string | null
          shipment_id: string | null
          status: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          document_name: string
          document_type: string
          file_size?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          shipment_id?: string | null
          status?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          document_name?: string
          document_type?: string
          file_size?: string | null
          file_url?: string | null
          id?: string
          notes?: string | null
          shipment_id?: string | null
          status?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "client_shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      client_invoices: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          customer_id: string
          description: string | null
          due_date: string
          id: string
          invoice_number: string
          paid_amount: number | null
          paid_date: string | null
          shipment_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id: string
          description?: string | null
          due_date: string
          id?: string
          invoice_number: string
          paid_amount?: number | null
          paid_date?: string | null
          shipment_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_id?: string
          description?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          paid_amount?: number | null
          paid_date?: string | null
          shipment_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_invoices_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "client_shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      client_messages: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          is_read: boolean
          message: string
          sender_id: string
          sender_type: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          is_read?: boolean
          message: string
          sender_id: string
          sender_type: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          is_read?: boolean
          message?: string
          sender_id?: string
          sender_type?: string
          subject?: string | null
        }
        Relationships: []
      }
      client_profiles: {
        Row: {
          company_name: string
          contact_name: string
          created_at: string
          customer_id: string
          email: string
          id: string
          is_active: boolean
          last_login_at: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          contact_name: string
          created_at?: string
          customer_id: string
          email: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          contact_name?: string
          created_at?: string
          customer_id?: string
          email?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_shipments: {
        Row: {
          ata: string | null
          bl_number: string
          cargo_description: string | null
          container_number: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          destination: string
          eta: string | null
          id: string
          notes: string | null
          origin: string
          status: string
          updated_at: string
          vessel_name: string | null
          voyage_number: string | null
          weight_kg: number | null
        }
        Insert: {
          ata?: string | null
          bl_number: string
          cargo_description?: string | null
          container_number?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          destination: string
          eta?: string | null
          id?: string
          notes?: string | null
          origin: string
          status?: string
          updated_at?: string
          vessel_name?: string | null
          voyage_number?: string | null
          weight_kg?: number | null
        }
        Update: {
          ata?: string | null
          bl_number?: string
          cargo_description?: string | null
          container_number?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          destination?: string
          eta?: string | null
          id?: string
          notes?: string | null
          origin?: string
          status?: string
          updated_at?: string
          vessel_name?: string | null
          voyage_number?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      finance_expenses: {
        Row: {
          amount: number
          approved_by: string | null
          category: string
          created_at: string
          currency: string
          description: string
          exchange_rate: number
          expense_date: string
          expense_ref: string
          ghs_equivalent: number
          id: string
          notes: string | null
          paid_date: string | null
          requested_by: string
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          approved_by?: string | null
          category?: string
          created_at?: string
          currency?: string
          description: string
          exchange_rate?: number
          expense_date?: string
          expense_ref: string
          ghs_equivalent?: number
          id?: string
          notes?: string | null
          paid_date?: string | null
          requested_by?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_by?: string | null
          category?: string
          created_at?: string
          currency?: string
          description?: string
          exchange_rate?: number
          expense_date?: string
          expense_ref?: string
          ghs_equivalent?: number
          id?: string
          notes?: string | null
          paid_date?: string | null
          requested_by?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      finance_invoices: {
        Row: {
          approval_date: string | null
          approved_by: string | null
          consolidation_ref: string | null
          created_at: string
          created_by: string
          currency: string
          customer: string
          customer_id: string
          description: string | null
          due_date: string
          exchange_rate: number
          ghs_equivalent: number
          id: string
          invoice_number: string
          invoice_type: string
          issue_date: string
          job_ref: string | null
          notes: string | null
          paid_amount: number
          paid_date: string | null
          payment_method: string | null
          service_type: string
          shipment_ref: string | null
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          approval_date?: string | null
          approved_by?: string | null
          consolidation_ref?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          customer: string
          customer_id: string
          description?: string | null
          due_date: string
          exchange_rate?: number
          ghs_equivalent?: number
          id?: string
          invoice_number: string
          invoice_type?: string
          issue_date?: string
          job_ref?: string | null
          notes?: string | null
          paid_amount?: number
          paid_date?: string | null
          payment_method?: string | null
          service_type?: string
          shipment_ref?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          approval_date?: string | null
          approved_by?: string | null
          consolidation_ref?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          customer?: string
          customer_id?: string
          description?: string | null
          due_date?: string
          exchange_rate?: number
          ghs_equivalent?: number
          id?: string
          invoice_number?: string
          invoice_type?: string
          issue_date?: string
          job_ref?: string | null
          notes?: string | null
          paid_amount?: number
          paid_date?: string | null
          payment_method?: string | null
          service_type?: string
          shipment_ref?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      finance_job_costs: {
        Row: {
          amount: number
          approval_status: string
          approved_by: string | null
          consolidation_ref: string | null
          cost_category: string
          created_at: string
          created_by: string
          currency: string
          customer: string
          customer_id: string
          description: string
          due_date: string | null
          exchange_rate: number
          ghs_equivalent: number
          id: string
          is_reimbursable: boolean
          job_ref: string
          job_type: string
          paid_amount: number
          paid_date: string | null
          payment_status: string
          shipment_ref: string | null
          updated_at: string
          vendor: string | null
        }
        Insert: {
          amount?: number
          approval_status?: string
          approved_by?: string | null
          consolidation_ref?: string | null
          cost_category?: string
          created_at?: string
          created_by?: string
          currency?: string
          customer: string
          customer_id: string
          description: string
          due_date?: string | null
          exchange_rate?: number
          ghs_equivalent?: number
          id?: string
          is_reimbursable?: boolean
          job_ref: string
          job_type?: string
          paid_amount?: number
          paid_date?: string | null
          payment_status?: string
          shipment_ref?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          approval_status?: string
          approved_by?: string | null
          consolidation_ref?: string | null
          cost_category?: string
          created_at?: string
          created_by?: string
          currency?: string
          customer?: string
          customer_id?: string
          description?: string
          due_date?: string | null
          exchange_rate?: number
          ghs_equivalent?: number
          id?: string
          is_reimbursable?: boolean
          job_ref?: string
          job_type?: string
          paid_amount?: number
          paid_date?: string | null
          payment_status?: string
          shipment_ref?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Relationships: []
      }
      login_history: {
        Row: {
          id: string
          ip_address: string | null
          login_at: string
          success: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          id?: string
          ip_address?: string | null
          login_at?: string
          success?: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          id?: string
          ip_address?: string | null
          login_at?: string
          success?: boolean
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: Database["public"]["Enums"]["department"]
          email: string
          failed_login_attempts: number
          full_name: string
          id: string
          is_active: boolean
          is_locked: boolean
          last_login_at: string | null
          locked_at: string | null
          must_change_password: boolean
          phone: string | null
          staff_id: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department: Database["public"]["Enums"]["department"]
          email: string
          failed_login_attempts?: number
          full_name: string
          id?: string
          is_active?: boolean
          is_locked?: boolean
          last_login_at?: string | null
          locked_at?: string | null
          must_change_password?: boolean
          phone?: string | null
          staff_id: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: Database["public"]["Enums"]["department"]
          email?: string
          failed_login_attempts?: number
          full_name?: string
          id?: string
          is_active?: boolean
          is_locked?: boolean
          last_login_at?: string | null
          locked_at?: string | null
          must_change_password?: boolean
          phone?: string | null
          staff_id?: string
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      get_client_customer_id: { Args: { _user_id: string }; Returns: string }
      get_user_department: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["department"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_failed_login: { Args: { _user_id: string }; Returns: undefined }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_client: { Args: { _user_id: string }; Returns: boolean }
      reset_failed_login: { Args: { _user_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "manager" | "staff"
      department:
        | "operations"
        | "documentation"
        | "accounts"
        | "marketing"
        | "customer_service"
        | "warehouse"
        | "management"
        | "super_admin"
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
      app_role: ["super_admin", "admin", "manager", "staff"],
      department: [
        "operations",
        "documentation",
        "accounts",
        "marketing",
        "customer_service",
        "warehouse",
        "management",
        "super_admin",
      ],
    },
  },
} as const
