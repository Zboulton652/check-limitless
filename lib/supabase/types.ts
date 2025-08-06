export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: "user" | "admin"
          referrer_id: string | null
          referral_code: string
          payout_method: "bank_transfer" | "site_credit"
          bank_sort_code: string | null
          bank_account_number: string | null
          site_credit: number
          total_spent: number
          total_dividends: number
          total_referral_earnings: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: "user" | "admin"
          referrer_id?: string | null
          referral_code: string
          payout_method?: "bank_transfer" | "site_credit"
          bank_sort_code?: string | null
          bank_account_number?: string | null
          site_credit?: number
          total_spent?: number
          total_dividends?: number
          total_referral_earnings?: number
        }
        Update: {
          email?: string
          role?: "user" | "admin"
          payout_method?: "bank_transfer" | "site_credit"
          bank_sort_code?: string | null
          bank_account_number?: string | null
          site_credit?: number
          total_spent?: number
          total_dividends?: number
          total_referral_earnings?: number
        }
      }
      competitions: {
        Row: {
          id: string
          title: string
          description: string
          prize_image_url: string | null
          entry_price: number
          max_entries: number | null
          current_entries: number
          status: "active" | "ended" | "draft"
          start_date: string | null
          end_date: string | null
          winner_id: string | null
          terms_and_conditions: string | null
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          description: string
          prize_image_url?: string | null
          entry_price: number
          max_entries?: number | null
          status?: "active" | "ended" | "draft"
          start_date?: string | null
          end_date?: string | null
          terms_and_conditions?: string | null
          is_featured?: boolean
        }
        Update: {
          title?: string
          description?: string
          prize_image_url?: string | null
          entry_price?: number
          max_entries?: number | null
          status?: "active" | "ended" | "draft"
          start_date?: string | null
          end_date?: string | null
          winner_id?: string | null
          terms_and_conditions?: string | null
          is_featured?: boolean
        }
      }
      entries: {
        Row: {
          id: string
          user_id: string
          competition_id: string
          stripe_payment_intent_id: string | null
          amount_paid: number
          created_at: string
        }
        Insert: {
          user_id: string
          competition_id: string
          stripe_payment_intent_id?: string | null
          amount_paid: number
        }
        Update: {
          stripe_payment_intent_id?: string | null
        }
      }
      dividends: {
        Row: {
          id: string
          user_id: string
          amount: number
          period_start: string
          period_end: string
          type: "immediate" | "deferred"
          payout_method: string
          status: string
          paid_at: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          amount: number
          period_start: string
          period_end: string
          type?: "immediate" | "deferred"
          payout_method?: string
          status?: string
        }
        Update: {
          amount?: number
          type?: "immediate" | "deferred"
          payout_method?: string
          status?: string
          paid_at?: string | null
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referee_id: string
          earnings_percentage: number
          total_earned: number
          created_at: string
        }
        Insert: {
          referrer_id: string
          referee_id: string
          earnings_percentage?: number
        }
        Update: {
          total_earned?: number
        }
      }
    }
  }
}
