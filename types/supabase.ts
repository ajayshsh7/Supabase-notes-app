export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: number
          user_id: string
          title: string
          content: string
          created_at: string
        }
        Insert: {
          user_id: string
          title: string
          content: string
          created_at?: string
        }
        Update: {
          title?: string
          content?: string
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
