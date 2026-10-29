-- Reference schema. Spring Boot creates these tables automatically
-- (spring.jpa.hibernate.ddl-auto=update), so running this file is optional.
CREATE DATABASE IF NOT EXISTS peer_review_db;
USE peer_review_db;

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,           -- 'STUDENT' or 'TEACHER' (inheritance discriminator)
    classroom_code VARCHAR(8) UNIQUE,
    teacher_id BIGINT,
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);

CREATE TABLE submissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    language VARCHAR(30) NOT NULL DEFAULT 'JAVA',
    source_code LONGTEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (student_id) REFERENCES users(id)
);

CREATE TABLE reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    submission_id BIGINT NOT NULL UNIQUE,  -- one review per submission
    reviewer_id BIGINT NOT NULL,
    feedback TEXT,
    score DECIMAL(4,2),
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (submission_id) REFERENCES submissions(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    CHECK (score IS NULL OR (score >= 0 AND score <= 10))
);

CREATE TABLE comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    review_id BIGINT NOT NULL,
    line_number INT NOT NULL,
    comment_text TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'SUGGESTION',
    FOREIGN KEY (review_id) REFERENCES reviews(id)
);

CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read BIT(1) NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
