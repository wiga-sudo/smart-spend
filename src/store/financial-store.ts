import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/integrations/supabase/client'

export interface Transaction {
  id: string
  description: string
  amount: number
  category: string
  date: Date
  type: 'income' | 'expense'
}

export interface BudgetItem {
  id: string
  category: string
  budgeted: number
  spent: number
  month: string
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline: Date
  description?: string
}

interface FinancialState {
  transactions: Transaction[]
  budgets: BudgetItem[]
  goals: SavingsGoal[]
  monthlyBudget: number
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  deleteTransaction: (id: string) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  syncTransactionToSupabase: (transaction: Transaction) => Promise<void>
  
  // Budget actions
  addBudget: (budget: Omit<BudgetItem, 'id'>) => void
  updateBudget: (id: string, budget: Partial<BudgetItem>) => void
  deleteBudget: (id: string) => void
  setMonthlyBudget: (amount: number) => void
  syncBudgetToSupabase: (budget: BudgetItem) => Promise<void>
  
  // Goal actions
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void
  updateGoal: (id: string, goal: Partial<SavingsGoal>) => void
  deleteGoal: (id: string) => void
  syncGoalToSupabase: (goal: SavingsGoal) => Promise<void>
  
  // Computed values
  getTotalIncome: () => number
  getTotalExpenses: () => number
  getBudgetedExpenses: () => number
  getTotalBudgetAmount: () => number 
  getBalance: () => number
  getSpendingByCategory: () => { [key: string]: number }
  getBudgetStatus: () => { [key: string]: { spent: number; budgeted: number; remaining: number } }
}

export const useFinancialStore = create<FinancialState>()(
  persist(
    (set, get) => ({
      transactions: [],
      budgets: [],
      goals: [],
      monthlyBudget: 0,
      // Transaction actions
      addTransaction: (transaction) => set((state) => ({
        transactions: [
          ...state.transactions,
          { ...transaction, id: crypto.randomUUID() }
        ]
      })),

      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      })),

      updateTransaction: (id, updates) => set((state) => ({
        transactions: state.transactions.map(t => 
          t.id === id ? { ...t, ...updates } : t
        )
      })),

      syncTransactionToSupabase: async (transaction) => {
        try {
          const user = supabase.auth.getUser();
          if (!user) return;

          const { error } = await supabase
            .from('transactions')
            .upsert({
              id: transaction.id,
              user_id: (await user).data.user?.id,
              description: transaction.description,
              amount: transaction.amount,
              category: transaction.category,
              date: transaction.date.toISOString(),
              type: transaction.type
            });

          if (error) {
            console.error('Error syncing transaction:', error);
          }
        } catch (error) {
          console.error('Error syncing transaction:', error);
        }
      },

      // Budget actions
      addBudget: (budget) => set((state) => ({
        budgets: [
          ...state.budgets,
          { ...budget, id: crypto.randomUUID() }
        ]
      })),

      updateBudget: (id, updates) => set((state) => ({
        budgets: state.budgets.map(b => 
          b.id === id ? { ...b, ...updates } : b
        )
      })),

      deleteBudget: (id) => set((state) => ({
        budgets: state.budgets.filter(b => b.id !== id)
      })),

      syncBudgetToSupabase: async (budget) => {
        try {
          const user = supabase.auth.getUser();
          if (!user) return;

          const { error } = await supabase
            .from('budget_items')
            .upsert({
              id: budget.id,
              user_id: (await user).data.user?.id,
              category: budget.category,
              budgeted_amount: budget.budgeted,
              spent_amount: budget.spent,
              month: budget.month
            });

          if (error) {
            console.error('Error syncing budget:', error);
          }
        } catch (error) {
          console.error('Error syncing budget:', error);
        }
      },

      // Goal actions
      addGoal: (goal) => set((state) => ({
        goals: [
          ...state.goals,
          { ...goal, id: crypto.randomUUID() }
        ]
      })),

      updateGoal: (id, updates) => set((state) => ({
        goals: state.goals.map(g => 
          g.id === id ? { ...g, ...updates } : g
        )
      })),

      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(g => g.id !== id)
      })),

      syncGoalToSupabase: async (goal) => {
        try {
          const user = supabase.auth.getUser();
          if (!user) return;

          const { error } = await supabase
            .from('savings_goals')
            .upsert({
              id: goal.id,
              user_id: (await user).data.user?.id,
              name: goal.name,
              target_amount: goal.targetAmount,
              current_amount: goal.currentAmount,
              deadline: goal.deadline.toISOString(),
              description: goal.description
            });

          if (error) {
            console.error('Error syncing goal:', error);
          }
        } catch (error) {
          console.error('Error syncing goal:', error);
        }
      },

      setMonthlyBudget: (amount) => set({ monthlyBudget: amount }),

      getBudgetedExpenses: () => {
        const { transactions, budgets } = get()
        const budgetCategories = budgets.map(b => b.category)
        
        return Math.abs(transactions
          .filter(t => t.type === 'expense' && budgetCategories.includes(t.category))
          .reduce((sum, t) => sum + t.amount, 0))
      },
      getTotalBudgetAmount: () => {
        const { budgets } = get()
          return budgets.reduce((sum, budget) => sum + budget.budgeted, 0)
      },
      // Computed values
      getTotalIncome: () => {
        const { transactions } = get()
        return transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
      },

      getTotalExpenses: () => {
        const { transactions } = get()
        return Math.abs(transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0))
      },

      getBalance: () => {
        const { getTotalIncome, getTotalExpenses } = get()
        return getTotalIncome() - getTotalExpenses()
      },

      getSpendingByCategory: () => {
        const { transactions } = get()
        const spending: { [key: string]: number } = {}
        
        transactions
          .filter(t => t.type === 'expense')
          .forEach(t => {
            spending[t.category] = (spending[t.category] || 0) + Math.abs(t.amount)
          })
        
        return spending
      },

      getBudgetStatus: () => {
        const { budgets } = get()
        const status: { [key: string]: { spent: number; budgeted: number; remaining: number } } = {}
        
        budgets.forEach(b => {
          status[b.category] = {
            spent: b.spent,
            budgeted: b.budgeted,
            remaining: b.budgeted - b.spent
          }
        })
        
        return status
      }
    }),
    {
      name: 'smartspend-storage',
      // Clear storage when user changes (sign out/sign in)
      version: 1,
      partialize: (state) => ({
        transactions: state.transactions,
        budgets: state.budgets,
        goals: state.goals,
        monthlyBudget: state.monthlyBudget
      }),
      // Merge function to handle data migration
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
      })
    }
  )
)

// Helper function to clear all financial data (for new users or sign out)
export const clearFinancialData = () => {
  useFinancialStore.setState({
    transactions: [],
    budgets: [],
    goals: []
  })
}

// Helper function to import transactions from CSV
export const importTransactionsFromCSV = (csvData: string) => {
  // This will be implemented to parse CSV and add transactions
  console.log('CSV import functionality to be implemented', csvData)
}

// Helper function to import budget from Excel/CSV
export const importBudgetFromFile = (fileData: string) => {
  // This will be implemented to parse Excel/CSV and add budget items
  console.log('Budget import functionality to be implemented', fileData)
};