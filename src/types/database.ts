export type Database = {
  public: {
    Tables: {
      user_settings: {
        Row: {
          id: string
          user_id: string
          timezone: string
          currency: 'CAD' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD'
          weekly_digest_enabled: boolean
          weekly_digest_day: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          timezone?: string
          currency?: 'CAD' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD'
          weekly_digest_enabled?: boolean
          weekly_digest_day?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          timezone?: string
          currency?: 'CAD' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD'
          weekly_digest_enabled?: boolean
          weekly_digest_day?: number
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          icon?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          icon?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          currency: 'CAD' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD'
          description: string | null
          expense_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          currency?: 'CAD' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD'
          description?: string | null
          expense_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          currency?: 'CAD' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD'
          description?: string | null
          expense_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          currency: 'CAD' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD'
          month: number
          year: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          currency?: 'CAD' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD'
          month: number
          year: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          currency?: 'CAD' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD'
          month?: number
          year?: number
          created_at?: string
          updated_at?: string
        }
      }
      budget_alerts: {
        Row: {
          id: string
          user_id: string
          category_id: string
          budget_id: string
          alert_type: 'budget_80_percent' | 'budget_exceeded'
          status: 'pending' | 'sent' | 'failed'
          month: number
          year: number
          sent_at: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          budget_id: string
          alert_type: 'budget_80_percent' | 'budget_exceeded'
          status?: 'pending' | 'sent' | 'failed'
          month: number
          year: number
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          budget_id?: string
          alert_type?: 'budget_80_percent' | 'budget_exceeded'
          status?: 'pending' | 'sent' | 'failed'
          month?: number
          year?: number
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
      weekly_digest_queue: {
        Row: {
          id: string
          user_id: string
          week_start_date: string
          week_end_date: string
          status: 'pending' | 'sent' | 'failed'
          sent_at: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_start_date: string
          week_end_date: string
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_start_date?: string
          week_end_date?: string
          status?: 'pending' | 'sent' | 'failed'
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      monthly_budget_overview: {
        Row: {
          user_id: string
          month: number
          year: number
          category_id: string
          category_name: string
          category_color: string
          category_icon: string | null
          budget_amount: number
          currency: 'CAD' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD'
          spent_amount: number
          remaining_amount: number
          percentage_used: number
          is_over_budget: boolean
          budget_created_at: string
          budget_updated_at: string
        }
      }
      monthly_expense_summary: {
        Row: {
          user_id: string
          year: number
          month: number
          category_id: string
          category_name: string
          category_color: string
          category_icon: string | null
          expense_count: number
          total_amount: number
          average_amount: number
          min_amount: number
          max_amount: number
          currency: 'CAD' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD'
        }
      }
      user_dashboard_current_month: {
        Row: {
          user_id: string
          timezone: string
          currency: 'CAD' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD'
          current_month: number
          current_year: number
          total_monthly_budget: number
          total_monthly_spent: number
          total_remaining_budget: number
          overall_percentage_used: number
          categories_with_budget: number
          categories_over_budget: number
          monthly_expense_count: number
        }
      }
    }
    Functions: {
      get_monthly_summary: {
        Args: {
          p_user_id: string
          p_month?: number
          p_year?: number
        }
        Returns: {
          category_id: string
          category_name: string
          category_color: string
          budget_amount: number
          spent_amount: number
          remaining_amount: number
          percentage_used: number
        }[]
      }
      get_recent_expenses: {
        Args: {
          p_user_id: string
          p_limit?: number
        }
        Returns: {
          id: string
          category_name: string
          category_color: string
          amount: number
          currency: 'CAD' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD'
          description: string | null
          expense_date: string
          created_at: string
        }[]
      }
    }
  }
}

