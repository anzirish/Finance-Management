/*  
   DATA MANAGEMENT
*/

// Storage key for localStorage
const DB_KEY = "finance:05";

// Default application state structure
const defaultState = {
  accounts: [], // User's bank accounts/wallets
  transactions: [], // Income and expense records
  goals: [], // Savings goals
  budgets: [], // Monthly spending limits per category
  bills: [], // Upcoming bills and reminders
};

/*  
   UTILITY FUNCTIONS
 */

// Format number as currency (Indian Rupees)
const fmt = (n) => {
  const v = Number(n) || 0;
  return (
    "₹" +
    v.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

// Generate unique ID for records
const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// Read state from localStorage
function readState() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return JSON.parse(JSON.stringify(defaultState));
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading state:", e);
    return JSON.parse(JSON.stringify(defaultState));
  }
}

// Write state to localStorage
function writeState(s) {
  localStorage.setItem(DB_KEY, JSON.stringify(s));
}

// Initialize application state
let state = readState();

/*  
   DOM ELEMENT REFERENCES
*/

// Transaction elements
const txForm = document.getElementById("txForm");
const txList = document.getElementById("txList");
const txAccount = document.getElementById("txAccount");
const filterAccount = document.getElementById("filterAccount");
const filterType = document.getElementById("filterType");
const searchTx = document.getElementById("searchTx");

// Summary elements
const netBalance = document.getElementById("netBalance");
const monthlyIncome = document.getElementById("monthlyIncome");
const monthlyExpense = document.getElementById("monthlyExpense");

// Account elements
const accountsList = document.getElementById("accountsList");
const addAccount = document.getElementById("addAccount");
const newAcctName = document.getElementById("newAcctName");
const newAcctBalance = document.getElementById("newAcctBalance");
const clearAllData = document.getElementById("clearAllData");

// Goal elements
const goalsList = document.getElementById("goalsList");
const addGoal = document.getElementById("addGoal");
const goalName = document.getElementById("goalName");
const goalTarget = document.getElementById("goalTarget");

// Budget elements
const budgetsList = document.getElementById("budgetsList");
const addBudget = document.getElementById("addBudget");
const budgetCategory = document.getElementById("budgetCategory");
const budgetAmount = document.getElementById("budgetAmount");

// Bill elements
const billsList = document.getElementById("billsList");
const addBill = document.getElementById("addBill");
const billName = document.getElementById("billName");
const billAmount = document.getElementById("billAmount");
const billDue = document.getElementById("billDue");

// Import/Export elements
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const fileInput = document.getElementById("fileInput");

// Chart elements
const ieChartCtx = document.getElementById("ieChart").getContext("2d");
const catChartCtx = document.getElementById("catChart").getContext("2d");

// Report elements
const reportRange = document.getElementById("reportRange");
const genReport = document.getElementById("genReport");
const downloadReport = document.getElementById("downloadReport");
const reportOut = document.getElementById("reportOut");

/*  
   EXPORT/IMPORT FUNCTIONALITY
*/

// Export data as JSON file
const exportJSON = () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pfd-backup-" + new Date().toISOString() + ".json";
  a.click();
  URL.revokeObjectURL(url);
};

// Event listeners for export button
exportBtn.addEventListener("click", exportJSON);

// Event listeners for import button
importBtn.addEventListener("click", () => fileInput.click());

// Handle file import
fileInput.addEventListener("change", (ev) => {
  const f = ev.target.files && ev.target.files[0];
  if (!f) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      // Validate imported data
      if (typeof parsed !== "object") throw "Invalid data format";

      state = Object.assign({}, defaultState, parsed);
      writeState(state);
      renderAll();
      alert("Import successful");
    } catch (err) {
      alert("Failed to import: " + err);
    }
  };
  reader.readAsText(f);
  fileInput.value = "";
});

// Clear all data
clearAllData.addEventListener("click", () => {
  if (confirm("Clear ALL local data? This cannot be undone.")) {
    state = JSON.parse(JSON.stringify(defaultState));
    writeState(state);
    renderAll();
  }
});

/*  
   ACCOUNT MANAGEMENT
*/

// Add new account
function addAccountHandler() {
  const name = newAcctName.value.trim();
  const bal = Number(newAcctBalance.value) || 0;

  if (!name) {
    alert("Account name required");
    return;
  }

  state.accounts.push({ id: uid(), name, balance: bal });
  writeState(state);
  renderAll();

  // Clear form inputs
  newAcctName.value = "";
  newAcctBalance.value = "";
}

addAccount.addEventListener("click", addAccountHandler);

// Render accounts list and populate dropdowns
function renderAccounts() {
  // Populate account select dropdowns
  txAccount.innerHTML = '<option value="">(No account)</option>';
  filterAccount.innerHTML = '<option value="all">All Accounts</option>';
  accountsList.innerHTML = "";

  if (state.accounts.length === 0) {
    accountsList.innerHTML =
      '<div class="empty">No accounts yet — add one.</div>';
    return;
  }

  state.accounts.forEach((a) => {
    // Add to transaction form dropdown
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = a.name;
    txAccount.appendChild(opt);

    // Add to filter dropdown
    const opt2 = document.createElement("option");
    opt2.value = a.id;
    opt2.textContent = a.name;
    filterAccount.appendChild(opt2);

    // Create account list item
    const div = document.createElement("div");
    div.className = "acct-item";
    div.innerHTML = `
      <div>
        <div style="font-weight:700">${a.name}</div>
        <div class="muted small">${fmt(a.balance)}</div>
      </div>
      <div class="row">
        <button class="pill" data-id="${a.id}">Edit</button>
        <button class="pill danger" data-del="${a.id}">Del</button>
      </div>
    `;
    accountsList.appendChild(div);
  });

  // Delete account handler
  accountsList.querySelectorAll("[data-del]").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-del");
      if (!confirm("Delete account and its transactions?")) return;

      state.accounts = state.accounts.filter((ac) => ac.id !== id);
      state.transactions = state.transactions.filter(
        (tx) => tx.accountId !== id
      );
      writeState(state);
      renderAll();
    })
  );

  // Edit account handler
  accountsList.querySelectorAll("[data-id]").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      const account = state.accounts.find((a) => a.id === id);
      if (!account) return;

      const newName = prompt("Edit account name:", account.name);
      if (newName === null) return;

      const newBalance = prompt("Edit account balance:", account.balance);
      if (newBalance === null) return;

      const balanceNum = Number(newBalance);
      if (isNaN(balanceNum)) {
        alert("Invalid balance amount");
        return;
      }

      if (newName.trim()) {
        account.name = newName.trim();
        account.balance = balanceNum;
        writeState(state);
        renderAll();
      } else {
        alert("Account name cannot be empty");
      }
    })
  );
}

/*  
   SAVINGS GOALS
*/

// Add new savings goal
function addGoalHandler() {
  const title = goalName.value.trim();
  const target = Number(goalTarget.value) || 0;

  if (!title || target <= 0) {
    alert("Goal title & positive target required");
    return;
  }

  state.goals.push({ id: uid(), title, target, saved: 0 });
  writeState(state);
  renderAll();

  // Clear form inputs
  goalName.value = "";
  goalTarget.value = "";
}

addGoal.addEventListener("click", addGoalHandler);

// Render goals list
function renderGoals() {
  goalsList.innerHTML = "";

  if (state.goals.length === 0) {
    goalsList.innerHTML = '<div class="empty">No goals yet — create one.</div>';
    return;
  }

  state.goals.forEach((g) => {
    // Calculate progress percentage
    const percent = Math.min(100, Math.round((g.saved / g.target) * 100));

    const div = document.createElement("div");
    div.style.marginBottom = "8px";
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <strong>${g.title}</strong>
          <div class="muted small">Target ${fmt(g.target)}</div>
        </div>
        <div>${fmt(g.saved)}</div>
      </div>
      <div class="progress" style="margin-top:6px">
        <i style="width:${percent}%"></i>
      </div>
      <div style="display:flex;gap:8px;margin-top:6px">
        <button data-id="${g.id}" class="pill">Add Funds</button>
        <button data-del="${g.id}" class="pill danger">Delete</button>
      </div>
    `;
    goalsList.appendChild(div);
  });

  // Add funds to goal handler
  goalsList.querySelectorAll("[data-id]").forEach((b) =>
    b.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      const amount = prompt("Amount to add to goal?");
      const v = Number(amount) || 0;
      if (v <= 0) return;

      const g = state.goals.find((x) => x.id === id);
      if (g) {
        g.saved = (g.saved || 0) + v;
        writeState(state);
        renderAll();
      }
    })
  );

  // Delete goal handler
  goalsList.querySelectorAll("[data-del]").forEach((b) =>
    b.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-del");
      if (!confirm("Delete this goal?")) return;

      state.goals = state.goals.filter((x) => x.id !== id);
      writeState(state);
      renderAll();
    })
  );
}

/*  
   BUDGET MANAGEMENT
*/

// Add new budget
function addBudgetHandler() {
  const cat = budgetCategory.value.trim();
  const amt = Number(budgetAmount.value) || 0;

  if (!cat || amt <= 0) {
    alert("Category & positive amount required");
    return;
  }

  state.budgets.push({
    id: uid(),
    category: cat.toLowerCase(),
    amount: amt,
  });
  writeState(state);
  renderAll();

  // Clear form inputs
  budgetCategory.value = "";
  budgetAmount.value = "";
}

addBudget.addEventListener("click", addBudgetHandler);

// Calculate spending for a category in current month
function sumCategoryMonth(category) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  return state.transactions
    .filter(
      (t) =>
        t.category === category &&
        new Date(t.date).getFullYear() === year &&
        new Date(t.date).getMonth() === month
    )
    .reduce((s, t) => (t.type === "expense" ? s + t.amount : s), 0);
}

// Render budgets list
function renderBudgets() {
  budgetsList.innerHTML = "";

  if (state.budgets.length === 0) {
    budgetsList.innerHTML = '<div class="empty">No budgets yet.</div>';
    return;
  }

  state.budgets.forEach((b) => {
    // Calculate spent amount for this category this month
    const spent = sumCategoryMonth(b.category);
    const percent = Math.min(100, Math.round((spent / b.amount) * 100));

    const div = document.createElement("div");
    div.style.marginBottom = "8px";
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between">
        <div>
          <strong>${b.category}</strong>
          <div class="muted small">Limit ${fmt(b.amount)} / Spent ${fmt(
      spent
    )}</div>
        </div>
        <div>${percent}%</div>
      </div>
      <div class="progress" style="margin-top:6px">
        <i style="width:${percent}%"></i>
      </div>
      <div style="display:flex;gap:8px;margin-top:6px">
        <button data-id="${b.id}" class="pill">Edit</button>
        <button data-del="${b.id}" class="pill danger">Delete</button>
      </div>
    `;
    budgetsList.appendChild(div);
  });

  // Delete budget handler
  budgetsList.querySelectorAll("[data-del]").forEach((b) =>
    b.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-del");
      if (!confirm("Delete budget?")) return;

      state.budgets = state.budgets.filter((x) => x.id !== id);
      writeState(state);
      renderAll();
    })
  );

  // Edit budget handler
  budgetsList.querySelectorAll("[data-id]").forEach((b) =>
    b.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      const budget = state.budgets.find((x) => x.id === id);
      if (!budget) return;

      const newCategory = prompt("Edit category:", budget.category);
      if (newCategory === null) return;

      const newAmount = prompt("Edit monthly limit:", budget.amount);
      if (newAmount === null) return;

      const amountNum = Number(newAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        alert("Invalid amount - must be positive number");
        return;
      }

      if (newCategory.trim()) {
        budget.category = newCategory.trim().toLowerCase();
        budget.amount = amountNum;
        writeState(state);
        renderAll();
      } else {
        alert("Category cannot be empty");
      }
    })
  );
}

/*  
   BILLS & REMINDERS
*/

// Add new bill
function addBillHandler() {
  const name = billName.value.trim();
  const amt = Number(billAmount.value) || 0;
  const due = billDue.value;

  if (!name || amt <= 0 || !due) {
    alert("All bill fields required");
    return;
  }

  state.bills.push({ id: uid(), name, amount: amt, due });
  writeState(state);
  renderAll();

  // Clear form inputs
  billName.value = "";
  billAmount.value = "";
  billDue.value = "";
}

addBill.addEventListener("click", addBillHandler);

// Render bills list
function renderBills() {
  billsList.innerHTML = "";

  if (state.bills.length === 0) {
    billsList.innerHTML = '<div class="empty">No bills tracked.</div>';
    return;
  }

  const today = new Date().toISOString().slice(0, 10);

  state.bills.forEach((b) => {
    const div = document.createElement("div");
    div.className = "tx";
    div.innerHTML = `
      <div class="meta">
        <div>
          <strong>${b.name}</strong>
          <div class="muted small">Due ${b.due}</div>
        </div>
      </div>
      <div style="text-align:right">
        <div>${fmt(b.amount)}</div>
        <div style="margin-top:6px;display:flex;gap:8px;justify-content:flex-end">
          <button data-pay="${b.id}" class="pill">Mark Paid</button>
          <button data-del="${b.id}" class="pill danger">Delete</button>
        </div>
      </div>
    `;
    billsList.appendChild(div);
  });

  // Mark bill as paid handler
  billsList.querySelectorAll("[data-pay]").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-pay");
      const b = state.bills.find((x) => x.id === id);
      if (!b) return;

      // Create transaction for bill payment
      const accId = state.accounts.length ? state.accounts[0].id : null;
      const tx = {
        id: uid(),
        type: "expense",
        amount: b.amount,
        date: new Date().toISOString().slice(0, 10),
        accountId: accId,
        category: "bill:" + b.name.toLowerCase(),
        payee: b.name,
        note: "Bill paid",
      };

      state.transactions.push(tx);
      state.bills = state.bills.filter((x) => x.id !== id);

      // Update account balance
      if (accId) {
        const acc = state.accounts.find((a) => a.id === accId);
        if (acc) acc.balance -= b.amount;
      }

      writeState(state);
      renderAll();
    })
  );

  // Delete bill handler
  billsList.querySelectorAll("[data-del]").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-del");
      if (!confirm("Delete bill?")) return;

      state.bills = state.bills.filter((x) => x.id !== id);
      writeState(state);
      renderAll();
    })
  );
}

// Check for upcoming bills
function checkBills() {
  const today = new Date();
  const soon = new Date();
  soon.setDate(today.getDate() + 3);

  const upcoming = state.bills.filter((b) => new Date(b.due) <= soon);
  if (upcoming.length > 0) {
    console.log("Upcoming bills", upcoming);
  }
}

/*  
   TRANSACTION MANAGEMENT
*/

// Add new transaction
txForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const type = document.getElementById("txType").value;
  const amount = Number(document.getElementById("txAmount").value) || 0;
  let date = document.getElementById("txDate").value;

  // Use today's date if not specified
  if (!date) date = new Date().toISOString().slice(0, 10);

  const accountId = txAccount.value || null;
  const category =
    document.getElementById("txCategory").value.trim() || "uncategorized";
  const payee = document.getElementById("txPayee").value.trim() || "";
  const note = document.getElementById("txNote").value.trim() || "";

  if (amount <= 0) {
    alert("Amount must be > 0");
    return;
  }

  // Create transaction object
  const tx = {
    id: uid(),
    type,
    amount,
    date,
    accountId,
    category: category.toLowerCase(),
    payee,
    note,
    createdAt: new Date().toISOString(),
  };

  state.transactions.push(tx);

  // Update account balance if account is selected
  if (accountId) {
    const acc = state.accounts.find((a) => a.id === accountId);
    if (acc) {
      acc.balance += type === "income" ? amount : -amount;
    }
  }

  writeState(state);
  renderAll();
  txForm.reset();
});

// Delete transaction
function deleteTx(id) {
  if (!confirm("Delete this transaction?")) return;

  state.transactions = state.transactions.filter((t) => t.id !== id);
  writeState(state);
  renderAll();
}

// Render transactions list
function renderTransactions() {
  txList.innerHTML = "";

  // Get and sort transactions by date (newest first)
  let txs = state.transactions
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Apply filters
  const accFilter = filterAccount.value;
  const typeFilter = filterType.value;
  const q = searchTx.value.trim().toLowerCase();

  if (accFilter && accFilter !== "all") {
    txs = txs.filter((t) => t.accountId === accFilter);
  }

  if (typeFilter && typeFilter !== "all") {
    txs = txs.filter((t) => t.type === typeFilter);
  }

  if (q) {
    txs = txs.filter(
      (t) =>
        (t.category || "").includes(q) ||
        (t.payee || "").includes(q) ||
        (t.note || "").includes(q)
    );
  }

  if (txs.length === 0) {
    txList.innerHTML = '<div class="empty">No transactions match.</div>';
    return;
  }

  // Render each transaction
  txs.forEach((t) => {
    const div = document.createElement("div");
    div.className = "tx";

    // Get account name
    const accName = t.accountId
      ? (state.accounts.find((a) => a.id === t.accountId) || {}).name
      : "(No account)";

    div.innerHTML = `
      <div class="meta">
        <div style="font-weight:700">${t.category}</div>
        <div class="muted small">${t.payee || accName} · ${t.date}</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700">
          ${t.type === "income" ? "+" + fmt(t.amount) : "-" + fmt(t.amount)}
        </div>
        <div style="margin-top:8px;display:flex;gap:8px;justify-content:flex-end">
          <button data-id="${t.id}" class="pill">Edit</button>
          <button data-del="${t.id}" class="pill danger">Delete</button>
        </div>
      </div>
    `;
    txList.appendChild(div);
  });

  // Delete transaction handlers
  txList
    .querySelectorAll("[data-del]")
    .forEach((b) =>
      b.addEventListener("click", (e) =>
        deleteTx(e.target.getAttribute("data-del"))
      )
    );

  // Edit transaction handlers
  txList.querySelectorAll("[data-id]").forEach((b) =>
    b.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      const tx = state.transactions.find((t) => t.id === id);
      if (!tx) return;

      const newAmount = prompt("Edit amount:", tx.amount);
      if (newAmount === null) return;

      const newCategory = prompt("Edit category:", tx.category);
      if (newCategory === null) return;

      const newPayee = prompt("Edit payee/source:", tx.payee || "");
      if (newPayee === null) return;

      const newNote = prompt("Edit note:", tx.note || "");
      if (newNote === null) return;

      const amountNum = Number(newAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        alert("Invalid amount - must be positive number");
        return;
      }

      // Update account balance with difference
      if (tx.accountId) {
        const acc = state.accounts.find((a) => a.id === tx.accountId);
        if (acc) {
          // Reverse old transaction
          acc.balance += tx.type === "income" ? -tx.amount : tx.amount;
          // Apply new transaction
          acc.balance += tx.type === "income" ? amountNum : -amountNum;
        }
      }

      // Update transaction
      tx.amount = amountNum;
      tx.category = newCategory.trim().toLowerCase() || "uncategorized";
      tx.payee = newPayee.trim();
      tx.note = newNote.trim();

      writeState(state);
      renderAll();
    })
  );
}

/*  
   CHARTS & VISUALIZATION
*/

let ieChart, catChart;

// Render income/expense and category charts
function renderCharts() {
  // Prepare 6 months labels
  const labels = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(
      d.toLocaleString(undefined, { month: "short", year: "numeric" })
    );
  }

  // Calculate income and expense for each month
  const incomeData = new Array(6).fill(0);
  const expenseData = new Array(6).fill(0);

  state.transactions.forEach((t) => {
    const d = new Date(t.date);
    const diff =
      (now.getFullYear() - d.getFullYear()) * 12 +
      (now.getMonth() - d.getMonth());

    if (diff >= 0 && diff < 6) {
      const idx = 5 - diff;
      if (t.type === "income") {
        incomeData[idx] += t.amount;
      } else {
        expenseData[idx] += t.amount;
      }
    }
  });

  // Destroy existing chart if it exists
  if (ieChart) ieChart.destroy();

  // Create income vs expense bar chart
  ieChart = new Chart(ieChartCtx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          backgroundColor: "rgba(16, 185, 129, 0.7)",
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 2,
          borderRadius: 6,
        },
        {
          label: "Expense",
          data: expenseData,
          backgroundColor: "rgba(239, 68, 68, 0.7)",
          borderColor: "rgba(239, 68, 68, 1)",
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: "#e2e8f0",
            font: {
              size: 12,
              weight: 500,
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
          },
          ticks: {
            color: "#94a3b8",
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "#94a3b8",
          },
        },
      },
    },
  });

  // Calculate category spending
  const catMap = {};
  state.transactions.forEach((t) => {
    if (t.type === "expense") {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    }
  });

  const catLabels = Object.keys(catMap);
  const catVals = catLabels.map((k) => catMap[k]);

  // Destroy existing chart if it exists
  if (catChart) catChart.destroy();

  // Create category pie chart
  catChart = new Chart(catChartCtx, {
    type: "doughnut",
    data: {
      labels: catLabels,
      datasets: [
        {
          data: catVals,
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(139, 92, 246, 0.8)",
            "rgba(236, 72, 153, 0.8)",
            "rgba(245, 158, 11, 0.8)",
            "rgba(16, 185, 129, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
          borderColor: [
            "rgba(59, 130, 246, 1)",
            "rgba(139, 92, 246, 1)",
            "rgba(236, 72, 153, 1)",
            "rgba(245, 158, 11, 1)",
            "rgba(16, 185, 129, 1)",
            "rgba(239, 68, 68, 1)",
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#e2e8f0",
            font: {
              size: 11,
              weight: 500,
            },
            padding: 10,
          },
        },
      },
    },
  });
}

/*  
   SUMMARY CALCULATIONS
*/

// Recalculate and update summary display
function recalcSummary() {
  // Calculate net balance from all accounts
  const net =
    state.accounts.reduce((s, a) => s + (Number(a.balance) || 0), 0) +
    state.transactions.reduce((s, t) => {
      // Only count transactions without account (avoid double counting)
      return t.accountId
        ? s
        : t.type === "income"
        ? s + t.amount
        : s - t.amount;
    }, 0);

  netBalance.textContent = fmt(net);

  // Calculate monthly income and expense
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const income = state.transactions
    .filter(
      (t) =>
        t.type === "income" &&
        new Date(t.date).getFullYear() === year &&
        new Date(t.date).getMonth() === month
    )
    .reduce((s, t) => s + t.amount, 0);

  const expense = state.transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        new Date(t.date).getFullYear() === year &&
        new Date(t.date).getMonth() === month
    )
    .reduce((s, t) => s + t.amount, 0);

  monthlyIncome.textContent = fmt(income);
  monthlyExpense.textContent = fmt(expense);

  // Check for budget alerts
  state.budgets.forEach((b) => {
    const spent = sumCategoryMonth(b.category);
    if (spent > b.amount) {
      // Request notification permission and send alert
      if (window.Notification && Notification.permission !== "denied") {
        if (Notification.permission !== "granted") {
          Notification.requestPermission();
        }
        try {
          new Notification("Budget alert", {
            body: `You exceeded your budget for ${b.category} (${fmt(
              spent
            )} > ${fmt(b.amount)})`,
          });
        } catch (e) {
          // Ignore notification errors
        }
      }
    }
  });
}

/*  
   REPORTS
*/

// Generate report for selected time range
genReport.addEventListener("click", () => {
  const range = reportRange.value;
  const now = new Date();
  let from, to;

  if (range === "monthly") {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
    to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  } else if (range === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    from = new Date(now.getFullYear(), q * 3, 1);
    to = new Date(now.getFullYear(), q * 3 + 3, 0);
  } else {
    from = new Date(now.getFullYear(), 0, 1);
    to = new Date(now.getFullYear(), 11, 31);
  }

  // Filter transactions in date range
  const txs = state.transactions.filter(
    (t) => new Date(t.date) >= from && new Date(t.date) <= to
  );

  // Calculate totals
  const income = txs
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const expense = txs
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  // Display report
  reportOut.innerHTML = `
    <div class="muted small">
      Report range ${from.toISOString().slice(0, 10)} to ${to
    .toISOString()
    .slice(0, 10)}
    </div>
    <div style="display:flex;justify-content:space-between;margin-top:8px">
      <div>
        <strong>Total Income</strong>
        <div>${fmt(income)}</div>
      </div>
      <div>
        <strong>Total Expense</strong>
        <div>${fmt(expense)}</div>
      </div>
      <div>
        <strong>Net</strong>
        <div>${fmt(income - expense)}</div>
      </div>
    </div>
  `;
});

// Download report as text file
downloadReport.addEventListener("click", () => {
  const html = reportOut.innerText || "No report generated.";
  const blob = new Blob([html], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pfd-report-" + new Date().toISOString() + ".txt";
  a.click();
  URL.revokeObjectURL(url);
});

/*  
   RENDER ALL & INITIALIZATION
*/

// Render all components
function renderAll() {
  renderAccounts();
  renderGoals();
  renderBudgets();
  renderBills();
  renderTransactions();
  renderCharts();
  recalcSummary();
}

// Initial render on page load
renderAll();

/*  
   EVENT LISTENERS
*/

// Clear all transactions
document.getElementById("clearTx").addEventListener("click", () => {
  if (confirm("Clear all transactions?")) {
    state.transactions = [];
    writeState(state);
    renderAll();
  }
});

// Filter change listeners
filterAccount.addEventListener("change", renderTransactions);
filterType.addEventListener("change", renderTransactions);
searchTx.addEventListener("input", renderTransactions);

// Save state before page unload
window.addEventListener("beforeunload", () => writeState(state));

// Check for upcoming bills
checkBills();