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
      books: {
        Row: {
          id: string
          code: string
          title: string
          author: string
          category: string
          subcategory: string | null
          description: string | null
          short_description: string | null
          isbn: string | null
          pages: number | null
          age_range: string | null
          language: string | null
          publisher: string | null
          publication_year: number | null
          cover_url: string | null
          status: string
          available: boolean
          qty_total: number
          qty_available: number
          price_uah: number | null
          full_price_uah: number | null
          location: string | null
          rating: number | null
          rating_count: number | null
          badges: string[] | null
          tags: string[] | null
          search_vector: unknown | null
          search_text: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          title: string
          author: string
          category: string
          subcategory?: string | null
          description?: string | null
          short_description?: string | null
          isbn?: string | null
          pages?: number | null
          age_range?: string | null
          language?: string | null
          publisher?: string | null
          publication_year?: number | null
          cover_url?: string | null
          status?: string
          available?: boolean
          qty_total?: number
          qty_available?: number
          price_uah?: number | null
          full_price_uah?: number | null
          location?: string | null
          rating?: number | null
          rating_count?: number | null
          badges?: string[] | null
          tags?: string[] | null
          search_vector?: unknown | null
          search_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          title?: string
          author?: string
          category?: string
          subcategory?: string | null
          description?: string | null
          short_description?: string | null
          isbn?: string | null
          pages?: number | null
          age_range?: string | null
          language?: string | null
          publisher?: string | null
          publication_year?: number | null
          cover_url?: string | null
          status?: string
          available?: boolean
          qty_total?: number
          qty_available?: number
          price_uah?: number | null
          full_price_uah?: number | null
          location?: string | null
          rating?: number | null
          rating_count?: number | null
          badges?: string[] | null
          tags?: string[] | null
          search_vector?: unknown | null
          search_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_requests: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          social: string | null
          plan: string
          payment_method: string
          message: string | null
          screenshot: string | null
          privacy_consent: boolean
          status: string
          admin_notes: string | null
          processed_at: string | null
          processed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          social?: string | null
          plan: string
          payment_method: string
          message?: string | null
          screenshot?: string | null
          privacy_consent?: boolean
          status?: string
          admin_notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          social?: string | null
          plan?: string
          payment_method?: string
          message?: string | null
          screenshot?: string | null
          privacy_consent?: boolean
          status?: string
          admin_notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      authors: {
        Row: {
          id: string
          name: string
          biography: string | null
          birth_year: number | null
          nationality: string | null
          website: string | null
          search_vector: unknown | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          biography?: string | null
          birth_year?: number | null
          nationality?: string | null
          website?: string | null
          search_vector?: unknown | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          biography?: string | null
          birth_year?: number | null
          nationality?: string | null
          website?: string | null
          search_vector?: unknown | null
          created_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          parent_id: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          color: string | null
          search_vector: unknown | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          color?: string | null
          search_vector?: unknown | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          color?: string | null
          search_vector?: unknown | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      book_authors: {
        Row: {
          book_id: string
          author_id: string
          role: string | null
        }
        Insert: {
          book_id: string
          author_id: string
          role?: string | null
        }
        Update: {
          book_id?: string
          author_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_authors_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          subscription_type: string | null
          subscription_start: string | null
          subscription_end: string | null
          status: string | null
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          subscription_type?: string | null
          subscription_start?: string | null
          subscription_end?: string | null
          status?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          subscription_type?: string | null
          subscription_start?: string | null
          subscription_end?: string | null
          status?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rentals: {
        Row: {
          id: string
          user_id: string
          book_id: string
          rental_date: string
          due_date: string | null
          return_date: string | null
          status: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          rental_date?: string
          due_date?: string | null
          return_date?: string | null
          status?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          rental_date?: string
          due_date?: string | null
          return_date?: string | null
          status?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rentals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rentals_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          }
        ]
      }
      payments: {
        Row: {
          id: string
          user_id: string
          amount_uah: number
          currency: string | null
          payment_method: string | null
          status: string | null
          transaction_id: string | null
          payment_date: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount_uah: number
          currency?: string | null
          payment_method?: string | null
          status?: string | null
          transaction_id?: string | null
          payment_date?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount_uah?: number
          currency?: string | null
          payment_method?: string | null
          status?: string | null
          transaction_id?: string | null
          payment_date?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      search_queries: {
        Row: {
          id: string
          query: string
          results_count: number | null
          search_time_ms: number | null
          user_agent: string | null
          ip_address: string | null
          filters: Json | null
          clicked_results: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          query: string
          results_count?: number | null
          search_time_ms?: number | null
          user_agent?: string | null
          ip_address?: string | null
          filters?: Json | null
          clicked_results?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          query?: string
          results_count?: number | null
          search_time_ms?: number | null
          user_agent?: string | null
          ip_address?: string | null
          filters?: Json | null
          clicked_results?: string[] | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_books: {
        Args: {
          query_text: string
          limit_count?: number
        }
        Returns: {
          id: string
          title: string
          author: string
          category: string
          subcategory: string | null
          cover_url: string | null
          rating: number | null
          rating_count: number | null
          available: boolean
          badges: string[] | null
          rank: number
        }[]
      }
      update_book_availability: {
        Args: {
          book_id: string
          qty_change: number
        }
        Returns: boolean
      }
      get_search_suggestions: {
        Args: {
          partial_query: string
          limit_count?: number
        }
        Returns: {
          suggestion: string
          type: string
          count: number
        }[]
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