const currentUser = localStorage.getItem("currentUser");
if (!currentUser || localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {

const currentUser = localStorage.getItem("currentUser");
if (!currentUser || localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "login.html";
}

/* ================= NAV ================= */
function showSection(id, btn) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("show"));
  document.getElementById(id).classList.add("show");

  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    showSection(btn.dataset.target, btn);
  });
});

/* ================= EXPENSE ================= */
const expenseForm = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");

let expenseData =
  JSON.parse(localStorage.getItem(`expenses_${currentUser}`)) || {};

expenseForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const titleVal = document.getElementById("title").value.trim();
  const categoryVal = document.getElementById("category").value.trim();
  const amountVal = Number(document.getElementById("amount").value);
  const date = new Date().toISOString().split("T")[0];

  if (!titleVal || !categoryVal || !amountVal) {
    alert("Please fill all fields");
    return;
  }

  // save data
  expenseData[date] ??= [];
  expenseData[date].push({
    title: titleVal,
    category: categoryVal,
    amount: amountVal
  });

  localStorage.setItem(
    `expenses_${currentUser}`,
    JSON.stringify(expenseData)
  );

  renderHistory();
  updateAnalytics();
  checkLimit(categoryVal);

  expenseForm.reset();
});


function renderHistory() {
  expenseList.innerHTML = "";

  Object.keys(expenseData)
    .sort()
    .reverse()
    .forEach(date => {
      expenseData[date].forEach((e, index) => {

        const div = document.createElement("div");
        div.className = "expense-item";

        div.innerHTML = `
          <div class="expense-left">
            <strong>${e.category}</strong>
            <div class="expense-meta">
              ${e.title} • ${date}
            </div>
          </div>

          <div class="expense-right">
            <span class="amount">₹${e.amount}</span>
            <button class="edit-btn" title="Edit">✏️</button>
            <button class="delete-btn" title="Delete">🗑️</button>
          </div>
        `;

        // DELETE
        div.querySelector(".delete-btn").onclick = () => {
          expenseData[date].splice(index, 1);
          if (expenseData[date].length === 0) {
            delete expenseData[date];
          }
          localStorage.setItem(
            `expenses_${currentUser}`,
            JSON.stringify(expenseData)
          );
          renderHistory();
          updateAnalytics();
        };

        // EDIT
        div.querySelector(".edit-btn").onclick = () => {
          const newAmount = prompt("Edit amount", e.amount);
          if (newAmount && !isNaN(newAmount)) {
            e.amount = Number(newAmount);
            localStorage.setItem(
              `expenses_${currentUser}`,
              JSON.stringify(expenseData)
            );
            renderHistory();
            updateAnalytics();
          }
        };

        expenseList.appendChild(div);
      });
    });
}


/* ================= LIMIT ================= */
let limits =
  JSON.parse(localStorage.getItem(`limits_${currentUser}`)) || [];

limitForm.onsubmit = e => {
  e.preventDefault();
  limits.push({
    month: limitMonth.value,
    category: limitCategory.value,
    amount: limitAmount.value
  });
  localStorage.setItem(`limits_${currentUser}`, JSON.stringify(limits));
  renderLimits();
  limitForm.reset();
};

function renderLimits() {
  limitList.innerHTML = "";
  limits.forEach((l,i) => {
    const d = document.createElement("div");
    d.className = "expense-item";
    d.innerHTML = `
  <div class="expense-left">
    <strong>${l.category}</strong>
    <div class="expense-meta">
      ${l.month} • Monthly Limit
    </div>
  </div>

  <div class="expense-right">
    <span class="amount">₹${l.amount}</span>
    <button class="delete-btn" title="Delete">🗑️</button>
  </div>
`;

    d.querySelector("button").onclick = () => {
      limits.splice(i,1);
      localStorage.setItem(`limits_${currentUser}`, JSON.stringify(limits));
      renderLimits();
    };
    limitList.appendChild(d);
  });
}

function checkLimit(category) {
  const today = new Date();
  const currentMonth =
    today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0");

  const limits =
    JSON.parse(localStorage.getItem(`limits_${currentUser}`)) || [];

  // sirf current month + category ka limit
  const limitObj = limits.find(
    l => l.category === category && l.month === currentMonth
  );

  if (!limitObj) return;

  let total = 0;

  Object.keys(expenseData).forEach(date => {
    if (date.startsWith(currentMonth)) {
      expenseData[date].forEach(e => {
        if (e.category === category) {
          total += e.amount;
        }
      });
    }
  });

  if (total > Number(limitObj.amount)) {
    alert(
      `⚠️ LIMIT EXCEEDED!\n\n` +
      `Category: ${category}\n` +
      `Month: ${currentMonth}\n` +
      `Limit: ₹${limitObj.amount}\n` +
      `Spent: ₹${total}`
    );
  }
}
function populateYearSelect() {
  yearSelect.innerHTML = "";

  const currentYear = new Date().getFullYear();

  for (let y = currentYear - 2; y <= currentYear + 2; y++) {
    const option = document.createElement("option");
    option.value = y;
    option.textContent = y;
    yearSelect.appendChild(option);
  }

  yearSelect.value = currentYear;
}


/* ================= ANALYTICS ================= */
let chart;

function updateAnalytics() {
  const y = new Date().getFullYear();
  const data = Array(12).fill(0);

  Object.keys(expenseData).forEach(d => {
    const dt = new Date(d);
    if (dt.getFullYear() === y) {
      expenseData[d].forEach(e => {
        data[dt.getMonth()] += e.amount;
      });
    }
  });

  if (chart) chart.destroy();
  chart = new Chart(expenseChart, {
    type: "bar",
    data: { labels:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      datasets:[{ data, backgroundColor:"#2563eb", barThickness:12 }]},
    options:{ plugins:{legend:{display:false}} }
  });

  expenseSummary.innerText =
    `You spent ₹${data[new Date().getMonth()]} this month`;
}

/* ================= LOGOUT ================= */
logoutBtn.onclick = () => {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "login.html";
};

renderHistory();
renderLimits();
populateYearSelect();
yearSelect.onchange = () => updateAnalytics();

updateAnalytics();

});
