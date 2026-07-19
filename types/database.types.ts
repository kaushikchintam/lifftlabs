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
      account: {
        Row: {
          accessToken: string | null
          accessTokenExpiresAt: string | null
          accountId: string
          createdAt: string
          id: string
          idToken: string | null
          password: string | null
          providerId: string
          refreshToken: string | null
          refreshTokenExpiresAt: string | null
          scope: string | null
          updatedAt: string
          userId: string
        }
        Insert: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          accountId: string
          createdAt?: string
          id: string
          idToken?: string | null
          password?: string | null
          providerId: string
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
          updatedAt: string
          userId: string
        }
        Update: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          accountId?: string
          createdAt?: string
          id?: string
          idToken?: string | null
          password?: string | null
          providerId?: string
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_integrations: {
        Row: {
          access_token: string
          calendar_id: string | null
          channel_expiry: string | null
          channel_id: string | null
          created_at: string | null
          id: string
          mentor_id: string
          provider: string
          refresh_token: string
          renew_at: string | null
          resource_id: string | null
          status: string
          sync_token: string | null
          token_expiry: string
          updated_at: string | null
        }
        Insert: {
          access_token: string
          calendar_id?: string | null
          channel_expiry?: string | null
          channel_id?: string | null
          created_at?: string | null
          id?: string
          mentor_id: string
          provider?: string
          refresh_token: string
          renew_at?: string | null
          resource_id?: string | null
          status?: string
          sync_token?: string | null
          token_expiry: string
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          calendar_id?: string | null
          channel_expiry?: string | null
          channel_id?: string | null
          created_at?: string | null
          id?: string
          mentor_id?: string
          provider?: string
          refresh_token?: string
          renew_at?: string | null
          resource_id?: string | null
          status?: string
          sync_token?: string | null
          token_expiry?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_integrations_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "user"
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
            referencedRelation: "user"
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
      google_calendar_blockers: {
        Row: {
          blocker_range: unknown
          google_event_id: string
          id: string
          lifft_session_id: string | null
          mentor_id: string
          updated_at: string | null
        }
        Insert: {
          blocker_range: unknown
          google_event_id: string
          id?: string
          lifft_session_id?: string | null
          mentor_id: string
          updated_at?: string | null
        }
        Update: {
          blocker_range?: unknown
          google_event_id?: string
          id?: string
          lifft_session_id?: string | null
          mentor_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "google_calendar_blockers_lifft_session_id_fkey"
            columns: ["lifft_session_id"]
            isOneToOne: false
            referencedRelation: "mentor_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "google_calendar_blockers_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      learner_profiles: {
        Row: {
          background: string | null
          current_position: string | null
          linkedin_url: string | null
          primary_concern: string | null
          stripe_customer_id: string | null
          target_role: string | null
          updated_at: string | null
          user_id: string
          years_experience: number | null
        }
        Insert: {
          background?: string | null
          current_position?: string | null
          linkedin_url?: string | null
          primary_concern?: string | null
          stripe_customer_id?: string | null
          target_role?: string | null
          updated_at?: string | null
          user_id: string
          years_experience?: number | null
        }
        Update: {
          background?: string | null
          current_position?: string | null
          linkedin_url?: string | null
          primary_concern?: string | null
          stripe_customer_id?: string | null
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
            referencedRelation: "user"
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
        Relationships: []
      }
      mentor_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          mentor_id: string
          start_time: string
          timezone: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          mentor_id: string
          start_time: string
          timezone?: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          mentor_id?: string
          start_time?: string
          timezone?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_availability_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_open_slots: {
        Row: {
          created_at: string
          id: string
          mentor_id: string
          slot_range: unknown
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentor_id: string
          slot_range: unknown
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          mentor_id?: string
          slot_range?: unknown
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_open_slots_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_profiles: {
        Row: {
          available_days: string[] | null
          buffer_minutes: number
          charges_enabled: boolean
          current_position: string | null
          hourly_rate_pence: number | null
          is_verified: boolean | null
          max_sessions_per_day: number | null
          max_sessions_per_week: number | null
          min_notice_hours: number
          one_liner: string | null
          specialty: string[] | null
          stripe_account_id: string | null
          updated_at: string | null
          user_id: string
          years_in_healthcare: number | null
        }
        Insert: {
          available_days?: string[] | null
          buffer_minutes?: number
          charges_enabled?: boolean
          current_position?: string | null
          hourly_rate_pence?: number | null
          is_verified?: boolean | null
          max_sessions_per_day?: number | null
          max_sessions_per_week?: number | null
          min_notice_hours?: number
          one_liner?: string | null
          specialty?: string[] | null
          stripe_account_id?: string | null
          updated_at?: string | null
          user_id: string
          years_in_healthcare?: number | null
        }
        Update: {
          available_days?: string[] | null
          buffer_minutes?: number
          charges_enabled?: boolean
          current_position?: string | null
          hourly_rate_pence?: number | null
          is_verified?: boolean | null
          max_sessions_per_day?: number | null
          max_sessions_per_week?: number | null
          min_notice_hours?: number
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
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_sessions: {
        Row: {
          agora_channel: string | null
          booking_range: unknown
          created_at: string | null
          duration_minutes: number | null
          ends_at: string | null
          expires_at: string | null
          google_event_id: string | null
          id: string
          learner_id: string
          mentor_id: string
          notes: string | null
          reminder_sent_at: string | null
          scheduled_at: string | null
          slot_id: string | null
          status: Database["public"]["Enums"]["session_status"] | null
          stripe_checkout_id: string | null
          timezone: string
        }
        Insert: {
          agora_channel?: string | null
          booking_range?: unknown
          created_at?: string | null
          duration_minutes?: number | null
          ends_at?: string | null
          expires_at?: string | null
          google_event_id?: string | null
          id?: string
          learner_id: string
          mentor_id: string
          notes?: string | null
          reminder_sent_at?: string | null
          scheduled_at?: string | null
          slot_id?: string | null
          status?: Database["public"]["Enums"]["session_status"] | null
          stripe_checkout_id?: string | null
          timezone?: string
        }
        Update: {
          agora_channel?: string | null
          booking_range?: unknown
          created_at?: string | null
          duration_minutes?: number | null
          ends_at?: string | null
          expires_at?: string | null
          google_event_id?: string | null
          id?: string
          learner_id?: string
          mentor_id?: string
          notes?: string | null
          reminder_sent_at?: string | null
          scheduled_at?: string | null
          slot_id?: string | null
          status?: Database["public"]["Enums"]["session_status"] | null
          stripe_checkout_id?: string | null
          timezone?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_sessions_learner_id_fkey"
            columns: ["learner_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_sessions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_sessions_slot_id_fkey"
            columns: ["slot_id"]
            isOneToOne: false
            referencedRelation: "mentor_open_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
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
            referencedRelation: "user"
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
          session_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: [
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
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      session: {
        Row: {
          createdAt: string
          expiresAt: string
          id: string
          ipAddress: string | null
          token: string
          updatedAt: string
          userAgent: string | null
          userId: string
        }
        Insert: {
          createdAt?: string
          expiresAt: string
          id: string
          ipAddress?: string | null
          token: string
          updatedAt: string
          userAgent?: string | null
          userId: string
        }
        Update: {
          createdAt?: string
          expiresAt?: string
          id?: string
          ipAddress?: string | null
          token?: string
          updatedAt?: string
          userAgent?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_events: {
        Row: {
          id: string
          received_at: string
          type: string
        }
        Insert: {
          id: string
          received_at?: string
          type: string
        }
        Update: {
          id?: string
          received_at?: string
          type?: string
        }
        Relationships: []
      }
      user: {
        Row: {
          createdAt: string
          email: string
          emailVerified: boolean
          id: string
          image: string | null
          name: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          email: string
          emailVerified: boolean
          id: string
          image?: string | null
          name: string
          updatedAt?: string
        }
        Update: {
          createdAt?: string
          email?: string
          emailVerified?: boolean
          id?: string
          image?: string | null
          name?: string
          updatedAt?: string
        }
        Relationships: []
      }
      verification: {
        Row: {
          createdAt: string
          expiresAt: string
          id: string
          identifier: string
          updatedAt: string
          value: string
        }
        Insert: {
          createdAt?: string
          expiresAt: string
          id: string
          identifier: string
          updatedAt?: string
          value: string
        }
        Update: {
          createdAt?: string
          expiresAt?: string
          id?: string
          identifier?: string
          updatedAt?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_blocker_delta: {
        Args: { p_delete_ids: string[]; p_mentor_id: string; p_upserts: Json }
        Returns: number
      }
      confirm_session: { Args: { p_session_id: string }; Returns: boolean }
      hold_slot: {
        Args: {
          p_hold_minutes?: number
          p_learner_id: string
          p_slot_id: string
        }
        Returns: string
      }
      reconcile_open_slots: { Args: { p_mentor_id: string }; Returns: number }
      release_expired_holds: { Args: never; Returns: number }
      release_session: { Args: { p_session_id: string }; Returns: boolean }
      replace_mentor_blockers: {
        Args: { p_blockers: Json; p_mentor_id: string }
        Returns: number
      }
    }
    Enums: {
      application_status: "pending" | "approved" | "rejected"
      payment_item_type: "session" | "program"
      payment_status: "pending" | "succeeded" | "failed" | "refunded"
      session_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "expired"
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
      payment_item_type: ["session", "program"],
      payment_status: ["pending", "succeeded", "failed", "refunded"],
      session_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "expired",
      ],
    },
  },
} as const
