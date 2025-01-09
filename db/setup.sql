CREATE DATABASE finance_tracker;

USE finance_tracker;

CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type ENUM('income', 'expense'),
    amount DECIMAL(10, 2),
    category VARCHAR(255),
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);