let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let categoryBudgets = JSON.parse(localStorage.getItem('categoryBudgets')) || { Makan:0, Liburan:0, Rumah:0, Lainnya:0 };

const balance = document.getElementById('total-balance');
const incomeEl = document.getElementById('total-income');
const expenseEl = document.getElementById('total-expense');
const list = document.getElementById('transaction-list');
const form = document.getElementById('transaction-form');

function setCategoryBudget() {
    const cat = document.getElementById('budget-category-select').value;
    const amt = document.getElementById('budget-amount-input').value;
    if (amt === '' || amt < 0) return;
    categoryBudgets[cat] = parseInt(amt);
    localStorage.setItem('categoryBudgets', JSON.stringify(categoryBudgets));
    updateValues();
    document.getElementById('budget-amount-input').value = '';
}

function addTransaction(e) {
    e.preventDefault();
    const type = document.getElementById('type').value;
    const amt = document.getElementById('amount').value;
    const transaction = {
        id: Math.floor(Math.random() * 1000000),
        text: document.getElementById('desc').value,
        category: document.getElementById('trans-category').value,
        amount: type === 'expense' ? -Math.abs(amt) : Math.abs(amt)
    };
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    init();
    form.reset();
}

function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    init();
}

function updateValues() {
    const amounts = transactions.map(t => t.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0);
    const inc = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0);
    const exp = amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1;

    balance.innerText = `Rp ${total.toLocaleString()}`;
    incomeEl.innerText = `Rp ${inc.toLocaleString()}`;
    expenseEl.innerText = `Rp ${exp.toLocaleString()}`;

    const catList = document.getElementById('category-budget-list');
    catList.innerHTML = '';
    let over = false;

    Object.keys(categoryBudgets).forEach(cat => {
        const budget = categoryBudgets[cat];
        const spent = transactions.filter(t => t.category === cat && t.amount < 0).reduce((a, b) => a + Math.abs(b.amount), 0);
        if (budget > 0 || spent > 0) {
            const pct = budget > 0 ? (spent / budget) * 100 : 0;
            if (pct >= 100) over = true;
            catList.innerHTML += `
                <div class="category-item">
                    <div class="category-info"><span>${cat}</span><span>${spent.toLocaleString()}/${budget.toLocaleString()}</span></div>
                    <div class="progress-bar"><div class="progress-fill" style="width:${pct > 100 ? 100 : pct}%; background:${pct >= 100 ? '#e74c3c' : '#b6895b'}"></div></div>
                </div>`;
        }
    });
    document.getElementById('footer-status').innerText = over ? "BOROS!" : "AMAN";
    document.getElementById('footer-status').style.color = over ? "#e74c3c" : "#2ecc71";
}

function init() {
    list.innerHTML = '';
    transactions.forEach(t => {
        const item = document.createElement('li');
        item.classList.add(t.amount < 0 ? 'minus' : 'plus');
        item.innerHTML = `${t.text} (${t.category}) <span>Rp ${Math.abs(t.amount).toLocaleString()} <button class="delete-btn" onclick="removeTransaction(${t.id})">x</button></span>`;
        list.appendChild(item);
    });
    updateValues();
}

form.addEventListener('submit', addTransaction);
init();