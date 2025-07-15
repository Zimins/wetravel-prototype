// Test scenario for expense splitting application
// Scenario: Person A pays 10,000 won, Person A and Person B split the cost

const testData = {
  people: [
    { id: "1", name: "Person A" },
    { id: "2", name: "Person B" }
  ],
  expenses: [
    {
      id: "1",
      name: "Lunch",
      amount: 10000,
      paidBy: "1", // Person A paid
      splitAmong: ["1", "2"] // Both people split the cost
    }
  ]
};

// Calculate expected settlement
function calculateSettlements(people, expenses) {
  const balances = {};
  
  // Initialize balances
  people.forEach(person => {
    balances[person.id] = 0;
  });
  
  // Calculate balances
  expenses.forEach(expense => {
    if (expense.paidBy && expense.splitAmong.length > 0) {
      const perPersonAmount = expense.amount / expense.splitAmong.length;
      
      // Person who paid gets positive balance
      balances[expense.paidBy] += expense.amount;
      
      // People who should pay get negative balance
      expense.splitAmong.forEach(personId => {
        balances[personId] -= perPersonAmount;
      });
    }
  });
  
  // Calculate settlements
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

// Run the test
const settlements = calculateSettlements(testData.people, testData.expenses);

console.log("Test Scenario:");
console.log("- Person A pays 10,000 won for lunch");
console.log("- Person A and Person B split the cost");
console.log("- Expected: Person B owes Person A 5,000 won");
console.log();
console.log("Calculated settlements:");
settlements.forEach((settlement, index) => {
  const fromName = testData.people.find(p => p.id === settlement.from)?.name || settlement.from;
  const toName = testData.people.find(p => p.id === settlement.to)?.name || settlement.to;
  console.log(`${index + 1}. ${fromName} owes ${toName} ₩${settlement.amount.toLocaleString()}`);
});

// Create URL state for testing
const stateString = btoa(JSON.stringify(testData));
console.log();
console.log("Test URL:");
console.log(`http://localhost:3000?state=${stateString}`);