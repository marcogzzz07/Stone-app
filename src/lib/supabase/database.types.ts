// Generado por Supabase (generate_typescript_types) el 2026-11-02. No editar a mano.
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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          address: string | null
          cadastral_key: string | null
          code: string
          created_at: string
          development_id: string | null
          id: string
          kind: Database["public"]["Enums"]["asset_kind"]
          name: string
          notes: string | null
          org_id: string
          parent_asset_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          cadastral_key?: string | null
          code: string
          created_at?: string
          development_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["asset_kind"]
          name: string
          notes?: string | null
          org_id: string
          parent_asset_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          cadastral_key?: string | null
          code?: string
          created_at?: string
          development_id?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["asset_kind"]
          name?: string
          notes?: string | null
          org_id?: string
          parent_asset_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_development_id_fkey"
            columns: ["development_id"]
            isOneToOne: false
            referencedRelation: "developments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_parent_asset_id_fkey"
            columns: ["parent_asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          after: Json | null
          at: string
          before: Json | null
          entity: string
          entity_id: string | null
          id: number
          org_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after?: Json | null
          at?: string
          before?: Json | null
          entity: string
          entity_id?: string | null
          id?: never
          org_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after?: Json | null
          at?: string
          before?: Json | null
          entity?: string
          entity_id?: string | null
          id?: never
          org_id?: string | null
        }
        Relationships: []
      }
      charge_adjustments: {
        Row: {
          amount: number
          approved_by: string | null
          charge_id: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["adjustment_kind"]
          org_id: string
          reason: string
        }
        Insert: {
          amount: number
          approved_by?: string | null
          charge_id: string
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["adjustment_kind"]
          org_id: string
          reason: string
        }
        Update: {
          amount?: number
          approved_by?: string | null
          charge_id?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["adjustment_kind"]
          org_id?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "charge_adjustments_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charge_adjustments_charge_id_fkey"
            columns: ["charge_id"]
            isOneToOne: false
            referencedRelation: "charge_balances"
            referencedColumns: ["charge_id"]
          },
          {
            foreignKeyName: "charge_adjustments_charge_id_fkey"
            columns: ["charge_id"]
            isOneToOne: false
            referencedRelation: "charges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charge_adjustments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      charges: {
        Row: {
          concept: Database["public"]["Enums"]["charge_concept"]
          created_at: string
          created_by: string | null
          currency: string
          development_id: string | null
          due_date: string | null
          id: string
          import_row_id: string | null
          invoice_date: string | null
          invoice_folio: string | null
          lease_id: string | null
          notes: string | null
          org_id: string
          period: string
          source: string
          subtotal: number
          tax_amount: number
          tenant_id: string
          total: number | null
          unit_id: string | null
          updated_at: string
          void_reason: string | null
          voided_at: string | null
        }
        Insert: {
          concept: Database["public"]["Enums"]["charge_concept"]
          created_at?: string
          created_by?: string | null
          currency?: string
          development_id?: string | null
          due_date?: string | null
          id?: string
          import_row_id?: string | null
          invoice_date?: string | null
          invoice_folio?: string | null
          lease_id?: string | null
          notes?: string | null
          org_id: string
          period: string
          source?: string
          subtotal: number
          tax_amount?: number
          tenant_id: string
          total?: number | null
          unit_id?: string | null
          updated_at?: string
          void_reason?: string | null
          voided_at?: string | null
        }
        Update: {
          concept?: Database["public"]["Enums"]["charge_concept"]
          created_at?: string
          created_by?: string | null
          currency?: string
          development_id?: string | null
          due_date?: string | null
          id?: string
          import_row_id?: string | null
          invoice_date?: string | null
          invoice_folio?: string | null
          lease_id?: string | null
          notes?: string | null
          org_id?: string
          period?: string
          source?: string
          subtotal?: number
          tax_amount?: number
          tenant_id?: string
          total?: number | null
          unit_id?: string | null
          updated_at?: string
          void_reason?: string | null
          voided_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_development_id_fkey"
            columns: ["development_id"]
            isOneToOne: false
            referencedRelation: "developments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_import_row_fk"
            columns: ["import_row_id"]
            isOneToOne: false
            referencedRelation: "import_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      critical_dates: {
        Row: {
          created_at: string
          created_by: string | null
          done_at: string | null
          due_on: string
          id: string
          kind: Database["public"]["Enums"]["critical_date_kind"]
          notes: string | null
          org_id: string
          target_id: string | null
          target_type: Database["public"]["Enums"]["link_target"] | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          done_at?: string | null
          due_on: string
          id?: string
          kind: Database["public"]["Enums"]["critical_date_kind"]
          notes?: string | null
          org_id: string
          target_id?: string | null
          target_type?: Database["public"]["Enums"]["link_target"] | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          done_at?: string | null
          due_on?: string
          id?: string
          kind?: Database["public"]["Enums"]["critical_date_kind"]
          notes?: string | null
          org_id?: string
          target_id?: string | null
          target_type?: Database["public"]["Enums"]["link_target"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "critical_dates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "critical_dates_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      developments: {
        Row: {
          address: string | null
          chart_order: number | null
          city: string | null
          code: string
          created_at: string
          description: string | null
          id: string
          is_shared: boolean
          name: string
          org_id: string
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          chart_order?: number | null
          city?: string | null
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_shared?: boolean
          name: string
          org_id: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          chart_order?: number | null
          city?: string | null
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_shared?: boolean
          name?: string
          org_id?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "developments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_links: {
        Row: {
          created_at: string
          document_id: string
          id: string
          org_id: string
          target_id: string
          target_type: Database["public"]["Enums"]["link_target"]
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          org_id: string
          target_id: string
          target_type: Database["public"]["Enums"]["link_target"]
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          org_id?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["link_target"]
        }
        Relationships: [
          {
            foreignKeyName: "document_links_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_links_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          created_at: string
          document_id: string
          id: string
          org_id: string
          path: string
          size_bytes: number | null
          uploaded_by: string | null
          version: number
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          org_id: string
          path: string
          size_bytes?: number | null
          uploaded_by?: string | null
          version: number
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          org_id?: string
          path?: string
          size_bytes?: number | null
          uploaded_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          bucket: string
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["document_kind"]
          mime_type: string | null
          org_id: string
          path: string
          sensitivity: Database["public"]["Enums"]["document_sensitivity"]
          size_bytes: number | null
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          bucket: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["document_kind"]
          mime_type?: string | null
          org_id: string
          path: string
          sensitivity?: Database["public"]["Enums"]["document_sensitivity"]
          size_bytes?: number | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          bucket?: string
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["document_kind"]
          mime_type?: string | null
          org_id?: string
          path?: string
          sensitivity?: Database["public"]["Enums"]["document_sensitivity"]
          size_bytes?: number | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_payments: {
        Row: {
          amount: number
          bank_ref: string | null
          created_at: string
          expense_id: string
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          org_id: string
          paid_at: string
        }
        Insert: {
          amount: number
          bank_ref?: string | null
          created_at?: string
          expense_id: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          org_id: string
          paid_at: string
        }
        Update: {
          amount?: number
          bank_ref?: string | null
          created_at?: string
          expense_id?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          org_id?: string
          paid_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_payments_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_payments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_recoveries: {
        Row: {
          amount: number
          charge_id: string
          created_at: string
          expense_id: string
          id: string
          org_id: string
        }
        Insert: {
          amount: number
          charge_id: string
          created_at?: string
          expense_id: string
          id?: string
          org_id: string
        }
        Update: {
          amount?: number
          charge_id?: string
          created_at?: string
          expense_id?: string
          id?: string
          org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_recoveries_charge_id_fkey"
            columns: ["charge_id"]
            isOneToOne: false
            referencedRelation: "charge_balances"
            referencedColumns: ["charge_id"]
          },
          {
            foreignKeyName: "expense_recoveries_charge_id_fkey"
            columns: ["charge_id"]
            isOneToOne: false
            referencedRelation: "charges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_recoveries_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_recoveries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_shares: {
        Row: {
          amount: number
          created_at: string
          entity_id: string | null
          expense_id: string
          factor: number
          id: string
          org_id: string
          rule_note: string | null
          share_pct: number | null
          tenant_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          entity_id?: string | null
          expense_id: string
          factor?: number
          id?: string
          org_id: string
          rule_note?: string | null
          share_pct?: number | null
          tenant_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          entity_id?: string | null
          expense_id?: string
          factor?: number
          id?: string
          org_id?: string
          rule_note?: string | null
          share_pct?: number | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_shares_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_shares_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_shares_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_shares_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          asset_id: string | null
          category: Database["public"]["Enums"]["expense_category"]
          charged_at: string | null
          classification: Database["public"]["Enums"]["expense_classification"]
          created_at: string
          created_by: string | null
          currency: string
          development_id: string | null
          evidence_document_id: string | null
          id: string
          import_row_id: string | null
          notes: string | null
          org_id: string
          payer_entity_id: string | null
          period: string | null
          recoverable: boolean
          source: string
          subtotal: number
          tax_amount: number
          total: number | null
          unit_id: string | null
          updated_at: string
          vendor: string | null
        }
        Insert: {
          asset_id?: string | null
          category: Database["public"]["Enums"]["expense_category"]
          charged_at?: string | null
          classification?: Database["public"]["Enums"]["expense_classification"]
          created_at?: string
          created_by?: string | null
          currency?: string
          development_id?: string | null
          evidence_document_id?: string | null
          id?: string
          import_row_id?: string | null
          notes?: string | null
          org_id: string
          payer_entity_id?: string | null
          period?: string | null
          recoverable?: boolean
          source?: string
          subtotal: number
          tax_amount?: number
          total?: number | null
          unit_id?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          asset_id?: string | null
          category?: Database["public"]["Enums"]["expense_category"]
          charged_at?: string | null
          classification?: Database["public"]["Enums"]["expense_classification"]
          created_at?: string
          created_by?: string | null
          currency?: string
          development_id?: string | null
          evidence_document_id?: string | null
          id?: string
          import_row_id?: string | null
          notes?: string | null
          org_id?: string
          payer_entity_id?: string | null
          period?: string | null
          recoverable?: boolean
          source?: string
          subtotal?: number
          tax_amount?: number
          total?: number | null
          unit_id?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_development_id_fkey"
            columns: ["development_id"]
            isOneToOne: false
            referencedRelation: "developments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_evidence_document_fk"
            columns: ["evidence_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_import_row_fk"
            columns: ["import_row_id"]
            isOneToOne: false
            referencedRelation: "import_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_payer_entity_id_fkey"
            columns: ["payer_entity_id"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      geometries: {
        Row: {
          area_m2_est: number | null
          captured_at: string | null
          created_at: string
          created_by: string | null
          geom: unknown
          geom_type: string | null
          id: string
          is_current: boolean
          method: string | null
          org_id: string
          perimeter_m_est: number | null
          precision_m: number | null
          source: string | null
          srid_source: number | null
          target_id: string
          target_type: Database["public"]["Enums"]["geometry_target"]
          version: number
        }
        Insert: {
          area_m2_est?: number | null
          captured_at?: string | null
          created_at?: string
          created_by?: string | null
          geom: unknown
          geom_type?: string | null
          id?: string
          is_current?: boolean
          method?: string | null
          org_id: string
          perimeter_m_est?: number | null
          precision_m?: number | null
          source?: string | null
          srid_source?: number | null
          target_id: string
          target_type: Database["public"]["Enums"]["geometry_target"]
          version?: number
        }
        Update: {
          area_m2_est?: number | null
          captured_at?: string | null
          created_at?: string
          created_by?: string | null
          geom?: unknown
          geom_type?: string | null
          id?: string
          is_current?: boolean
          method?: string | null
          org_id?: string
          perimeter_m_est?: number | null
          precision_m?: number | null
          source?: string | null
          srid_source?: number | null
          target_id?: string
          target_type?: Database["public"]["Enums"]["geometry_target"]
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "geometries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geometries_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      import_batches: {
        Row: {
          applied_at: string | null
          created_at: string
          created_by: string | null
          file_document_id: string | null
          file_name: string
          file_sha256: string | null
          id: string
          mapping: Json
          org_id: string
          report_period: string | null
          reviewed_by: string | null
          sheets: string[]
          status: Database["public"]["Enums"]["import_status"]
          summary: Json
          updated_at: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string
          created_by?: string | null
          file_document_id?: string | null
          file_name: string
          file_sha256?: string | null
          id?: string
          mapping?: Json
          org_id: string
          report_period?: string | null
          reviewed_by?: string | null
          sheets?: string[]
          status?: Database["public"]["Enums"]["import_status"]
          summary?: Json
          updated_at?: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string
          created_by?: string | null
          file_document_id?: string | null
          file_name?: string
          file_sha256?: string | null
          id?: string
          mapping?: Json
          org_id?: string
          report_period?: string | null
          reviewed_by?: string | null
          sheets?: string[]
          status?: Database["public"]["Enums"]["import_status"]
          summary?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_batches_file_document_id_fkey"
            columns: ["file_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_batches_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_batches_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      import_discrepancies: {
        Row: {
          actual: number | null
          batch_id: string | null
          cell_ref: string | null
          created_at: string
          description: string
          expected: number | null
          id: string
          kind: string
          org_id: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: Database["public"]["Enums"]["severity"]
          sheet: string | null
          status: Database["public"]["Enums"]["discrepancy_status"]
          target_id: string | null
          target_type: Database["public"]["Enums"]["link_target"] | null
        }
        Insert: {
          actual?: number | null
          batch_id?: string | null
          cell_ref?: string | null
          created_at?: string
          description: string
          expected?: number | null
          id?: string
          kind: string
          org_id: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["severity"]
          sheet?: string | null
          status?: Database["public"]["Enums"]["discrepancy_status"]
          target_id?: string | null
          target_type?: Database["public"]["Enums"]["link_target"] | null
        }
        Update: {
          actual?: number | null
          batch_id?: string | null
          cell_ref?: string | null
          created_at?: string
          description?: string
          expected?: number | null
          id?: string
          kind?: string
          org_id?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: Database["public"]["Enums"]["severity"]
          sheet?: string | null
          status?: Database["public"]["Enums"]["discrepancy_status"]
          target_id?: string | null
          target_type?: Database["public"]["Enums"]["link_target"] | null
        }
        Relationships: [
          {
            foreignKeyName: "import_discrepancies_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_discrepancies_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_discrepancies_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      import_rows: {
        Row: {
          batch_id: string
          classification: Database["public"]["Enums"]["import_row_class"]
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision: Database["public"]["Enums"]["import_row_decision"]
          id: string
          message: string | null
          normalized: Json | null
          org_id: string
          raw: Json
          row_number: number
          sheet: string
          target_id: string | null
          target_type: Database["public"]["Enums"]["link_target"] | null
        }
        Insert: {
          batch_id: string
          classification?: Database["public"]["Enums"]["import_row_class"]
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision?: Database["public"]["Enums"]["import_row_decision"]
          id?: string
          message?: string | null
          normalized?: Json | null
          org_id: string
          raw: Json
          row_number: number
          sheet: string
          target_id?: string | null
          target_type?: Database["public"]["Enums"]["link_target"] | null
        }
        Update: {
          batch_id?: string
          classification?: Database["public"]["Enums"]["import_row_class"]
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision?: Database["public"]["Enums"]["import_row_decision"]
          id?: string
          message?: string | null
          normalized?: Json | null
          org_id?: string
          raw?: Json
          row_number?: number
          sheet?: string
          target_id?: string | null
          target_type?: Database["public"]["Enums"]["link_target"] | null
        }
        Relationships: [
          {
            foreignKeyName: "import_rows_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_rows_decided_by_fkey"
            columns: ["decided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "import_rows_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["invitation_status"]
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lease_terms: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          deposit_amount: number | null
          due_day: number | null
          effective_from: string
          effective_to: string | null
          id: string
          increase_rule: Json | null
          lease_id: string
          maintenance_total: number
          notes: string | null
          org_id: string
          periodicity: Database["public"]["Enums"]["periodicity"]
          rent_total: number
          source: string
          tax_rate: number
          tax_treatment: Database["public"]["Enums"]["tax_treatment"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          deposit_amount?: number | null
          due_day?: number | null
          effective_from: string
          effective_to?: string | null
          id?: string
          increase_rule?: Json | null
          lease_id: string
          maintenance_total?: number
          notes?: string | null
          org_id: string
          periodicity?: Database["public"]["Enums"]["periodicity"]
          rent_total: number
          source?: string
          tax_rate?: number
          tax_treatment?: Database["public"]["Enums"]["tax_treatment"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          deposit_amount?: number | null
          due_day?: number | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          increase_rule?: Json | null
          lease_id?: string
          maintenance_total?: number
          notes?: string | null
          org_id?: string
          periodicity?: Database["public"]["Enums"]["periodicity"]
          rent_total?: number
          source?: string
          tax_rate?: number
          tax_treatment?: Database["public"]["Enums"]["tax_treatment"]
        }
        Relationships: [
          {
            foreignKeyName: "lease_terms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_terms_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_terms_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lease_units: {
        Row: {
          created_at: string
          id: string
          lease_id: string
          org_id: string
          rented_m2: number | null
          share_pct: number | null
          unit_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lease_id: string
          org_id: string
          rented_m2?: number | null
          share_pct?: number | null
          unit_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lease_id?: string
          org_id?: string
          rented_m2?: number | null
          share_pct?: number | null
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lease_units_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_units_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_units_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      leases: {
        Row: {
          code: string | null
          contract_document_id: string | null
          created_at: string
          development_id: string | null
          end_date: string | null
          id: string
          lessor_entity_id: string | null
          notes: string | null
          org_id: string
          signed_at: string | null
          source: string
          start_date: string | null
          status: Database["public"]["Enums"]["lease_status"]
          tenant_id: string
          updated_at: string
          verification: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          code?: string | null
          contract_document_id?: string | null
          created_at?: string
          development_id?: string | null
          end_date?: string | null
          id?: string
          lessor_entity_id?: string | null
          notes?: string | null
          org_id: string
          signed_at?: string | null
          source?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["lease_status"]
          tenant_id: string
          updated_at?: string
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          code?: string | null
          contract_document_id?: string | null
          created_at?: string
          development_id?: string | null
          end_date?: string | null
          id?: string
          lessor_entity_id?: string | null
          notes?: string | null
          org_id?: string
          signed_at?: string | null
          source?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["lease_status"]
          tenant_id?: string
          updated_at?: string
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "leases_contract_document_fk"
            columns: ["contract_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_development_id_fkey"
            columns: ["development_id"]
            isOneToOne: false
            referencedRelation: "developments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_lessor_entity_id_fkey"
            columns: ["lessor_entity_id"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_entities: {
        Row: {
          created_at: string
          id: string
          is_stone: boolean
          kind: Database["public"]["Enums"]["entity_kind"]
          name: string
          notes: string | null
          org_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_stone?: boolean
          kind?: Database["public"]["Enums"]["entity_kind"]
          name: string
          notes?: string | null
          org_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_stone?: boolean
          kind?: Database["public"]["Enums"]["entity_kind"]
          name?: string
          notes?: string | null
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_entities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_entity_details: {
        Row: {
          address: string | null
          email: string | null
          entity_id: string
          org_id: string
          phone: string | null
          rfc: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          email?: string | null
          entity_id: string
          org_id: string
          phone?: string | null
          rfc?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          email?: string | null
          entity_id?: string
          org_id?: string
          phone?: string | null
          rfc?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_entity_details_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: true
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_entity_details_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          org_id: string
          profile_id: string
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          profile_id: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      ownership_interests: {
        Row: {
          asset_id: string | null
          created_at: string
          entity_id: string
          id: string
          org_id: string
          share_pct: number
          source_document_id: string | null
          unit_id: string | null
          valid_from: string | null
          valid_to: string | null
          verification: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          asset_id?: string | null
          created_at?: string
          entity_id: string
          id?: string
          org_id: string
          share_pct?: number
          source_document_id?: string | null
          unit_id?: string | null
          valid_from?: string | null
          valid_to?: string | null
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          asset_id?: string | null
          created_at?: string
          entity_id?: string
          id?: string
          org_id?: string
          share_pct?: number
          source_document_id?: string | null
          unit_id?: string | null
          valid_from?: string | null
          valid_to?: string | null
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "ownership_interests_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ownership_interests_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ownership_interests_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ownership_interests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ownership_source_document_fk"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_allocations: {
        Row: {
          amount: number
          charge_id: string
          created_at: string
          id: string
          org_id: string
          payment_id: string
        }
        Insert: {
          amount: number
          charge_id: string
          created_at?: string
          id?: string
          org_id: string
          payment_id: string
        }
        Update: {
          amount?: number
          charge_id?: string
          created_at?: string
          id?: string
          org_id?: string
          payment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_allocations_charge_id_fkey"
            columns: ["charge_id"]
            isOneToOne: false
            referencedRelation: "charge_balances"
            referencedColumns: ["charge_id"]
          },
          {
            foreignKeyName: "payment_allocations_charge_id_fkey"
            columns: ["charge_id"]
            isOneToOne: false
            referencedRelation: "charges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_allocations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          bank_ref: string | null
          created_at: string
          created_by: string | null
          currency: string
          effective_date: string
          evidence_document_id: string | null
          id: string
          import_row_id: string | null
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          org_id: string
          source: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          bank_ref?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_date: string
          evidence_document_id?: string | null
          id?: string
          import_row_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          org_id: string
          source?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          bank_ref?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          effective_date?: string
          evidence_document_id?: string | null
          id?: string
          import_row_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          org_id?: string
          source?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_evidence_document_fk"
            columns: ["evidence_document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_import_row_fk"
            columns: ["import_row_id"]
            isOneToOne: false
            referencedRelation: "import_rows"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      period_locks: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          notes: string | null
          org_id: string
          period: string
          scope_id: string | null
          scope_type: Database["public"]["Enums"]["link_target"] | null
          status: Database["public"]["Enums"]["period_status"]
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          notes?: string | null
          org_id: string
          period: string
          scope_id?: string | null
          scope_type?: Database["public"]["Enums"]["link_target"] | null
          status?: Database["public"]["Enums"]["period_status"]
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          notes?: string | null
          org_id?: string
          period?: string
          scope_id?: string | null
          scope_type?: Database["public"]["Enums"]["link_target"] | null
          status?: Database["public"]["Enums"]["period_status"]
        }
        Relationships: [
          {
            foreignKeyName: "period_locks_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "period_locks_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      source_of_truth_rules: {
        Row: {
          authorized_by: string | null
          created_at: string
          id: string
          org_id: string
          period_from: string
          scope_id: string
          scope_type: Database["public"]["Enums"]["link_target"]
          source: Database["public"]["Enums"]["truth_source"]
        }
        Insert: {
          authorized_by?: string | null
          created_at?: string
          id?: string
          org_id: string
          period_from: string
          scope_id: string
          scope_type: Database["public"]["Enums"]["link_target"]
          source: Database["public"]["Enums"]["truth_source"]
        }
        Update: {
          authorized_by?: string | null
          created_at?: string
          id?: string
          org_id?: string
          period_from?: string
          scope_id?: string
          scope_type?: Database["public"]["Enums"]["link_target"]
          source?: Database["public"]["Enums"]["truth_source"]
        }
        Relationships: [
          {
            foreignKeyName: "source_of_truth_rules_authorized_by_fkey"
            columns: ["authorized_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_of_truth_rules_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      source_records: {
        Row: {
          created_at: string
          first_batch_id: string | null
          id: string
          last_batch_id: string | null
          org_id: string
          source_key: string
          target_id: string
          target_type: Database["public"]["Enums"]["link_target"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_batch_id?: string | null
          id?: string
          last_batch_id?: string | null
          org_id: string
          source_key: string
          target_id: string
          target_type: Database["public"]["Enums"]["link_target"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_batch_id?: string | null
          id?: string
          last_batch_id?: string | null
          org_id?: string
          source_key?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["link_target"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_records_first_batch_id_fkey"
            columns: ["first_batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_records_last_batch_id_fkey"
            columns: ["last_batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_records_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      surfaces: {
        Row: {
          captured_at: string | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["surface_kind"]
          org_id: string
          source: string | null
          target_id: string
          target_type: Database["public"]["Enums"]["geometry_target"]
          value_m2: number
          verification: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          captured_at?: string | null
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["surface_kind"]
          org_id: string
          source?: string | null
          target_id: string
          target_type: Database["public"]["Enums"]["geometry_target"]
          value_m2: number
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          captured_at?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["surface_kind"]
          org_id?: string
          source?: string | null
          target_id?: string
          target_type?: Database["public"]["Enums"]["geometry_target"]
          value_m2?: number
          verification?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "surfaces_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_aliases: {
        Row: {
          alias: string
          created_at: string
          id: string
          org_id: string
          tenant_id: string
        }
        Insert: {
          alias: string
          created_at?: string
          id?: string
          org_id: string
          tenant_id: string
        }
        Update: {
          alias?: string
          created_at?: string
          id?: string
          org_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_aliases_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_aliases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_details: {
        Row: {
          address: string | null
          contact_name: string | null
          email: string | null
          org_id: string
          phone: string | null
          rfc: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          email?: string | null
          org_id: string
          phone?: string | null
          rfc?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          email?: string | null
          org_id?: string
          phone?: string | null
          rfc?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_details_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_details_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          display_name: string
          id: string
          kind: Database["public"]["Enums"]["entity_kind"]
          legal_name: string | null
          notes: string | null
          org_id: string
          pays_cash: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          kind?: Database["public"]["Enums"]["entity_kind"]
          legal_name?: string | null
          notes?: string | null
          org_id: string
          pays_cash?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          kind?: Database["public"]["Enums"]["entity_kind"]
          legal_name?: string | null
          notes?: string | null
          org_id?: string
          pays_cash?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          asset_id: string | null
          code: string
          created_at: string
          description: string | null
          development_id: string | null
          floor_label: string | null
          id: string
          kind: Database["public"]["Enums"]["unit_kind"]
          lifecycle: Database["public"]["Enums"]["unit_lifecycle"]
          list_rate_m2: number | null
          list_rent: number | null
          list_rent_currency: string
          managed_by_org_id: string | null
          name: string
          notes: string | null
          occupancy: Database["public"]["Enums"]["occupancy_status"]
          org_id: string
          owner_entity_id: string | null
          reference_only: boolean
          updated_at: string
        }
        Insert: {
          asset_id?: string | null
          code: string
          created_at?: string
          description?: string | null
          development_id?: string | null
          floor_label?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["unit_kind"]
          lifecycle?: Database["public"]["Enums"]["unit_lifecycle"]
          list_rate_m2?: number | null
          list_rent?: number | null
          list_rent_currency?: string
          managed_by_org_id?: string | null
          name: string
          notes?: string | null
          occupancy?: Database["public"]["Enums"]["occupancy_status"]
          org_id: string
          owner_entity_id?: string | null
          reference_only?: boolean
          updated_at?: string
        }
        Update: {
          asset_id?: string | null
          code?: string
          created_at?: string
          description?: string | null
          development_id?: string | null
          floor_label?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["unit_kind"]
          lifecycle?: Database["public"]["Enums"]["unit_lifecycle"]
          list_rate_m2?: number | null
          list_rent?: number | null
          list_rent_currency?: string
          managed_by_org_id?: string | null
          name?: string
          notes?: string | null
          occupancy?: Database["public"]["Enums"]["occupancy_status"]
          org_id?: string
          owner_entity_id?: string | null
          reference_only?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_development_id_fkey"
            columns: ["development_id"]
            isOneToOne: false
            referencedRelation: "developments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_managed_by_org_id_fkey"
            columns: ["managed_by_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "units_owner_entity_id_fkey"
            columns: ["owner_entity_id"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      charge_balances: {
        Row: {
          adjustments: number | null
          balance: number | null
          charge_id: string | null
          concept: Database["public"]["Enums"]["charge_concept"] | null
          currency: string | null
          development_id: string | null
          due_date: string | null
          invoice_date: string | null
          invoice_folio: string | null
          is_void: boolean | null
          last_payment_date: string | null
          lease_id: string | null
          net_total: number | null
          org_id: string | null
          paid: number | null
          period: string | null
          status: string | null
          tenant_id: string | null
          total: number | null
          unit_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charges_development_id_fkey"
            columns: ["development_id"]
            isOneToOne: false
            referencedRelation: "developments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charges_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      lease_terms_breakdown: {
        Row: {
          created_at: string | null
          created_by: string | null
          currency: string | null
          deposit_amount: number | null
          due_day: number | null
          effective_from: string | null
          effective_to: string | null
          id: string | null
          increase_rule: Json | null
          lease_id: string | null
          maintenance_total: number | null
          notes: string | null
          org_id: string | null
          periodicity: Database["public"]["Enums"]["periodicity"] | null
          rent_subtotal: number | null
          rent_tax: number | null
          rent_total: number | null
          source: string | null
          tax_rate: number | null
          tax_treatment: Database["public"]["Enums"]["tax_treatment"] | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deposit_amount?: number | null
          due_day?: number | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string | null
          increase_rule?: Json | null
          lease_id?: string | null
          maintenance_total?: number | null
          notes?: string | null
          org_id?: string | null
          periodicity?: Database["public"]["Enums"]["periodicity"] | null
          rent_subtotal?: never
          rent_tax?: never
          rent_total?: number | null
          source?: string | null
          tax_rate?: number | null
          tax_treatment?: Database["public"]["Enums"]["tax_treatment"] | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deposit_amount?: number | null
          due_day?: number | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string | null
          increase_rule?: Json | null
          lease_id?: string | null
          maintenance_total?: number | null
          notes?: string | null
          org_id?: string | null
          periodicity?: Database["public"]["Enums"]["periodicity"] | null
          rent_subtotal?: never
          rent_tax?: never
          rent_total?: number | null
          source?: string | null
          tax_rate?: number | null
          tax_treatment?: Database["public"]["Enums"]["tax_treatment"] | null
        }
        Relationships: [
          {
            foreignKeyName: "lease_terms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_terms_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lease_terms_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      lease_term_at: {
        Args: { p_date: string; p_lease: string }
        Returns: {
          created_at: string
          created_by: string | null
          currency: string
          deposit_amount: number | null
          due_day: number | null
          effective_from: string
          effective_to: string | null
          id: string
          increase_rule: Json | null
          lease_id: string
          maintenance_total: number
          notes: string | null
          org_id: string
          periodicity: Database["public"]["Enums"]["periodicity"]
          rent_total: number
          source: string
          tax_rate: number
          tax_treatment: Database["public"]["Enums"]["tax_treatment"]
        }
        SetofOptions: {
          from: "*"
          to: "lease_terms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      normalize_name: { Args: { p: string }; Returns: string }
    }
    Enums: {
      adjustment_kind:
        | "discount"
        | "credit_note"
        | "waiver"
        | "correction"
        | "reinvoice"
      app_role: "admin" | "operator" | "viewer"
      asset_kind: "terreno" | "edificio" | "predio" | "nave" | "otro"
      charge_concept: "rent" | "maintenance" | "service" | "other"
      critical_date_kind:
        | "lease_end"
        | "property_tax"
        | "insurance"
        | "rent_increase"
        | "other"
      discrepancy_status: "open" | "acknowledged" | "resolved"
      document_kind:
        | "contrato"
        | "escritura"
        | "plano"
        | "factura"
        | "comprobante_pago"
        | "poliza"
        | "predial"
        | "reporte"
        | "foto"
        | "otro"
      document_sensitivity: "public_internal" | "restricted" | "sensitive"
      entity_kind: "persona_fisica" | "persona_moral"
      expense_category:
        | "electricity"
        | "water"
        | "phone"
        | "maintenance"
        | "property_tax"
        | "insurance"
        | "repairs"
        | "admin_fee"
        | "other"
      expense_classification:
        | "pending"
        | "stone_expense"
        | "tenant_passthrough"
        | "both"
      geometry_target: "development" | "asset" | "unit"
      import_row_class:
        | "new"
        | "duplicate"
        | "possible_duplicate"
        | "conflict"
        | "incomplete"
      import_row_decision: "pending" | "accept" | "skip"
      import_status: "uploaded" | "parsed" | "reviewed" | "applied" | "rejected"
      invitation_status: "pending" | "accepted" | "revoked" | "expired"
      lease_status: "draft" | "active" | "expired" | "terminated" | "void"
      link_target:
        | "development"
        | "asset"
        | "unit"
        | "lease"
        | "tenant"
        | "charge"
        | "payment"
        | "expense"
        | "legal_entity"
        | "import_batch"
      membership_status: "active" | "suspended"
      occupancy_status: "unknown" | "occupied" | "vacant" | "unavailable"
      payment_method: "transfer" | "cash" | "check" | "card" | "other"
      period_status: "open" | "under_review" | "closed"
      periodicity: "monthly" | "bimonthly" | "quarterly" | "annual" | "variable"
      severity: "info" | "warning" | "danger"
      surface_kind:
        | "legal"
        | "cadastral"
        | "built"
        | "rentable"
        | "gis_estimate"
      tax_treatment: "iva_incluido" | "mas_iva" | "exento"
      truth_source: "excel" | "stone"
      unit_kind:
        | "bodega"
        | "local"
        | "oficina"
        | "terreno"
        | "lote"
        | "departamento"
        | "edificio"
        | "otro"
      unit_lifecycle: "active" | "prospect" | "sold" | "inactive"
      verification_status: "confirmado" | "por_verificar" | "no_disponible"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      adjustment_kind: [
        "discount",
        "credit_note",
        "waiver",
        "correction",
        "reinvoice",
      ],
      app_role: ["admin", "operator", "viewer"],
      asset_kind: ["terreno", "edificio", "predio", "nave", "otro"],
      charge_concept: ["rent", "maintenance", "service", "other"],
      critical_date_kind: [
        "lease_end",
        "property_tax",
        "insurance",
        "rent_increase",
        "other",
      ],
      discrepancy_status: ["open", "acknowledged", "resolved"],
      document_kind: [
        "contrato",
        "escritura",
        "plano",
        "factura",
        "comprobante_pago",
        "poliza",
        "predial",
        "reporte",
        "foto",
        "otro",
      ],
      document_sensitivity: ["public_internal", "restricted", "sensitive"],
      entity_kind: ["persona_fisica", "persona_moral"],
      expense_category: [
        "electricity",
        "water",
        "phone",
        "maintenance",
        "property_tax",
        "insurance",
        "repairs",
        "admin_fee",
        "other",
      ],
      expense_classification: [
        "pending",
        "stone_expense",
        "tenant_passthrough",
        "both",
      ],
      geometry_target: ["development", "asset", "unit"],
      import_row_class: [
        "new",
        "duplicate",
        "possible_duplicate",
        "conflict",
        "incomplete",
      ],
      import_row_decision: ["pending", "accept", "skip"],
      import_status: ["uploaded", "parsed", "reviewed", "applied", "rejected"],
      invitation_status: ["pending", "accepted", "revoked", "expired"],
      lease_status: ["draft", "active", "expired", "terminated", "void"],
      link_target: [
        "development",
        "asset",
        "unit",
        "lease",
        "tenant",
        "charge",
        "payment",
        "expense",
        "legal_entity",
        "import_batch",
      ],
      membership_status: ["active", "suspended"],
      occupancy_status: ["unknown", "occupied", "vacant", "unavailable"],
      payment_method: ["transfer", "cash", "check", "card", "other"],
      period_status: ["open", "under_review", "closed"],
      periodicity: ["monthly", "bimonthly", "quarterly", "annual", "variable"],
      severity: ["info", "warning", "danger"],
      surface_kind: ["legal", "cadastral", "built", "rentable", "gis_estimate"],
      tax_treatment: ["iva_incluido", "mas_iva", "exento"],
      truth_source: ["excel", "stone"],
      unit_kind: [
        "bodega",
        "local",
        "oficina",
        "terreno",
        "lote",
        "departamento",
        "edificio",
        "otro",
      ],
      unit_lifecycle: ["active", "prospect", "sold", "inactive"],
      verification_status: ["confirmado", "por_verificar", "no_disponible"],
    },
  },
} as const
