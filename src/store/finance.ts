// src/store/finance.ts
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface Card { id: string; name: string; currentBalance: number; limit?: number; color?: string; }
export interface Expense { id: string; name: string; expected: number; actual: number; paid: boolean; }
export interface Commitment {
  id: string; description: string; cardId: string; purchaseDate: string;
  totalAmount: number; monthlyAmount: number; installments: number;
  currentInstallment: number; recurring: boolean;
}

export const useFinanceStore = defineStore('finance', () => {
  const activeMonthKey = ref(new Date().toISOString().slice(0, 7)); // e.g. "2026-08"
  const isDataSaved = ref(true); // Tracks whether changes have been exported/saved
  const showUnsavedModal = ref(false); // Controls the close warning modal visibility

  const monthDatabase = ref<Record<string, {
    income: number;
    balance: number;
    savingsGoal: number;
    cards: Card[];
    expenses: Expense[];
    commitments: Commitment[];
  }>>({
    [activeMonthKey.value]: {
      income: 0,
      balance: 0,
      savingsGoal: 0,
      cards: [],
      expenses: [],
      commitments: []
    }
  });

  const currentData = computed(() => {
    if (!monthDatabase.value[activeMonthKey.value]) {
      const firstKey = Object.keys(monthDatabase.value)[0];
      monthDatabase.value[activeMonthKey.value] = JSON.parse(JSON.stringify(monthDatabase.value[firstKey]));
    }
    return monthDatabase.value[activeMonthKey.value];
  });

  const income = computed({
    get: () => currentData.value.income,
    set: (v) => { currentData.value.income = v; isDataSaved.value = false; }
  });

  const balance = computed({
    get: () => currentData.value.balance,
    set: (v) => { currentData.value.balance = v; isDataSaved.value = false; }
  });

  const savingsGoal = computed({
    get: () => currentData.value.savingsGoal,
    set: (v) => { currentData.value.savingsGoal = v; isDataSaved.value = false; }
  });

  const cards = computed(() => currentData.value.cards);
  const expenses = computed(() => currentData.value.expenses);
  const commitments = computed(() => currentData.value.commitments);

  const availableMonths = computed(() => {
    return Object.keys(monthDatabase.value).sort().map(mKey => {
      const [year, month] = mKey.split('-');
      const date = new Date(Number(year), Number(month) - 1, 1);
      const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
      return {
        key: mKey,
        label: label.charAt(0).toUpperCase() + label.slice(1)
      };
    });
  });

  const currentMonthLabel = computed(() => {
    const [year, month] = activeMonthKey.value.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    const formatted = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  });

  const fixedExpenses = computed(() =>
    expenses.value.reduce((acc, exp) => acc + exp.actual, 0)
  );

  const creditCommitments = computed(() => {
    const totals: Record<string, number> = {};
    cards.value.forEach(card => {
      totals[card.id] = 0;
    });
    commitments.value.forEach(c => {
      if (c.recurring || c.currentInstallment <= c.installments) {
        if (totals[c.cardId] !== undefined) {
          totals[c.cardId] += c.monthlyAmount;
        }
      }
    });
    return totals;
  });

  const monthlyCommitments = computed(() => {
    const totalCardBalances = cards.value.reduce((acc, card) => acc + card.currentBalance, 0);
    return totalCardBalances;
  });

  const availableToSpend = computed(() =>
    income.value - fixedExpenses.value - monthlyCommitments.value
  );

  const savingsTargetAmount = computed({
    get: () => savingsGoal.value,
    set: (val: number) => { savingsGoal.value = val; isDataSaved.value = false; }
  });

  const expectedBalance = computed(() =>
    balance.value + availableToSpend.value
  );

  const projection = computed(() => {
    const months = [];
    const [y, m] = activeMonthKey.value.split('-');
    const baseDate = new Date(Number(y), Number(m) - 1, 1);

    const allCardIds = cards.value.map(card => card.id);

    for (let i = 0; i < 6; i++) {
      const cardTotals: Record<string, number> = {};

      allCardIds.forEach(id => {
        cardTotals[id] = 0;
      });

      commitments.value.forEach(c => {
        const isActive = c.recurring || (c.currentInstallment + i <= c.installments);
        if (isActive && cardTotals[c.cardId] !== undefined) {
          cardTotals[c.cardId] += c.monthlyAmount;
        }
      });

      if (i === 0) {
        cards.value.forEach(card => {
          cardTotals[card.id] = card.currentBalance;
        });
      }

      months.push({
        label: new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1)),
        ...cardTotals,
        isCurrent: i === 0
      });
    }
    return months;
  });

  function getCardCommitmentsSum(cardId: string, customCommitments?: Commitment[]): number {
    const list = customCommitments || commitments.value;
    return list
      .filter(c => c.cardId === cardId && (c.recurring || c.currentInstallment <= c.installments))
      .reduce((sum, c) => sum + c.monthlyAmount, 0);
  }

  function updateCardBalance(cardId: string, newBalance: number) {
    const targetCard = cards.value.find(card => card.id === cardId);
    if (!targetCard) return;

    const minAllowed = getCardCommitmentsSum(cardId);
    targetCard.currentBalance = Math.max(newBalance, minAllowed);
    isDataSaved.value = false;
  }

  function addCommitment(c: Omit<Commitment, 'id' | 'currentInstallment' | 'monthlyAmount'>) {
    const monthlyAmount = c.recurring ? c.totalAmount : (c.totalAmount / c.installments);
    commitments.value.push({
      ...c,
      id: Math.random().toString(36).substr(2, 9),
      currentInstallment: 1,
      monthlyAmount
    });

    const targetCard = cards.value.find(card => card.id === c.cardId);
    if (targetCard) {
      targetCard.currentBalance += monthlyAmount;
    }
    isDataSaved.value = false;
  }

  function deleteCommitment(id: string) {
    const index = commitments.value.findIndex(x => x.id === id);
    if (index !== -1) {
      const commitment = commitments.value[index];

      const targetCard = cards.value.find(card => card.id === commitment.cardId);
      if (targetCard) {
        targetCard.currentBalance = Math.max(0, targetCard.currentBalance - commitment.monthlyAmount);
      }

      commitments.value.splice(index, 1);
      isDataSaved.value = false;
    }
  }

  function addCard(card: Omit<Card, 'id'>) {
    const id = card.name.toLowerCase().replace(/\s+/g, '_') + '_' + Math.random().toString(36).substr(2, 4);
    cards.value.push({
      id,
      name: card.name,
      currentBalance: card.currentBalance || 0,
      limit: card.limit || 0,
      color: card.color || '#3B82F6'
    });
    isDataSaved.value = false;
  }

  function deleteCard(id: string) {
    const index = cards.value.findIndex(x => x.id === id);
    if (index !== -1) {
      commitments.value.filter(c => c.cardId !== id);
      cards.value.splice(index, 1);
      isDataSaved.value = false;
    }
  }

  function addExpense(expense: Omit<Expense, 'id' | 'paid'> & { paid?: boolean }) {
    expenses.value.push({
      id: Math.random().toString(36).substr(2, 9),
      name: expense.name,
      expected: expense.expected,
      actual: expense.actual,
      paid: expense.paid ?? false
    });
    isDataSaved.value = false;
  }

  function deleteExpense(id: string) {
    const index = expenses.value.findIndex(x => x.id === id);
    if (index !== -1) {
      expenses.value.splice(index, 1);
      isDataSaved.value = false;
    }
  }

  function closeMonth() {
    const [y, m] = activeMonthKey.value.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const nextKey = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;

    const newExpectedBal = expectedBalance.value;

    const rolledCommitments = commitments.value
      .map(c => {
        if (!c.recurring) {
          return { ...c, currentInstallment: c.currentInstallment + 1 };
        }
        return { ...c };
      })
      .filter(c => c.recurring || c.currentInstallment <= c.installments);

    const resetExpenses = expenses.value.map(e => ({ ...e, actual: e.expected, paid: false }));

    const nextCards = JSON.parse(JSON.stringify(cards.value)) as Card[];
    nextCards.forEach(card => {
      card.currentBalance = getCardCommitmentsSum(card.id, rolledCommitments);
    });

    monthDatabase.value[nextKey] = {
      income: income.value,
      balance: newExpectedBal,
      savingsGoal: savingsGoal.value,
      cards: nextCards,
      expenses: resetExpenses,
      commitments: rolledCommitments
    };

    activeMonthKey.value = nextKey;
    isDataSaved.value = false;
  }

  function getCSVContent(): string {
    const rows = [
      ['MonthKey', 'RecordType', 'ID', 'Name', 'Val1', 'Val2', 'Val3', 'Val4']
    ];

    Object.entries(monthDatabase.value).forEach(([mKey, data]) => {
      rows.push([mKey, 'GLOBAL', 'meta', '', String(data.income), String(data.balance), String(data.savingsGoal), '']);
      data.cards.forEach(card => {
        rows.push([mKey, 'CARD', card.id, card.name, String(card.currentBalance), String(card.limit || 0), card.color || '', '']);
      });
      data.expenses.forEach(exp => {
        rows.push([mKey, 'EXPENSE', exp.id, exp.name, String(exp.expected), String(exp.actual), String(exp.paid || false), '']);
      });
      data.commitments.forEach(c => {
        rows.push([mKey, 'COMMITMENT', c.id, c.description, String(c.totalAmount), String(c.monthlyAmount), `${c.cardId}|${c.currentInstallment}|${c.installments}`, String(c.recurring)]);
      });
    });

    return rows.map(e => e.join(',')).join('\n');
  }

  function downloadCSVFile(content: string, filename = 'financial_database.csv') {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    isDataSaved.value = true;
  }

  function exportDataCSV() {
    const csvContent = getCSVContent();
    downloadCSVFile(csvContent, 'financial_database.csv');
  }

  function importDataCSV(csvText: string) {
    const lines = csvText.replace(/\r/g, '').split('\n').map(l => l.split(','));
    const newDb: typeof monthDatabase.value = {};

    lines.forEach(cols => {
      if (cols.length < 4) return;
      const [mKey, type, id, name, f1, f2, f3, f4] = cols;
      if (!mKey || !mKey.includes('-')) return;

      if (!newDb[mKey]) {
        newDb[mKey] = { income: 0, balance: 0, savingsGoal: 0, cards: [], expenses: [], commitments: [] };
      }

      if (type === 'GLOBAL') {
        newDb[mKey].income = Number(f1) || 0;
        newDb[mKey].balance = Number(f2) || 0;
        newDb[mKey].savingsGoal = Number(f3) || 0;
      } else if (type === 'CARD') {
        newDb[mKey].cards.push({ id, name, currentBalance: Number(f1), limit: Number(f2), color: f3 || undefined });
      } else if (type === 'EXPENSE') {
        newDb[mKey].expenses.push({
          id,
          name,
          expected: Number(f1) || 0,
          actual: Number(f2) || 0,
          paid: f3 === 'true'
        });
      } else if (type === 'COMMITMENT') {
        const [cardId, currentInst, totalInst] = (f3 || '').split('|');
        newDb[mKey].commitments.push({
          id,
          description: name,
          totalAmount: Number(f1),
          monthlyAmount: Number(f2),
          cardId: cardId,
          currentInstallment: Number(currentInst) || 1,
          installments: Number(totalInst) || 1,
          recurring: f4 === 'true',
          purchaseDate: new Date().toISOString().split('T')[0]
        });
      }
    });

    if (Object.keys(newDb).length > 0) {
      monthDatabase.value = newDb;
      const keys = Object.keys(newDb).sort();
      activeMonthKey.value = keys[keys.length - 1];
      isDataSaved.value = true;
    }
  }

  return {
    activeMonthKey, availableMonths, currentMonthLabel, income, balance, cards, expenses, commitments, savingsGoal,
    fixedExpenses, creditCommitments, monthlyCommitments,
    availableToSpend, savingsTargetAmount, expectedBalance, projection, isDataSaved, showUnsavedModal,
    addCommitment, deleteCommitment, addCard, deleteCard, addExpense, deleteExpense, closeMonth, exportDataCSV, importDataCSV, updateCardBalance,
    getCSVContent, downloadCSVFile
  };
});