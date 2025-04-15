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
      ai_chat_history: {
        Row: {
          content: string
          document_id: string
          id: string
          role: string
          timestamp: string
          user_id: string
        }
        Insert: {
          content: string
          document_id: string
          id?: string
          role: string
          timestamp?: string
          user_id: string
        }
        Update: {
          content?: string
          document_id?: string
          id?: string
          role?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          archived: boolean | null
          content: string | null
          dueDate: string | null
          id: string
          last_modified: string
          moduleNumber: string | null
          references_count: number
          snippet: string
          title: string
          user_id: string
        }
        Insert: {
          archived?: boolean | null
          content?: string | null
          dueDate?: string | null
          id?: string
          last_modified?: string
          moduleNumber?: string | null
          references_count?: number
          snippet: string
          title?: string
          user_id?: string
        }
        Update: {
          archived?: boolean | null
          content?: string | null
          dueDate?: string | null
          id?: string
          last_modified?: string
          moduleNumber?: string | null
          references_count?: number
          snippet?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      knowledge_base_references: {
        Row: {
          authors: string[]
          citation_format: string | null
          date_added: string
          discipline: string | null
          document_id: string | null
          has_pdf: boolean
          id: string
          is_favorite: boolean
          pdf_path: string | null
          source_url: string | null
          sumary: string | null
          tags: string[] | null
          title: string
          type: string
          usage_count: number
          user_id: string
          year: string
        }
        Insert: {
          authors?: string[]
          citation_format?: string | null
          date_added?: string
          discipline?: string | null
          document_id?: string | null
          has_pdf?: boolean
          id?: string
          is_favorite?: boolean
          pdf_path?: string | null
          source_url?: string | null
          sumary?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          usage_count?: number
          user_id: string
          year?: string
        }
        Update: {
          authors?: string[]
          citation_format?: string | null
          date_added?: string
          discipline?: string | null
          document_id?: string | null
          has_pdf?: boolean
          id?: string
          is_favorite?: boolean
          pdf_path?: string | null
          source_url?: string | null
          sumary?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          usage_count?: number
          user_id?: string
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_base_references_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      references: {
        Row: {
          authors: Json
          content: string | null
          created_at: string
          document_id: string
          format: string
          id: string
          source: string
          title: string
          url: string | null
          user_id: string
          year: string
        }
        Insert: {
          authors: Json
          content?: string | null
          created_at?: string
          document_id?: string
          format: string
          id?: string
          source: string
          title: string
          url?: string | null
          user_id?: string
          year: string
        }
        Update: {
          authors?: Json
          content?: string | null
          created_at?: string
          document_id?: string
          format?: string
          id?: string
          source?: string
          title?: string
          url?: string | null
          user_id?: string
          year?: string
        }
        Relationships: [
          {
            foreignKeyName: "references_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
