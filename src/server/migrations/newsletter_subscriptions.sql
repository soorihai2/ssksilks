CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'unsubscribed') DEFAULT 'active',
  preferences JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
); 