CREATE TABLE IF NOT EXISTS bulk_purchase_inquiry (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_ids TEXT NOT NULL COMMENT 'JSON array of selected product IDs',
    quantity INT NOT NULL DEFAULT 1 COMMENT 'Desired purchase quantity',
    author VARCHAR(50) NOT NULL COMMENT 'Name of the inquirer',
    email VARCHAR(100) NOT NULL COMMENT 'Email address',
    phone VARCHAR(20) NOT NULL COMMENT 'Contact phone number',
    title VARCHAR(255) NOT NULL COMMENT 'Inquiry title',
    content TEXT NOT NULL COMMENT 'Inquiry content',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation date'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
