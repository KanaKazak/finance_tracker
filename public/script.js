async function loadTransactions() {
    const incomeCategories = ['Salary', 'Investment', 'Debt'];
    const expenseCategories = ['Food', 'Transportation', 'Utilities', 'Entertainment', 'Healthcare', 'Other'];
    const typeSelect = document.getElementById('type');
    const categorySelect = document.getElementById('category');

    if (!typeSelect || !categorySelect) {
        console.error("Type or category select elements not found.");
        return;
    }

    console.log("Type select element:", typeSelect);
    console.log("Category select element:", categorySelect);

    // Fetch transactions from the API
    const response = await fetch('/transactions');
    if (!response.ok) {
        console.error("Failed to fetch transactions:", response.status, response.statusText);
        return;
    }


    const transactions = await response.json();
    console.log("Fetched transactions:", transactions);

    // Update categories based on the selected transaction type
    function updateCategories() {
        const selectedType = typeSelect.value; // Get the selected type ('income' or 'expense')
        console.log("Selected type:", selectedType);

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
    updateCategories();

    // Update categories whenever the type changes
    typeSelect.addEventListener('change', updateCategories);

    // Display transactions on the page
        const transactionsList = document.getElementById('transactions');
        transactionsList.innerHTML = '<ul>' + transactions.map(t =>
            `<li>${t.type} of $${t.amount} for ${t.category} on ${new Date(t.date).toLocaleDateString()}</li>`
        ).join('') + '</ul>';

    // Prepare data for Google Charts - only for expenses
    const expenseData = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
            return acc;
        }, {});

    // Format data for the chart
    const chartData = [['Category', 'Amount']];
    for (const [category, amount] of Object.entries(expenseData)) {
        chartData.push([category, amount]);
    }

    drawChart(chartData);
}

// Function to draw the chart using Google Charts
function drawChart(chartData) {
    const data = google.visualization.arrayToDataTable(chartData);

    const options = {
        title: 'Expense Breakdown by Category',
        is3D: true,
    };

    const chart = new google.visualization.PieChart(document.getElementById('piechart_3d'));
    chart.draw(data, options);
}


// Handle form submission to add a new transaction
document.getElementById('transactionForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent the form from refreshing the page

    const user_id = 1; // Example user ID
    const type = document.getElementById('type').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value; // Get description

    const response = await fetch('/addTransaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, type, amount, category, description }) // Include description
    });

    if (response.ok) {
        alert('Transaction added!');
        loadTransactions(); // Reload the transactions
    } else {
        alert('Failed to add transaction.');
    }
});

// Display transactions on the page
const transactionsList = document.getElementById('transactions');
transactionsList.innerHTML = '<ul>' + transactions.map(t =>
    `<li>${t.type} of $${t.amount} for ${t.category} on ${new Date(t.date).toLocaleDateString()} - ${t.description}</li>` // Include description
).join('') + '</ul>';

// Load transactions on page load
window.onload = loadTransactions;
