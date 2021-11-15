const Modal = {
    open() {
        document
            .querySelector(".modal-overlay")
            .classList
            .add("active")
    },
    close() {
        document
            .querySelector(".modal-overlay")
            .classList
            .remove("active")
    },
}

const Storage = {
    get() {
        return JSON.parse(localStorage
            .getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.
            stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction);

        App.reload();

    },
    remove(index) {
        Transaction.all.splice(index, 1);

        App.reload();
    },

    incomes() {
        let income = 0

        Transaction.all.forEach((transaction) => {

            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })
        return income
    },
    expenses() {
        let expense = 0

        Transaction.all.forEach((transaction) => {

            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense
    },
    total() {

        return Transaction.incomes() + Transaction.expenses()
    }
}

const DOM = {

    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.dataset.index = index
        tr.innerHTML = DOM.innerHtmlTransaction(transaction)
        DOM.transactionsContainer.appendChild(tr)
    },

    innerHtmlTransaction(transaction, index) {
        const CSScalass = transaction.amount > 0 ? 'income' : 'expense'
        const amount = Utils.formatCurrency(transaction.amount)
        const html = `
            <td class="amount">${transaction.description}</td>
            <td class=${CSScalass}> ${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
            <img onclick = "Transaction.remove(${index})"src="./assets/minus.svg" alt="Remover transação" />
            </td>
        `
        return html
    },
    updataBalance() {
        document.getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())

        document.getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())

        document.getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = " ";
    }, 
    transactionType(){ 
        const transactionType = document.getElementById("type")

        return transactionType.options[transactionType.selectedIndex].value;
    }
}

const Utils = {

    formatCurrency(value) { //Formata o valor
        const signal = Number(value) < 0 ? '-' : "" // muda sinal
        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        
        return signal + value
    },

    formatAmount(value) {

        if (DOM.transactionType() === "expense") {
            value = -value 
        }
        value = Number(value) * 100


        return value

    },

    formatDate(date) {
        const splitedDate = date.split('-');
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`
    },
}

const Form = {
    description: document.querySelector('#description'),
    amount: document.querySelector('#amount'),
    date: document.querySelector('#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },


    formatValues() {
        let { description, amount, date } = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)


        return {
            description,
            amount,
            date
        }
    },

    clearFields() {

        Form.description.value = '';
        Form.amount.value = '';
        Form.date.value = '';

    },

    validateFields() {

        const { description, amount, date } = Form.getValues();

        if (description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
            throw new Error("Por favor preencha todos os campos.")
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },
    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields();
            const transaction = Form.formatValues()
            Form.saveTransaction(transaction)
            Form.clearFields()
            Modal.close()
        } catch (error) {

            alert(error.message)

        }
    }

}

const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)

        })
        DOM.updataBalance()
        Storage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions()
        App.init()
    }
}
App.init()
