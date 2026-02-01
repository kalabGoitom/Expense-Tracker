const balanceScreen = document.getElementById("show-balance");
const incomeScreen = document.getElementById("show-income");
const expenseScreen = document.getElementById("show-expense");
const descriptionInput = document.getElementById("description-input");
const amountInput = document.getElementById("amount-input");
const transactionContainer = document.getElementById("transactionHistory");
const popUp = document.getElementById("pop-up");
const popUpContainer = document.getElementById("pop-up-container");
const btnContainer = document.querySelector(".btn-container");

// btns
const incomeRadio = document.getElementById("income");
const expenseRadio = document.getElementById("expense");
const addBtn = document.getElementById("add-btn");

// Transacton history
let transactions = JSON.parse(getDataFromLocalStorage()) || [];

// Edit flags
let elId;
let isEditing = false;

// Balance containers
const balances = {
  totalBalance: 0,
  incomeBalance: 0,
  expenseBalance: 0,
};

// Event listenrs
addBtn.addEventListener("click", addTransaction);
window.addEventListener("DOMContentLoaded", updateUi);
transactionContainer.addEventListener("click", (e) => {
  const el = e.target.closest("li");
  if (!el) return;
  const elId = String(el.dataset.id);

  if (e.target.classList.contains("trash")) deleteItem(elId);
  if (e.target.classList.contains("edit")) editItem(elId);
});

btnContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("moon")) {
    document.querySelector("body").classList.add("night");
  }
  if (e.target.classList.contains("sun")) {
    document.querySelector("body").classList.remove("night");
  }
  console.log("working");
});

// Adds transaction
function addTransaction() {
  if (!(descriptionInput.value && amountInput.value)) {
    popupAlert("invalidInput", "danger");
    return;
  } else if (isEditing) {
    edit();
    popupAlert("edited", "success");
  } else {
    createTransaction();
    updateUi();
    popupAlert("added", "success");
  }
  resetValues();
  updateBalance();
}

// creates transaction history based on user inputs
function createTransaction() {
  const id = Date.now();
  const transaction = {
    description: descriptionInput.value,
    amount: amountInput.value,
    type: incomeRadio.checked ? "income" : "expense",
    id,
  };
  transactions.push(transaction);
  saveToLocalStorage(transactions);
}

// Renders transaction history
function updateUi() {
  if (!transactions.length) {
    transactionContainer.innerHTML = `<h3 class="alert">No Transaction History!</h3>`;
    return;
  }
  const html = transactions.map((transaction) => {
    return `<li class=${transaction.type} data-id=${transaction.id}>
      <span>${transaction.description}</span>
      <span >${transaction.amount.toLocaleString()} Birr</span>
      <span class="icon-container"
        ><i class="fa-solid fa-trash trash" ></i>
        <i class="fa-solid fa-edit edit" ></i>
      </span>
    </li>`;
  });

  transactionContainer.innerHTML = html.reverse().join("");
}

function deleteItem(id) {
  transactions = transactions.filter(
    (transaction) => String(transaction.id) !== id
  );
  saveToLocalStorage(transactions);
  updateUi();
  popupAlert("deleted", "danger");
  updateBalance();
}

function editItem(id) {
  addBtn.textContent = "Edit";
  isEditing = true;
  elId = id;
  transactions.forEach((transaction) => {
    if (transaction.id === Number(elId)) {
      descriptionInput.value = transaction.description;
      amountInput.value = transaction.amount;
      if (transaction.type === "income") {
        incomeRadio.checked = true;
      } else {
        expenseRadio.checked = true;
      }
    }
  });
}

function edit() {
  transactions = transactions.map((transaction) => {
    if (String(transaction.id) === elId) {
      transaction.amount = amountInput.value;
      transaction.description = descriptionInput.value;
      transaction.type = incomeRadio.checked ? "income" : "expense";
    }
    return transaction;
  });

  saveToLocalStorage(transactions);
  updateUi();
}

function saveToLocalStorage(transactions) {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function getDataFromLocalStorage() {
  return localStorage.getItem("transactions");
}

function resetValues() {
  addBtn.textContent = "Add Transaction";
  elId;
  isEditing = false;
  amountInput.value = "";
  descriptionInput.value = "";
  incomeRadio.checked = true;
}

function popupAlert(alertType, classType) {
  if (alertType === "edited") {
    popUp.textContent = "Item has been Edited!";
  } else if (alertType === "added") {
    popUp.textContent = "Item has been Added!";
  } else if (alertType === "deleted") {
    popUp.textContent = "Item has been Deleted!";
  } else if (alertType === "invalidInput") {
    popUp.textContent = "Invalid Input!";
  }
  popUpContainer.style.top = "50vh";
  popUpContainer.classList.add(classType);

  setTimeout(() => {
    popUpContainer.style.top = "-20rem";
    popUpContainer.classList.remove(classType);
  }, 1500);
}

// Balance logic
function updateBalance() {
  resetBalances();
  if (!transactions.length) {
    balanceScreen.textContent = 0 + " Birr";
    incomeScreen.textContent = 0 + " Birr";
    expenseScreen.textContent = 0 + " Birr";
    return;
  }

  transactions.map((transaction) => {
    if (transaction.type === "expense") {
      balances.expenseBalance += parseFloat(transaction.amount);
    } else if (transaction.type === "income") {
      balances.incomeBalance += parseFloat(transaction.amount);
    }
  });

  balances.totalBalance =
    parseFloat(balances.incomeBalance) - parseFloat(balances.expenseBalance);

  balanceScreen.textContent = balances.totalBalance.toLocaleString() + " Birr";
  incomeScreen.textContent = balances.incomeBalance.toLocaleString() + " Birr";
  expenseScreen.textContent =
    balances.expenseBalance.toLocaleString() + " Birr";
}

function resetBalances() {
  balances.totalBalance = 0;
  balances.incomeBalance = 0;
  balances.expenseBalance = 0;
}

updateBalance();
