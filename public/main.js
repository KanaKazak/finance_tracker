const incomeCategories = ['Salary', 'Investments', 'Gifts', 'Other'];
const expenseCategories = ['Food', 'Prepared Food', 'Transportation Public', 'Transportation Taxi', 'Utilities', 'Entertainment', 'Healthcare', 'Indulgancies', 'Other'];

function updateCategories() {
    const typeSelect = document.getElementById('type');
    const categorySelect = document.getElementById('category');
    const selectedType = typeSelect.value;

    const categories = selectedType === 'income' ? incomeCategories : expenseCategories;

    // Clear and populate the category dropdown
    categorySelect.innerHTML = ''; // Clear previous options
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat; // Use the category name as the value
        option.textContent = cat; // Display the category name
        categorySelect.appendChild(option);
    });

    console.log("Updated categories:", categories);
}

// Initialize the dropdown with the correct categories on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCategories();
    document.getElementById('type').addEventListener('change', updateCategories);
});

document.addEventListener('DOMContentLoaded', () => {
    updateCategories();
    document.getElementById('type').addEventListener('change', updateCategories);
    document.getElementById('timePeriod').addEventListener('change', handleTimePeriodChange);
    document.getElementById('applyDateRange').addEventListener('click', applyCustomDateRange);
    fetchTransactions(); // Initial fetch of transactions
});

function handleTimePeriodChange() {
    const timePeriod = document.getElementById('timePeriod').value;
    const customDateRange = document.getElementById('customDateRange');
    if (timePeriod === 'custom') {
        customDateRange.style.display = 'block';
    } else {
        customDateRange.style.display = 'none';
        fetchTransactions(); // Fetch transactions for the selected time period
    }
}


async function fetchTransactions() {
    const timePeriod = document.getElementById('timePeriod').value;
    let startDate, endDate;

    if (timePeriod === 'currentMonth') {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (timePeriod === 'lastMonth') {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    } else if (timePeriod === 'custom') {
        startDate = document.getElementById('startDate').value;
        endDate = document.getElementById('endDate').value;
    }

    let url = '/transactions';
    if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    try {
        const response = await fetch(url);
        const transactions = await response.json();
        displayTransactions(transactions);
        drawChart(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}

function applyCustomDateRange() {
    fetchTransactions();
}

function displayTransactions(transactions) {
    const transactionsDiv = document.getElementById('transactions');
    transactionsDiv.innerHTML = '<ul>' +
        transactions.map(({ amount, type, category, date, description }) =>
            `<li>${type === 'income' ? '+' : '-'}$${parseFloat(amount).toFixed(2)} (${category}) on ${new Date(date).toLocaleDateString()} - ${description}</li>`).join('') +
        '</ul>';
}

function drawChart(transactions) {
    const chartData = [['Category', 'Amount']];
    const groupedData = transactions.reduce((acc, { category, amount }) => {
        acc[category] = (acc[category] || 0) + parseFloat(amount);
        return acc;
    }, {});

    for (const [category, amount] of Object.entries(groupedData)) {
        chartData.push([category, Math.abs(amount)]);
    }

    const data = google.visualization.arrayToDataTable(chartData);

    const options = {
        title: 'Expense Breakdown',
        is3D: true,
    };

    const chart = new google.visualization.PieChart(document.getElementById('piechart_3d'));
    chart.draw(data, options);
}

async function addTransaction(transaction) {
    try {
        const response = await fetch('/addTransaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction),
        });
        if (!response.ok) throw new Error('Failed to add transaction');
        fetchTransactions(); // Reload transactions after adding a new one
    } catch (error) {
        console.error('Error adding transaction:', error);
    }
}

document.getElementById('transactionForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page

    const user_id = 1; // Example user ID
    const type = document.getElementById('type').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value; // Get description

    const transaction = { user_id, type, amount, category, description };
    await addTransaction(transaction);
});

// Initial fetch of transactions
fetchTransactions();

// Purge Database Functionality
async function purgeDatabase() {
    try {
        const response = await fetch('/purgeDatabase', { method: 'POST' });
        if (!response.ok) throw new Error('Failed to purge database');
        fetchTransactions(); // Reload transactions after purging
    } catch (error) {
        console.error('Error purging database:', error);
    }
}

document.getElementById('purgeDatabase').addEventListener('click', async (e) => {
    e.preventDefault();
    await purgeDatabase();
});