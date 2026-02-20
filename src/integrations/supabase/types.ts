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
      ai_interactions: {
        Row: {
          created_at: string
          department: string
          id: string
          model: string | null
          module: string
          prompt: string
          response: string | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          department: string
          id?: string
          model?: string | null
          module: string
          prompt: string
          response?: string | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string
          id?: string
          model?: string | null
          module?: string
          prompt?: string
          response?: string | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
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
      cargo_receipts: {
        Row: {
          condition: string | null
          consolidation_id: string
          created_at: string
          damage_notes: string | null
          id: string
          packages_declared: number | null
          packages_received: number | null
          receipt_number: string
          received_by: string
          received_date: string
          shipper_id: string
          tally_sheet_ref: string | null
          verified: boolean | null
          verified_by: string | null
          verified_date: string | null
          warehouse_location: string | null
          weight_declared: number | null
          weight_received: number | null
        }
        Insert: {
          condition?: string | null
          consolidation_id: string
          created_at?: string
          damage_notes?: string | null
          id?: string
          packages_declared?: number | null
          packages_received?: number | null
          receipt_number: string
          received_by: string
          received_date: string
          shipper_id: string
          tally_sheet_ref?: string | null
          verified?: boolean | null
          verified_by?: string | null
          verified_date?: string | null
          warehouse_location?: string | null
          weight_declared?: number | null
          weight_received?: number | null
        }
        Update: {
          condition?: string | null
          consolidation_id?: string
          created_at?: string
          damage_notes?: string | null
          id?: string
          packages_declared?: number | null
          packages_received?: number | null
          receipt_number?: string
          received_by?: string
          received_date?: string
          shipper_id?: string
          tally_sheet_ref?: string | null
          verified?: boolean | null
          verified_by?: string | null
          verified_date?: string | null
          warehouse_location?: string | null
          weight_declared?: number | null
          weight_received?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cargo_receipts_consolidation_id_fkey"
            columns: ["consolidation_id"]
            isOneToOne: false
            referencedRelation: "consolidations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cargo_receipts_shipper_id_fkey"
            columns: ["shipper_id"]
            isOneToOne: false
            referencedRelation: "consolidation_shippers"
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
      consolidation_documents: {
        Row: {
          approved_date: string | null
          consolidation_id: string
          created_at: string
          document_number: string
          document_type: string
          file_url: string | null
          id: string
          issued_by: string | null
          issued_date: string | null
          notes: string | null
          shipper_id: string | null
          status: string | null
          submitted_date: string | null
        }
        Insert: {
          approved_date?: string | null
          consolidation_id: string
          created_at?: string
          document_number: string
          document_type: string
          file_url?: string | null
          id?: string
          issued_by?: string | null
          issued_date?: string | null
          notes?: string | null
          shipper_id?: string | null
          status?: string | null
          submitted_date?: string | null
        }
        Update: {
          approved_date?: string | null
          consolidation_id?: string
          created_at?: string
          document_number?: string
          document_type?: string
          file_url?: string | null
          id?: string
          issued_by?: string | null
          issued_date?: string | null
          notes?: string | null
          shipper_id?: string | null
          status?: string | null
          submitted_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consolidation_documents_consolidation_id_fkey"
            columns: ["consolidation_id"]
            isOneToOne: false
            referencedRelation: "consolidations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consolidation_documents_shipper_id_fkey"
            columns: ["shipper_id"]
            isOneToOne: false
            referencedRelation: "consolidation_shippers"
            referencedColumns: ["id"]
          },
        ]
      }
      consolidation_shippers: {
        Row: {
          cargo_status: string | null
          cbm: number | null
          consignee_address: string | null
          consignee_name: string
          consolidation_id: string
          created_at: string
          customs_status: string | null
          description: string | null
          documentation_fee: number | null
          duty_amount: number | null
          freight_charge: number | null
          gross_weight: number | null
          handling_charge: number | null
          house_awb_number: string | null
          house_bl_number: string | null
          hs_code: string | null
          hs_description: string | null
          icums_ref: string | null
          id: string
          invoice_number: string | null
          invoiced: boolean | null
          net_weight: number | null
          notify_party: string | null
          package_type: string | null
          packages: number | null
          paid: boolean | null
          received_by: string | null
          received_date: string | null
          release_status: string | null
          remarks: string | null
          shipper_address: string | null
          shipper_name: string
          storage_charge: number | null
          tally_confirmed: boolean | null
          tax_amount: number | null
          total_charge: number | null
          updated_at: string
        }
        Insert: {
          cargo_status?: string | null
          cbm?: number | null
          consignee_address?: string | null
          consignee_name: string
          consolidation_id: string
          created_at?: string
          customs_status?: string | null
          description?: string | null
          documentation_fee?: number | null
          duty_amount?: number | null
          freight_charge?: number | null
          gross_weight?: number | null
          handling_charge?: number | null
          house_awb_number?: string | null
          house_bl_number?: string | null
          hs_code?: string | null
          hs_description?: string | null
          icums_ref?: string | null
          id?: string
          invoice_number?: string | null
          invoiced?: boolean | null
          net_weight?: number | null
          notify_party?: string | null
          package_type?: string | null
          packages?: number | null
          paid?: boolean | null
          received_by?: string | null
          received_date?: string | null
          release_status?: string | null
          remarks?: string | null
          shipper_address?: string | null
          shipper_name: string
          storage_charge?: number | null
          tally_confirmed?: boolean | null
          tax_amount?: number | null
          total_charge?: number | null
          updated_at?: string
        }
        Update: {
          cargo_status?: string | null
          cbm?: number | null
          consignee_address?: string | null
          consignee_name?: string
          consolidation_id?: string
          created_at?: string
          customs_status?: string | null
          description?: string | null
          documentation_fee?: number | null
          duty_amount?: number | null
          freight_charge?: number | null
          gross_weight?: number | null
          handling_charge?: number | null
          house_awb_number?: string | null
          house_bl_number?: string | null
          hs_code?: string | null
          hs_description?: string | null
          icums_ref?: string | null
          id?: string
          invoice_number?: string | null
          invoiced?: boolean | null
          net_weight?: number | null
          notify_party?: string | null
          package_type?: string | null
          packages?: number | null
          paid?: boolean | null
          received_by?: string | null
          received_date?: string | null
          release_status?: string | null
          remarks?: string | null
          shipper_address?: string | null
          shipper_name?: string
          storage_charge?: number | null
          tally_confirmed?: boolean | null
          tax_amount?: number | null
          total_charge?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consolidation_shippers_consolidation_id_fkey"
            columns: ["consolidation_id"]
            isOneToOne: false
            referencedRelation: "consolidations"
            referencedColumns: ["id"]
          },
        ]
      }
      consolidations: {
        Row: {
          carrier: string
          consolidation_ref: string
          container_number: string | null
          container_type: string | null
          created_at: string
          created_by: string | null
          cutoff_date: string | null
          destination: string
          eta: string | null
          etd: string | null
          flight: string | null
          id: string
          master_awb_number: string | null
          master_bl_number: string | null
          origin: string
          port: string | null
          shippers_count: number | null
          status: string
          stuffing_date: string | null
          total_cbm: number | null
          total_packages: number | null
          total_weight: number | null
          type: string
          updated_at: string
          vessel: string | null
          voyage: string | null
          warehouse: string | null
        }
        Insert: {
          carrier: string
          consolidation_ref: string
          container_number?: string | null
          container_type?: string | null
          created_at?: string
          created_by?: string | null
          cutoff_date?: string | null
          destination: string
          eta?: string | null
          etd?: string | null
          flight?: string | null
          id?: string
          master_awb_number?: string | null
          master_bl_number?: string | null
          origin: string
          port?: string | null
          shippers_count?: number | null
          status?: string
          stuffing_date?: string | null
          total_cbm?: number | null
          total_packages?: number | null
          total_weight?: number | null
          type?: string
          updated_at?: string
          vessel?: string | null
          voyage?: string | null
          warehouse?: string | null
        }
        Update: {
          carrier?: string
          consolidation_ref?: string
          container_number?: string | null
          container_type?: string | null
          created_at?: string
          created_by?: string | null
          cutoff_date?: string | null
          destination?: string
          eta?: string | null
          etd?: string | null
          flight?: string | null
          id?: string
          master_awb_number?: string | null
          master_bl_number?: string | null
          origin?: string
          port?: string | null
          shippers_count?: number | null
          status?: string
          stuffing_date?: string | null
          total_cbm?: number | null
          total_packages?: number | null
          total_weight?: number | null
          type?: string
          updated_at?: string
          vessel?: string | null
          voyage?: string | null
          warehouse?: string | null
        }
        Relationships: []
      }
      customer_contacts: {
        Row: {
          created_at: string
          customer_id: string
          email: string | null
          id: string
          is_primary: boolean | null
          name: string
          phone: string | null
          role: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name: string
          phone?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          email?: string | null
          id?: string
          is_primary?: boolean | null
          name?: string
          phone?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_documents: {
        Row: {
          created_at: string
          customer_id: string
          document_type: string
          expiry_date: string | null
          file_size: string | null
          file_url: string | null
          id: string
          name: string
          status: string | null
          upload_date: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          document_type?: string
          expiry_date?: string | null
          file_size?: string | null
          file_url?: string | null
          id?: string
          name: string
          status?: string | null
          upload_date?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          document_type?: string
          expiry_date?: string | null
          file_size?: string | null
          file_url?: string | null
          id?: string
          name?: string
          status?: string | null
          upload_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          company_name: string
          company_type: string
          country: string | null
          created_at: string
          created_by: string | null
          credit_limit: number | null
          credit_status: string | null
          email: string
          id: string
          industry: string | null
          is_active: boolean | null
          outstanding_balance: number | null
          phone: string | null
          registration_number: string | null
          status: string
          tin_number: string | null
          total_shipments: number | null
          trade_name: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name: string
          company_type?: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          credit_limit?: number | null
          credit_status?: string | null
          email: string
          id?: string
          industry?: string | null
          is_active?: boolean | null
          outstanding_balance?: number | null
          phone?: string | null
          registration_number?: string | null
          status?: string
          tin_number?: string | null
          total_shipments?: number | null
          trade_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string
          company_type?: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          credit_limit?: number | null
          credit_status?: string | null
          email?: string
          id?: string
          industry?: string | null
          is_active?: boolean | null
          outstanding_balance?: number | null
          phone?: string | null
          registration_number?: string | null
          status?: string
          tin_number?: string | null
          total_shipments?: number | null
          trade_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      demurrage_records: {
        Row: {
          consolidation_id: string
          container_number: string
          created_at: string
          current_days: number | null
          daily_rate: number | null
          demurrage_days: number | null
          free_time_days: number | null
          free_time_end: string
          free_time_start: string
          id: string
          last_updated: string | null
          status: string | null
          storage_days: number | null
          storage_rate: number | null
          total_demurrage: number | null
          total_storage: number | null
        }
        Insert: {
          consolidation_id: string
          container_number: string
          created_at?: string
          current_days?: number | null
          daily_rate?: number | null
          demurrage_days?: number | null
          free_time_days?: number | null
          free_time_end: string
          free_time_start: string
          id?: string
          last_updated?: string | null
          status?: string | null
          storage_days?: number | null
          storage_rate?: number | null
          total_demurrage?: number | null
          total_storage?: number | null
        }
        Update: {
          consolidation_id?: string
          container_number?: string
          created_at?: string
          current_days?: number | null
          daily_rate?: number | null
          demurrage_days?: number | null
          free_time_days?: number | null
          free_time_end?: string
          free_time_start?: string
          id?: string
          last_updated?: string | null
          status?: string | null
          storage_days?: number | null
          storage_rate?: number | null
          total_demurrage?: number | null
          total_storage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "demurrage_records_consolidation_id_fkey"
            columns: ["consolidation_id"]
            isOneToOne: false
            referencedRelation: "consolidations"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string
          id: string
          license_expiry: string | null
          license_number: string | null
          name: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          license_expiry?: string | null
          license_number?: string | null
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          license_expiry?: string | null
          license_number?: string | null
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          created_at: string
          effective_date: string
          from_currency: string
          id: string
          rate: number
          to_currency: string
        }
        Insert: {
          created_at?: string
          effective_date?: string
          from_currency: string
          id?: string
          rate: number
          to_currency?: string
        }
        Update: {
          created_at?: string
          effective_date?: string
          from_currency?: string
          id?: string
          rate?: number
          to_currency?: string
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
      finance_payables: {
        Row: {
          amount: number
          approval_date: string | null
          approval_status: string | null
          approved_by: string | null
          bank_account: string | null
          consolidation_ref: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          description: string
          due_date: string | null
          exchange_rate: number | null
          ghs_equivalent: number | null
          gpha_ref: string | null
          icums_ref: string | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          job_ref: string | null
          notes: string | null
          paid_amount: number | null
          paid_date: string | null
          payable_ref: string
          payment_method: string | null
          shipment_ref: string | null
          status: string | null
          updated_at: string
          vendor: string
          vendor_category: string | null
          vendor_id: string | null
        }
        Insert: {
          amount?: number
          approval_date?: string | null
          approval_status?: string | null
          approved_by?: string | null
          bank_account?: string | null
          consolidation_ref?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description: string
          due_date?: string | null
          exchange_rate?: number | null
          ghs_equivalent?: number | null
          gpha_ref?: string | null
          icums_ref?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          job_ref?: string | null
          notes?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          payable_ref: string
          payment_method?: string | null
          shipment_ref?: string | null
          status?: string | null
          updated_at?: string
          vendor: string
          vendor_category?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          approval_date?: string | null
          approval_status?: string | null
          approved_by?: string | null
          bank_account?: string | null
          consolidation_ref?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          description?: string
          due_date?: string | null
          exchange_rate?: number | null
          ghs_equivalent?: number | null
          gpha_ref?: string | null
          icums_ref?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          job_ref?: string | null
          notes?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          payable_ref?: string
          payment_method?: string | null
          shipment_ref?: string | null
          status?: string | null
          updated_at?: string
          vendor?: string
          vendor_category?: string | null
          vendor_id?: string | null
        }
        Relationships: []
      }
      finance_payments: {
        Row: {
          amount: number
          approval_date: string | null
          approval_status: string | null
          approved_by: string | null
          bank_account: string | null
          category: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          customer: string | null
          customer_id: string | null
          description: string | null
          exchange_rate: number | null
          ghs_equivalent: number | null
          id: string
          invoice_id: string | null
          invoice_number: string | null
          method: string | null
          notes: string | null
          payable_id: string | null
          payable_ref: string | null
          payment_date: string | null
          payment_ref: string
          status: string | null
          transaction_ref: string | null
          type: string
          updated_at: string
          value_date: string | null
          vendor: string | null
        }
        Insert: {
          amount?: number
          approval_date?: string | null
          approval_status?: string | null
          approved_by?: string | null
          bank_account?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          customer?: string | null
          customer_id?: string | null
          description?: string | null
          exchange_rate?: number | null
          ghs_equivalent?: number | null
          id?: string
          invoice_id?: string | null
          invoice_number?: string | null
          method?: string | null
          notes?: string | null
          payable_id?: string | null
          payable_ref?: string | null
          payment_date?: string | null
          payment_ref: string
          status?: string | null
          transaction_ref?: string | null
          type?: string
          updated_at?: string
          value_date?: string | null
          vendor?: string | null
        }
        Update: {
          amount?: number
          approval_date?: string | null
          approval_status?: string | null
          approved_by?: string | null
          bank_account?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          customer?: string | null
          customer_id?: string | null
          description?: string | null
          exchange_rate?: number | null
          ghs_equivalent?: number | null
          id?: string
          invoice_id?: string | null
          invoice_number?: string | null
          method?: string | null
          notes?: string | null
          payable_id?: string | null
          payable_ref?: string | null
          payment_date?: string | null
          payment_ref?: string
          status?: string | null
          transaction_ref?: string | null
          type?: string
          updated_at?: string
          value_date?: string | null
          vendor?: string | null
        }
        Relationships: []
      }
      finance_receivables: {
        Row: {
          aging_bucket: string | null
          collection_notes: string | null
          created_at: string
          credit_status: string | null
          currency: string | null
          customer: string
          customer_id: string
          days_outstanding: number | null
          due_date: string
          ghs_equivalent: number | null
          id: string
          invoice_id: string | null
          invoice_number: string
          issue_date: string
          last_contact_date: string | null
          last_payment_date: string | null
          original_amount: number
          outstanding_amount: number | null
          paid_amount: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          aging_bucket?: string | null
          collection_notes?: string | null
          created_at?: string
          credit_status?: string | null
          currency?: string | null
          customer: string
          customer_id: string
          days_outstanding?: number | null
          due_date: string
          ghs_equivalent?: number | null
          id?: string
          invoice_id?: string | null
          invoice_number: string
          issue_date: string
          last_contact_date?: string | null
          last_payment_date?: string | null
          original_amount?: number
          outstanding_amount?: number | null
          paid_amount?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          aging_bucket?: string | null
          collection_notes?: string | null
          created_at?: string
          credit_status?: string | null
          currency?: string | null
          customer?: string
          customer_id?: string
          days_outstanding?: number | null
          due_date?: string
          ghs_equivalent?: number | null
          id?: string
          invoice_id?: string | null
          invoice_number?: string
          issue_date?: string
          last_contact_date?: string | null
          last_payment_date?: string | null
          original_amount?: number
          outstanding_amount?: number | null
          paid_amount?: number | null
          status?: string | null
          updated_at?: string
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
      notifications: {
        Row: {
          action_url: string | null
          category: string
          created_at: string
          id: string
          is_read: boolean
          is_resolved: boolean
          message: string
          metadata: Json | null
          priority: string
          read_at: string | null
          recipient_department: string | null
          recipient_id: string | null
          reference_id: string | null
          reference_type: string | null
          resolved_at: string | null
          sender_id: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          action_url?: string | null
          category?: string
          created_at?: string
          id?: string
          is_read?: boolean
          is_resolved?: boolean
          message: string
          metadata?: Json | null
          priority?: string
          read_at?: string | null
          recipient_department?: string | null
          recipient_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          resolved_at?: string | null
          sender_id?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          action_url?: string | null
          category?: string
          created_at?: string
          id?: string
          is_read?: boolean
          is_resolved?: boolean
          message?: string
          metadata?: Json | null
          priority?: string
          read_at?: string | null
          recipient_department?: string | null
          recipient_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          resolved_at?: string | null
          sender_id?: string | null
          title?: string
          type?: string
          updated_at?: string
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
      registrar_renewals: {
        Row: {
          certificate_number: string | null
          created_at: string
          currency: string | null
          description: string | null
          expiry_date: string
          id: string
          notes: string | null
          registrar_name: string
          registration_type: string
          renewal_date: string | null
          renewal_fee: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          certificate_number?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          expiry_date: string
          id?: string
          notes?: string | null
          registrar_name: string
          registration_type: string
          renewal_date?: string | null
          renewal_fee?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          certificate_number?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          expiry_date?: string
          id?: string
          notes?: string | null
          registrar_name?: string
          registration_type?: string
          renewal_date?: string | null
          renewal_fee?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tax_filings: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          due_date: string
          filing_date: string | null
          id: string
          notes: string | null
          payment_ref: string | null
          period: string
          reference_number: string | null
          status: string | null
          tax_type: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          due_date: string
          filing_date?: string | null
          id?: string
          notes?: string | null
          payment_ref?: string | null
          period: string
          reference_number?: string | null
          status?: string | null
          tax_type: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          due_date?: string
          filing_date?: string | null
          id?: string
          notes?: string | null
          payment_ref?: string | null
          period?: string
          reference_number?: string | null
          status?: string | null
          tax_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      trucking_trips: {
        Row: {
          bl_number: string | null
          container_number: string | null
          container_return_date: string | null
          container_return_location: string | null
          container_returned: boolean | null
          created_at: string
          customer: string | null
          customer_id: string | null
          delivery_date: string | null
          destination: string
          driver_id: string
          driver_payment: number | null
          fuel_cost: number | null
          id: string
          notes: string | null
          origin: string
          pickup_date: string | null
          status: string
          trip_cost: number | null
          truck_id: string
          updated_at: string
        }
        Insert: {
          bl_number?: string | null
          container_number?: string | null
          container_return_date?: string | null
          container_return_location?: string | null
          container_returned?: boolean | null
          created_at?: string
          customer?: string | null
          customer_id?: string | null
          delivery_date?: string | null
          destination: string
          driver_id: string
          driver_payment?: number | null
          fuel_cost?: number | null
          id?: string
          notes?: string | null
          origin: string
          pickup_date?: string | null
          status?: string
          trip_cost?: number | null
          truck_id: string
          updated_at?: string
        }
        Update: {
          bl_number?: string | null
          container_number?: string | null
          container_return_date?: string | null
          container_return_location?: string | null
          container_returned?: boolean | null
          created_at?: string
          customer?: string | null
          customer_id?: string | null
          delivery_date?: string | null
          destination?: string
          driver_id?: string
          driver_payment?: number | null
          fuel_cost?: number | null
          id?: string
          notes?: string | null
          origin?: string
          pickup_date?: string | null
          status?: string
          trip_cost?: number | null
          truck_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trucking_trips_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trucking_trips_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trucking_trips_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      trucks: {
        Row: {
          capacity: string | null
          created_at: string
          id: string
          make: string
          model: string
          registration_number: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          capacity?: string | null
          created_at?: string
          id?: string
          make: string
          model: string
          registration_number: string
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          capacity?: string | null
          created_at?: string
          id?: string
          make?: string
          model?: string
          registration_number?: string
          status?: string
          type?: string
          updated_at?: string
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
