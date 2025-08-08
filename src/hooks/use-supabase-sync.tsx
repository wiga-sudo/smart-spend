import { useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useFinancialStore } from '@/store/financial-store';
import { useToast } from './use-toast';

export const useSupabaseSync = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    transactions,
    budgets,
    goals,
    addTransaction,
    addBudget,
    addGoal,
    updateTransaction,
    updateBudget,
    updateGoal,
    deleteTransaction,
    deleteBudget,
    deleteGoal
  } = useFinancialStore();

  // Sync transactions to Supabase
  const syncTransactionsToSupabase = useCallback(async () => {
    if (!user) return;

    try {
      // Get existing transactions from Supabase
      const { data: existingTransactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      // Sync local transactions to Supabase
      for (const transaction of transactions) {
        const exists = existingTransactions?.find(t => t.id === transaction.id);
        
        if (!exists) {
          const { error: insertError } = await supabase
            .from('transactions')
            .insert({
              id: transaction.id,
              user_id: user.id,
              description: transaction.description,
              amount: transaction.amount,
              category: transaction.category,
              date: transaction.date.toISOString(),
              type: transaction.type
            });

          if (insertError) {
            console.error('Error inserting transaction:', insertError);
          }
        }
      }

      // Sync Supabase transactions to local store
      for (const supabaseTransaction of existingTransactions || []) {
        const exists = transactions.find(t => t.id === supabaseTransaction.id);
        
        if (!exists) {
          addTransaction({
            id: supabaseTransaction.id,
            description: supabaseTransaction.description,
            amount: supabaseTransaction.amount,
            category: supabaseTransaction.category,
            date: new Date(supabaseTransaction.date),
            type: supabaseTransaction.type as 'income' | 'expense'
          });
        }
      }
    } catch (error) {
      console.error('Error syncing transactions:', error);
    }
  }, [user, transactions, addTransaction]);

  // Sync budgets to Supabase
  const syncBudgetsToSupabase = useCallback(async () => {
    if (!user) return;

    try {
      const { data: existingBudgets, error } = await supabase
        .from('budget_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching budgets:', error);
        return;
      }

      // Sync local budgets to Supabase
      for (const budget of budgets) {
        const exists = existingBudgets?.find(b => b.id === budget.id);
        
        if (!exists) {
          const { error: insertError } = await supabase
            .from('budget_items')
            .insert({
              id: budget.id,
              user_id: user.id,
              category: budget.category,
              budgeted_amount: budget.budgeted,
              spent_amount: budget.spent,
              month: budget.month
            });

          if (insertError) {
            console.error('Error inserting budget:', insertError);
          }
        } else {
          // Update if amounts have changed
          if (exists.spent_amount !== budget.spent || exists.budgeted_amount !== budget.budgeted) {
            const { error: updateError } = await supabase
              .from('budget_items')
              .update({
                budgeted_amount: budget.budgeted,
                spent_amount: budget.spent
              })
              .eq('id', budget.id);

            if (updateError) {
              console.error('Error updating budget:', updateError);
            }
          }
        }
      }

      // Sync Supabase budgets to local store
      for (const supabaseBudget of existingBudgets || []) {
        const exists = budgets.find(b => b.id === supabaseBudget.id);
        
        if (!exists) {
          addBudget({
            id: supabaseBudget.id,
            category: supabaseBudget.category,
            budgeted: supabaseBudget.budgeted_amount,
            spent: supabaseBudget.spent_amount,
            month: supabaseBudget.month
          });
        }
      }
    } catch (error) {
      console.error('Error syncing budgets:', error);
    }
  }, [user, budgets, addBudget]);

  // Sync goals to Supabase
  const syncGoalsToSupabase = useCallback(async () => {
    if (!user) return;

    try {
      const { data: existingGoals, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching goals:', error);
        return;
      }

      // Sync local goals to Supabase
      for (const goal of goals) {
        const exists = existingGoals?.find(g => g.id === goal.id);
        
        if (!exists) {
          const { error: insertError } = await supabase
            .from('savings_goals')
            .insert({
              id: goal.id,
              user_id: user.id,
              name: goal.name,
              target_amount: goal.targetAmount,
              current_amount: goal.currentAmount,
              deadline: goal.deadline.toISOString(),
              description: goal.description
            });

          if (insertError) {
            console.error('Error inserting goal:', insertError);
          }
        } else {
          // Update if current amount has changed
          if (exists.current_amount !== goal.currentAmount) {
            const { error: updateError } = await supabase
              .from('savings_goals')
              .update({
                current_amount: goal.currentAmount
              })
              .eq('id', goal.id);

            if (updateError) {
              console.error('Error updating goal:', updateError);
            }
          }
        }
      }

      // Sync Supabase goals to local store
      for (const supabaseGoal of existingGoals || []) {
        const exists = goals.find(g => g.id === supabaseGoal.id);
        
        if (!exists) {
          addGoal({
            id: supabaseGoal.id,
            name: supabaseGoal.name,
            targetAmount: supabaseGoal.target_amount,
            currentAmount: supabaseGoal.current_amount,
            deadline: new Date(supabaseGoal.deadline),
            description: supabaseGoal.description
          });
        }
      }
    } catch (error) {
      console.error('Error syncing goals:', error);
    }
  }, [user, goals, addGoal]);

  // Main sync function
  const syncAllData = useCallback(async () => {
    if (!user) return;

    try {
      await Promise.all([
        syncTransactionsToSupabase(),
        syncBudgetsToSupabase(),
        syncGoalsToSupabase()
      ]);
    } catch (error) {
      console.error('Error during full sync:', error);
      toast({
        title: "Sync Error",
        description: "Failed to sync data. Please check your connection.",
        variant: "destructive"
      });
    }
  }, [user, syncTransactionsToSupabase, syncBudgetsToSupabase, syncGoalsToSupabase, toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const subscriptions = [
      // Subscribe to transaction changes
      supabase
        .channel('transactions')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('Transaction change:', payload);
            // Handle real-time updates here
          }
        )
        .subscribe(),

      // Subscribe to budget changes
      supabase
        .channel('budget_items')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'budget_items', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('Budget change:', payload);
            // Handle real-time updates here
          }
        )
        .subscribe(),

      // Subscribe to goal changes
      supabase
        .channel('savings_goals')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'savings_goals', filter: `user_id=eq.${user.id}` },
          (payload) => {
            console.log('Goal change:', payload);
            // Handle real-time updates here
          }
        )
        .subscribe()
    ];

    return () => {
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [user]);

  // Initial sync when user logs in
  useEffect(() => {
    if (user) {
      syncAllData();
    }
  }, [user, syncAllData]);

  // Periodic sync every 5 minutes
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      syncAllData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user, syncAllData]);

  return {
    syncAllData,
    syncTransactionsToSupabase,
    syncBudgetsToSupabase,
    syncGoalsToSupabase
  };
};