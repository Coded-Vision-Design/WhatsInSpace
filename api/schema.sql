-- Blog posts table for the Space News section.
-- Run this on the Hostinger MySQL database (u372385223_whatsinspace).

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,
  body LONGTEXT NOT NULL,
  author VARCHAR(100) DEFAULT 'Admin',
  image_url VARCHAR(500),
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
  status ENUM('draft', 'published') DEFAULT 'draft',
  INDEX idx_status_date (status, published_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
