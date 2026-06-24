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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      cohort_members: {
        Row: {
          cohort_id: string
          enrolled_at: string | null
          status: Database["public"]["Enums"]["member_status"] | null
          user_id: string
        }
        Insert: {
          cohort_id: string
          enrolled_at?: string | null
          status?: Database["public"]["Enums"]["member_status"] | null
          user_id: string
        }
        Update: {
          cohort_id?: string
          enrolled_at?: string | null
          status?: Database["public"]["Enums"]["member_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_members_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cohort_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          name: string | null
          program_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["cohort_status"] | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          name?: string | null
          program_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["cohort_status"] | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          name?: string | null
          program_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["cohort_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "cohorts_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
        }
        Relationships: []
      }
      learner_profiles: {
        Row: {
          background: string | null
          current_position: string | null
          primary_concern: string | null
          target_role: string | null
          updated_at: string | null
          user_id: string
          years_experience: number | null
        }
        Insert: {
          background?: string | null
          current_position?: string | null
          primary_concern?: string | null
          target_role?: string | null
          updated_at?: string | null
          user_id: string
          years_experience?: number | null
        }
        Update: {
          background?: string | null
          current_position?: string | null
          primary_concern?: string | null
          target_role?: string | null
          updated_at?: string | null
          user_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "learner_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_applications: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          linkedin_url: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"] | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          linkedin_url: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          linkedin_url?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_profiles: {
        Row: {
          available_days: string[] | null
          current_position: string | null
          hourly_rate_pence: number | null
          is_verified: boolean | null
          one_liner: string | null
          specialty: string[] | null
          stripe_account_id: string | null
          updated_at: string | null
          user_id: string
          years_in_healthcare: number | null
        }
        Insert: {
          available_days?: string[] | null
          current_position?: string | null
          hourly_rate_pence?: number | null
          is_verified?: boolean | null
          one_liner?: string | null
          specialty?: string[] | null
          stripe_account_id?: string | null
          updated_at?: string | null
          user_id: string
          years_in_healthcare?: number | null
        }
        Update: {
          available_days?: string[] | null
          current_position?: string | null
          hourly_rate_pence?: number | null
          is_verified?: boolean | null
          one_liner?: string | null
          specialty?: string[] | null
          stripe_account_id?: string | null
          updated_at?: string | null
          user_id?: string
          years_in_healthcare?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_sessions: {
        Row: {
          agora_channel: string | null
          cohort_id: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          learner_id: string
          mentor_id: string
          notes: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["session_status"] | null
        }
        Insert: {
          agora_channel?: string | null
          cohort_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          learner_id: string
          mentor_id: string
          notes?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["session_status"] | null
        }
        Update: {
          agora_channel?: string | null
          cohort_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          learner_id?: string
          mentor_id?: string
          notes?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["session_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_sessions_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_sessions_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      microlearning_modules: {
        Row: {
          content_body: string | null
          content_type: Database["public"]["Enums"]["content_type"] | null
          content_url: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          milestone_id: string | null
          order_index: number | null
          pathway_id: string
          title: string
        }
        Insert: {
          content_body?: string | null
          content_type?: Database["public"]["Enums"]["content_type"] | null
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          milestone_id?: string | null
          order_index?: number | null
          pathway_id: string
          title: string
        }
        Update: {
          content_body?: string | null
          content_type?: Database["public"]["Enums"]["content_type"] | null
          content_url?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          milestone_id?: string | null
          order_index?: number | null
          pathway_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "microlearning_modules_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "microlearning_modules_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: false
            referencedRelation: "pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_completions: {
        Row: {
          completed_at: string | null
          evidence_url: string | null
          id: string
          milestone_id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          evidence_url?: string | null
          id?: string
          milestone_id: string
          notes?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          evidence_url?: string | null
          id?: string
          milestone_id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_completions_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestone_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          description: string | null
          id: string
          is_required: boolean | null
          milestone_type: Database["public"]["Enums"]["milestone_type"] | null
          order_index: number
          pathway_id: string
          title: string
        }
        Insert: {
          description?: string | null
          id?: string
          is_required?: boolean | null
          milestone_type?: Database["public"]["Enums"]["milestone_type"] | null
          order_index: number
          pathway_id: string
          title: string
        }
        Update: {
          description?: string | null
          id?: string
          is_required?: boolean | null
          milestone_type?: Database["public"]["Enums"]["milestone_type"] | null
          order_index?: number
          pathway_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: false
            referencedRelation: "pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      pathways: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          estimated_weeks: number | null
          id: string
          is_published: boolean | null
          source_background: string | null
          target_role: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          estimated_weeks?: number | null
          id?: string
          is_published?: boolean | null
          source_background?: string | null
          target_role?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          estimated_weeks?: number | null
          id?: string
          is_published?: boolean | null
          source_background?: string | null
          target_role?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "pathways_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_pence: number
          created_at: string | null
          currency: string | null
          id: string
          item_type: Database["public"]["Enums"]["payment_item_type"] | null
          program_id: string | null
          session_id: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          amount_pence: number
          created_at?: string | null
          currency?: string | null
          id?: string
          item_type?: Database["public"]["Enums"]["payment_item_type"] | null
          program_id?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          amount_pence?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          item_type?: Database["public"]["Enums"]["payment_item_type"] | null
          program_id?: string | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mentor_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          item_type: Database["public"]["Enums"]["portfolio_item_type"] | null
          milestone_completion_id: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          item_type?: Database["public"]["Enums"]["portfolio_item_type"] | null
          milestone_completion_id?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          item_type?: Database["public"]["Enums"]["portfolio_item_type"] | null
          milestone_completion_id?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_milestone_completion_id_fkey"
            columns: ["milestone_completion_id"]
            isOneToOne: false
            referencedRelation: "milestone_completions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string | null
          id: string
          linkedin_url: string | null
          role: Database["public"]["Enums"]["user_role"]
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          linkedin_url?: string | null
          role: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          linkedin_url?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          max_cohort_size: number | null
          mentor_id: string
          pathway_id: string
          price_pence: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          max_cohort_size?: number | null
          mentor_id: string
          pathway_id: string
          price_pence?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          max_cohort_size?: number | null
          mentor_id?: string
          pathway_id?: string
          price_pence?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "programs_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: false
            referencedRelation: "pathways"
            referencedColumns: ["id"]
          },
        ]
      }
      user_pathway_progress: {
        Row: {
          completed_at: string | null
          current_milestone_id: string | null
          id: string
          pathway_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["progress_status"] | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          current_milestone_id?: string | null
          id?: string
          pathway_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["progress_status"] | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          current_milestone_id?: string | null
          id?: string
          pathway_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["progress_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pathway_progress_current_milestone_id_fkey"
            columns: ["current_milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_pathway_progress_pathway_id_fkey"
            columns: ["pathway_id"]
            isOneToOne: false
            referencedRelation: "pathways"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_pathway_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      application_status: "pending" | "approved" | "rejected"
      cohort_status: "forming" | "active" | "completed"
      content_type: "video" | "article" | "quiz" | "exercise"
      member_status: "active" | "graduated" | "dropped"
      milestone_type:
        | "exam_prep"
        | "application"
        | "interview"
        | "clinical"
        | "document"
        | "custom"
      payment_item_type: "session" | "program"
      payment_status: "pending" | "succeeded" | "failed" | "refunded"
      portfolio_item_type:
        | "milestone"
        | "certificate"
        | "project"
        | "reflection"
      progress_status: "active" | "paused" | "completed"
      session_status: "pending" | "confirmed" | "completed" | "cancelled"
      user_role: "learner" | "mentor" | "admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status: ["pending", "approved", "rejected"],
      cohort_status: ["forming", "active", "completed"],
      content_type: ["video", "article", "quiz", "exercise"],
      member_status: ["active", "graduated", "dropped"],
      milestone_type: [
        "exam_prep",
        "application",
        "interview",
        "clinical",
        "document",
        "custom",
      ],
      payment_item_type: ["session", "program"],
      payment_status: ["pending", "succeeded", "failed", "refunded"],
      portfolio_item_type: [
        "milestone",
        "certificate",
        "project",
        "reflection",
      ],
      progress_status: ["active", "paused", "completed"],
      session_status: ["pending", "confirmed", "completed", "cancelled"],
      user_role: ["learner", "mentor", "admin"],
    },
  },
} as const
