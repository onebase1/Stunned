export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          whatsapp_number: string | null
          budget_min: number | null
          budget_max: number | null
          preferred_bedrooms: number | null
          preferred_location: string | null
          special_requirements: string | null
          lead_source: string | null
          current_stage: string
          priority_level: string
          assigned_agent: string | null
          created_at: string
          updated_at: string
          last_contact_date: string | null
          next_follow_up_date: string | null
          status: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          whatsapp_number?: string | null
          budget_min?: number | null
          budget_max?: number | null
          preferred_bedrooms?: number | null
          preferred_location?: string | null
          special_requirements?: string | null
          lead_source?: string | null
          current_stage?: string
          priority_level?: string
          assigned_agent?: string | null
          created_at?: string
          updated_at?: string
          last_contact_date?: string | null
          next_follow_up_date?: string | null
          status?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          whatsapp_number?: string | null
          budget_min?: number | null
          budget_max?: number | null
          preferred_bedrooms?: number | null
          preferred_location?: string | null
          special_requirements?: string | null
          lead_source?: string | null
          current_stage?: string
          priority_level?: string
          assigned_agent?: string | null
          created_at?: string
          updated_at?: string
          last_contact_date?: string | null
          next_follow_up_date?: string | null
          status?: string
        }
      }
      properties: {
        Row: {
          id: string
          property_name: string
          property_type: string | null
          bedrooms: number | null
          bathrooms: number | null
          square_feet: number | null
          price: number | null
          location: string | null
          description: string | null
          amenities: string[] | null
          construction_status: string | null
          completion_percentage: number
          estimated_completion_date: string | null
          actual_completion_date: string | null
          images: string[] | null
          floor_plan_url: string | null
          virtual_tour_url: string | null
          available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_name: string
          property_type?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          price?: number | null
          location?: string | null
          description?: string | null
          amenities?: string[] | null
          construction_status?: string | null
          completion_percentage?: number
          estimated_completion_date?: string | null
          actual_completion_date?: string | null
          images?: string[] | null
          floor_plan_url?: string | null
          virtual_tour_url?: string | null
          available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_name?: string
          property_type?: string | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          price?: number | null
          location?: string | null
          description?: string | null
          amenities?: string[] | null
          construction_status?: string | null
          completion_percentage?: number
          estimated_completion_date?: string | null
          actual_completion_date?: string | null
          images?: string[] | null
          floor_plan_url?: string | null
          virtual_tour_url?: string | null
          available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      client_property_matches: {
        Row: {
          id: string
          client_id: string
          property_id: string
          match_score: number | null
          status: string | null
          viewing_date: string | null
          offer_amount: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          property_id: string
          match_score?: number | null
          status?: string | null
          viewing_date?: string | null
          offer_amount?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          property_id?: string
          match_score?: number | null
          status?: string | null
          viewing_date?: string | null
          offer_amount?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contracts: {
        Row: {
          id: string
          client_id: string
          property_id: string
          contract_number: string | null
          contract_type: string | null
          total_amount: number | null
          down_payment: number | null
          contract_date: string | null
          expected_completion_date: string | null
          contract_status: string | null
          contract_file_url: string | null
          signed_date: string | null
          terms_conditions: string | null
          special_clauses: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          property_id: string
          contract_number?: string | null
          contract_type?: string | null
          total_amount?: number | null
          down_payment?: number | null
          contract_date?: string | null
          expected_completion_date?: string | null
          contract_status?: string | null
          contract_file_url?: string | null
          signed_date?: string | null
          terms_conditions?: string | null
          special_clauses?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          property_id?: string
          contract_number?: string | null
          contract_type?: string | null
          total_amount?: number | null
          down_payment?: number | null
          contract_date?: string | null
          expected_completion_date?: string | null
          contract_status?: string | null
          contract_file_url?: string | null
          signed_date?: string | null
          terms_conditions?: string | null
          special_clauses?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      heritage100_users: {
        Row: {
          id: string
          user_id: string | null
          email: string
          first_name: string | null
          last_name: string | null
          role: string
          permissions: string[] | null
          assigned_clients: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          permissions?: string[] | null
          assigned_clients?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          first_name?: string | null
          last_name?: string | null
          role?: string
          permissions?: string[] | null
          assigned_clients?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_heritage100_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_heritage100_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_heritage100_manager_or_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      can_access_client: {
        Args: {
          client_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
