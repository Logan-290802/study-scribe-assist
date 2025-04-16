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
      authors: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name: string
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string
        }
        Relationships: []
      }
      citation_formats: {
        Row: {
          created_at: string | null
          id: string
          name: string
          template: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          template: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          template?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      document_versions: {
        Row: {
          content: string | null
          created_at: string | null
          document_id: string | null
          id: string
          title: string
          user_id: string
          version_number: number
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          title: string
          user_id: string
          version_number: number
        }
        Update: {
          content?: string | null
          created_at?: string | null
          document_id?: string | null
          id?: string
          title?: string
          user_id?: string
          version_number?: number
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
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "v_document_overview"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "fk_document_versions_document"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_document_versions_document"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "v_document_overview"
            referencedColumns: ["document_id"]
          },
        ]
      }
      documents: {
        Row: {
          archived: boolean | null
          content: string | null
          document_type: string | null
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
          document_type?: string | null
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
          document_type?: string | null
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
      knowledge_base: {
        Row: {
          authors: string[] | null
          content: string
          created_at: string
          document_id: string | null
          file_path: string | null
          file_type: string | null
          format: string | null
          id: string
          source: string | null
          title: string
          url: string | null
          user_id: string
          year: string | null
        }
        Insert: {
          authors?: string[] | null
          content: string
          created_at?: string
          document_id?: string | null
          file_path?: string | null
          file_type?: string | null
          format?: string | null
          id?: string
          source?: string | null
          title: string
          url?: string | null
          user_id: string
          year?: string | null
        }
        Update: {
          authors?: string[] | null
          content?: string
          created_at?: string
          document_id?: string | null
          file_path?: string | null
          file_type?: string | null
          format?: string | null
          id?: string
          source?: string | null
          title?: string
          url?: string | null
          user_id?: string
          year?: string | null
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
          {
            foreignKeyName: "knowledge_base_references_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "v_document_overview"
            referencedColumns: ["document_id"]
          },
        ]
      }
      reference_authors: {
        Row: {
          author_id: string
          order_position: number
          reference_id: string
        }
        Insert: {
          author_id: string
          order_position: number
          reference_id: string
        }
        Update: {
          author_id?: string
          order_position?: number
          reference_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reference_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reference_authors_reference_id_fkey"
            columns: ["reference_id"]
            isOneToOne: false
            referencedRelation: "reference_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_materials: {
        Row: {
          citation_format_id: string | null
          content: string | null
          created_at: string | null
          file_path: string | null
          id: string
          source: string | null
          title: string
          type: string
          updated_at: string | null
          url: string | null
          user_id: string
          year: string | null
        }
        Insert: {
          citation_format_id?: string | null
          content?: string | null
          created_at?: string | null
          file_path?: string | null
          id?: string
          source?: string | null
          title: string
          type: string
          updated_at?: string | null
          url?: string | null
          user_id: string
          year?: string | null
        }
        Update: {
          citation_format_id?: string | null
          content?: string | null
          created_at?: string | null
          file_path?: string | null
          id?: string
          source?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          url?: string | null
          user_id?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reference_materials_citation_format_id_fkey"
            columns: ["citation_format_id"]
            isOneToOne: false
            referencedRelation: "citation_formats"
            referencedColumns: ["id"]
          },
        ]
      }
      reference_usage: {
        Row: {
          context: string | null
          document_id: string | null
          id: string
          reference_id: string | null
          used_at: string | null
          user_id: string
        }
        Insert: {
          context?: string | null
          document_id?: string | null
          id?: string
          reference_id?: string | null
          used_at?: string | null
          user_id: string
        }
        Update: {
          context?: string | null
          document_id?: string | null
          id?: string
          reference_id?: string | null
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reference_usage_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reference_usage_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "v_document_overview"
            referencedColumns: ["document_id"]
          },
          {
            foreignKeyName: "reference_usage_reference_id_fkey"
            columns: ["reference_id"]
            isOneToOne: false
            referencedRelation: "reference_materials"
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
          file_path: string | null
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
          file_path?: string | null
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
          file_path?: string | null
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
          {
            foreignKeyName: "references_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "v_document_overview"
            referencedColumns: ["document_id"]
          },
        ]
      }
    }
    Views: {
      v_document_overview: {
        Row: {
          ai_message_count: number | null
          document_id: string | null
          document_type: string | null
          dueDate: string | null
          last_modified: string | null
          moduleNumber: string | null
          reference_count: number | null
          references_count: number | null
          title: string | null
          user_id: string | null
          version_count: number | null
        }
        Relationships: []
      }
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
