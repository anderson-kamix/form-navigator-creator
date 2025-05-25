export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string
          file_data: string
          file_name: string
          file_size: number | null
          file_type: string
          id: string
          question_id: string
          response_id: string
        }
        Insert: {
          created_at?: string
          file_data: string
          file_name: string
          file_size?: number | null
          file_type: string
          id?: string
          question_id: string
          response_id: string
        }
        Update: {
          created_at?: string
          file_data?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          id?: string
          question_id?: string
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "form_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      form_permissions: {
        Row: {
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string
          form_id: string
          granted_by: string
          id: string
          user_id: string
        }
        Insert: {
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string
          form_id: string
          granted_by: string
          id?: string
          user_id: string
        }
        Update: {
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string
          form_id?: string
          granted_by?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_permissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      form_responses: {
        Row: {
          form_id: string
          id: string
          ip_address: unknown | null
          submitted_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          form_id: string
          id?: string
          ip_address?: unknown | null
          submitted_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          form_id?: string
          id?: string
          ip_address?: unknown | null
          submitted_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_sections: {
        Row: {
          conditional_logic: Json | null
          created_at: string
          description: string | null
          form_id: string
          id: string
          order_index: number
          title: string
        }
        Insert: {
          conditional_logic?: Json | null
          created_at?: string
          description?: string | null
          form_id: string
          id?: string
          order_index: number
          title: string
        }
        Update: {
          conditional_logic?: Json | null
          created_at?: string
          description?: string | null
          form_id?: string
          id?: string
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_sections_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      forms: {
        Row: {
          cover: Json | null
          created_at: string
          description: string | null
          id: string
          published: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cover?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          published?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cover?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          published?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_answers: {
        Row: {
          answer: Json
          created_at: string
          id: string
          question_id: string
          response_id: string
        }
        Insert: {
          answer: Json
          created_at?: string
          id?: string
          question_id: string
          response_id: string
        }
        Update: {
          answer?: Json
          created_at?: string
          id?: string
          question_id?: string
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_answers_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "form_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          allow_attachments: boolean | null
          conditional_logic: Json | null
          created_at: string
          id: string
          options: Json | null
          order_index: number
          rating_icon: string | null
          rating_scale: number | null
          required: boolean | null
          score_config: Json | null
          section_id: string
          title: string
          type: string
        }
        Insert: {
          allow_attachments?: boolean | null
          conditional_logic?: Json | null
          created_at?: string
          id?: string
          options?: Json | null
          order_index: number
          rating_icon?: string | null
          rating_scale?: number | null
          required?: boolean | null
          score_config?: Json | null
          section_id: string
          title: string
          type: string
        }
        Update: {
          allow_attachments?: boolean | null
          conditional_logic?: Json | null
          created_at?: string
          id?: string
          options?: Json | null
          order_index?: number
          rating_icon?: string | null
          rating_scale?: number | null
          required?: boolean | null
          score_config?: Json | null
          section_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "form_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_form_permission: {
        Args: { form_id: string; permission_type?: string }
        Returns: boolean
      }
      is_master_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      user_type: "master_admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_type: ["master_admin", "user"],
    },
  },
} as const
