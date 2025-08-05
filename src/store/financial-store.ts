import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  deleteTransaction: (id: string) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  
  // Budget actions
  addBudget: (budget: Omit<BudgetItem, 'id'>) => void
  updateBudget: (id: string, budget: Partial<BudgetItem>) => void
  deleteBudget: (id: string) => void
  
  // Goal actions
  addGoal: (goal: Omit<SavingsGoal, 'id'>) => void
  updateGoal: (id: string, goal: Partial<SavingsGoal>) => void
  deleteGoal: (id: string) => void
  
  // Computed values
  getTotalIncome: () => number
  getTotalExpenses: () => number
  getBalance: () => number
  getSpendingByCategory: () => { [key: string]: number }
  getBudgetStatus: () => { [key: string]: { spent: number; budgeted: number; remaining: number } }
}

export const useFinancialStore = create<FinancialState>()(
  persist(
    (set, get) => ({
      transactions: [
        {
          id: '1',
          description: 'Salary Deposit',
          amount: 420000,
          category: 'Income',
          date: new Date(2024, 7, 1),
          type: 'income'
        },
        {
          id: '2',
          description: 'Grocery Store',
          amount: -8550,
          category: 'Food',
          date: new Date(2024, 7, 3),
          type: 'expense'
        },
        {
          id: '3',
          description: 'Gas Station',
          amount: -4520,
          category: 'Transport',
          date: new Date(2024, 7, 2),
          type: 'expense'
        }
      ],
      
      budgets: [
        { id: '1', category: 'Food', budgeted: 50000, spent: 24500, month: '2024-08' },
        { id: '2', category: 'Transport', budgeted: 30000, spent: 12500, month: '2024-08' },
        { id: '3', category: 'Entertainment', budgeted: 20000, spent: 8900, month: '2024-08' },
      ],
      
      goals: [
        {
          id: '1',
          name: 'Emergency Fund',
          targetAmount: 1000000,
          currentAmount: 650000,
          deadline: new Date(2024, 11, 31),
          description: 'Build 6 months of expenses'
        },
        {
          id: '2',
          name: 'Vacation',
          targetAmount: 300000,
          currentAmount: 120000,
          deadline: new Date(2024, 10, 15),
          description: 'Summer vacation to Europe'
        }
      ],

      // Transaction actions
      addTransaction: (transaction) => set((state) => ({
        transactions: [
          ...state.transactions,
          { ...transaction, id: Date.now().toString() }
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

      // Budget actions
      addBudget: (budget) => set((state) => ({
        budgets: [
          ...state.budgets,
          { ...budget, id: Date.now().toString() }
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

      // Goal actions
      addGoal: (goal) => set((state) => ({
        goals: [
          ...state.goals,
          { ...goal, id: Date.now().toString() }
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
    }
  )
)