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
      transactions: [],
      
      budgets: [],
      
      goals: [],

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
      // Clear storage when user changes (sign out/sign in)
      partialize: (state) => ({
        transactions: state.transactions,
        budgets: state.budgets,
        goals: state.goals
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
  try {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const transactions: Omit<Transaction, 'id'>[] = [];

    // Expected headers: description, amount, category, date, type
    const requiredHeaders = ['description', 'amount', 'category', 'date', 'type'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      // Parse and validate the transaction
      const amount = parseFloat(row.amount);
      const type = row.type.toLowerCase();
      
      if (isNaN(amount)) continue;
      if (!['income', 'expense'].includes(type)) continue;

      transactions.push({
        description: row.description || 'Imported transaction',
        amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
        category: row.category || 'Other',
        date: new Date(row.date) || new Date(),
        type: type as 'income' | 'expense'
      });
    }

    // Add transactions to store
    const { addTransaction } = useFinancialStore.getState();
    transactions.forEach(transaction => {
      addTransaction(transaction);
    });

    return { success: true, imported: transactions.length };
  } catch (error) {
    console.error('CSV import error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Helper function to import budget from Excel/CSV
export const importBudgetFromFile = (fileData: string) => {
  try {
    const lines = fileData.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('Budget file must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const budgets: Omit<BudgetItem, 'id'>[] = [];

    // Expected headers: category, budgeted, month
    const requiredHeaders = ['category', 'budgeted', 'month'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length !== headers.length) continue;

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      const budgeted = parseFloat(row.budgeted);
      if (isNaN(budgeted)) continue;

      budgets.push({
        category: row.category || 'Other',
        budgeted: budgeted,
        spent: 0, // Will be calculated based on transactions
        month: row.month || new Date().toISOString().slice(0, 7)
      });
    }

    // Add budgets to store
    const { addBudget } = useFinancialStore.getState();
    budgets.forEach(budget => {
      addBudget(budget);
    });

    return { success: true, imported: budgets.length };
  } catch (error) {
    console.error('Budget import error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Helper function to export transactions to CSV
export const exportTransactionsToCSV = () => {
  const { transactions } = useFinancialStore.getState();
  
  if (transactions.length === 0) {
    return { success: false, error: 'No transactions to export' };
  }

  const headers = ['description', 'amount', 'category', 'date', 'type'];
  const csvContent = [
    headers.join(','),
    ...transactions.map(t => [
      `"${t.description}"`,
      Math.abs(t.amount).toString(),
      `"${t.category}"`,
      t.date.toISOString().split('T')[0],
      t.type
    ].join(','))
  ].join('\n');

  return { success: true, data: csvContent, filename: `transactions_${new Date().toISOString().split('T')[0]}.csv` };
};

// Helper function to export budgets to CSV
export const exportBudgetsToCSV = () => {
  const { budgets } = useFinancialStore.getState();
  
  if (budgets.length === 0) {
    return { success: false, error: 'No budgets to export' };
  }

  const headers = ['category', 'budgeted', 'spent', 'month'];
  const csvContent = [
    headers.join(','),
    ...budgets.map(b => [
      `"${b.category}"`,
      b.budgeted.toString(),
      b.spent.toString(),
      b.month
    ].join(','))
  ].join('\n');

  return { success: true, data: csvContent, filename: `budgets_${new Date().toISOString().split('T')[0]}.csv` };
};

// Helper function to export all financial data as JSON
export const exportAllDataToJSON = () => {
  const { transactions, budgets, goals } = useFinancialStore.getState();
  
  const data = {
    transactions,
    budgets,
    goals,
    exportDate: new Date().toISOString(),
    version: '1.0'
  };

  return { 
    success: true, 
    data: JSON.stringify(data, null, 2), 
    filename: `smartspend_backup_${new Date().toISOString().split('T')[0]}.json` 
  };
}; 