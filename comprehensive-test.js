// Comprehensive test scenarios for expense splitting application

function calculateSettlements(people, expenses) {
  const balances = {};
  
  people.forEach(person => {
    balances[person.id] = 0;
  });
  
  expenses.forEach(expense => {
    if (expense.paidBy && expense.splitAmong.length > 0) {
      const perPersonAmount = expense.amount / expense.splitAmong.length;
      balances[expense.paidBy] += expense.amount;
      expense.splitAmong.forEach(personId => {
        balances[personId] -= perPersonAmount;
      });
    }
  });
  
  const settlements = [];
  const debtors = Object.entries(balances)
    .filter(([_, balance]) => balance < 0)
    .sort((a, b) => a[1] - b[1]);
  const creditors = Object.entries(balances)
    .filter(([_, balance]) => balance > 0)
    .sort((a, b) => b[1] - a[1]);
  
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const [debtorId, debtAmount] = debtors[i];
    const [creditorId, creditAmount] = creditors[j];
    const amount = Math.min(-debtAmount, creditAmount);
    
    if (amount > 0.01) {
      settlements.push({
        from: debtorId,
        to: creditorId,
        amount: Math.round(amount * 100) / 100
      });
    }
    
    debtors[i][1] += amount;
    creditors[j][1] -= amount;
    
    if (debtors[i][1] >= -0.01) i++;
    if (creditors[j][1] <= 0.01) j++;
  }
  
  return settlements;
}

function runTest(testName, people, expenses, expectedSettlements) {
  console.log(`\\n=== ${testName} ===`);
  const settlements = calculateSettlements(people, expenses);
  
  console.log("People:", people.map(p => p.name).join(", "));
  console.log("Expenses:");
  expenses.forEach(exp => {
    const payer = people.find(p => p.id === exp.paidBy)?.name;
    const splitters = exp.splitAmong.map(id => people.find(p => p.id === id)?.name).join(", ");
    console.log(`  - ${exp.name}: ₩${exp.amount.toLocaleString()} paid by ${payer}, split among ${splitters}`);
  });
  
  console.log("Settlements:");
  settlements.forEach((settlement, index) => {
    const fromName = people.find(p => p.id === settlement.from)?.name;
    const toName = people.find(p => p.id === settlement.to)?.name;
    console.log(`  ${index + 1}. ${fromName} → ${toName}: ₩${settlement.amount.toLocaleString()}`);
  });
  
  // Create URL for testing
  const stateString = btoa(JSON.stringify({ people, expenses }));
  console.log(`Test URL: http://localhost:3000?state=${stateString}`);
}

// Test 1: Simple 2-person split
const test1People = [
  { id: "1", name: "김민수" },
  { id: "2", name: "이영희" }
];
const test1Expenses = [
  {
    id: "1",
    name: "점심식사",
    amount: 10000,
    paidBy: "1",
    splitAmong: ["1", "2"]
  }
];

runTest("Test 1: 2명이 10,000원 점심 비용 분할", test1People, test1Expenses);

// Test 2: 3-person complex scenario
const test2People = [
  { id: "1", name: "김민수" },
  { id: "2", name: "이영희" },
  { id: "3", name: "박철수" }
];
const test2Expenses = [
  {
    id: "1",
    name: "점심식사",
    amount: 15000,
    paidBy: "1",
    splitAmong: ["1", "2", "3"]
  },
  {
    id: "2",
    name: "커피",
    amount: 9000,
    paidBy: "2",
    splitAmong: ["1", "2", "3"]
  },
  {
    id: "3",
    name: "택시비",
    amount: 12000,
    paidBy: "3",
    splitAmong: ["2", "3"]
  }
];

runTest("Test 2: 3명의 복잡한 비용 분할", test2People, test2Expenses);

// Test 3: Uneven split scenario
const test3People = [
  { id: "1", name: "김민수" },
  { id: "2", name: "이영희" },
  { id: "3", name: "박철수" }
];
const test3Expenses = [
  {
    id: "1",
    name: "호텔비",
    amount: 120000,
    paidBy: "1",
    splitAmong: ["1", "2"] // Only 2 people split hotel cost
  },
  {
    id: "2",
    name: "저녁식사",
    amount: 45000,
    paidBy: "2",
    splitAmong: ["1", "2", "3"] // All 3 people split dinner
  }
];

runTest("Test 3: 불균등 분할 시나리오", test3People, test3Expenses);