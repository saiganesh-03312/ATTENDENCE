-- Online Attendance Management System (ER Diagram Schema)
-- Entities: ADMIN, TEACHER, CLASS, SUBJECT, STUDENT, ATTENDANCE

CREATE TABLE IF NOT EXISTS admin (
    admin_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS teacher (
    teacher_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    department VARCHAR(80) NOT NULL DEFAULT 'Computer Science & Engineering',
    admin_id VARCHAR(20),
    CONSTRAINT fk_teacher_admin FOREIGN KEY (admin_id) REFERENCES admin(admin_id)
);

CREATE TABLE IF NOT EXISTS school_class (
    class_id VARCHAR(20) PRIMARY KEY,
    class_name VARCHAR(60) NOT NULL,
    section VARCHAR(10) NOT NULL
);

CREATE TABLE IF NOT EXISTS subject (
    subject_id VARCHAR(20) PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    teacher_id VARCHAR(20) NOT NULL,
    class_id VARCHAR(20) NOT NULL,
    CONSTRAINT fk_subject_teacher FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id),
    CONSTRAINT fk_subject_class FOREIGN KEY (class_id) REFERENCES school_class(class_id)
);

CREATE TABLE IF NOT EXISTS student (
    student_id VARCHAR(20) PRIMARY KEY,
    roll_no VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    class_id VARCHAR(20) NOT NULL,
    admin_id VARCHAR(20),
    CONSTRAINT fk_student_class FOREIGN KEY (class_id) REFERENCES school_class(class_id),
    CONSTRAINT fk_student_admin FOREIGN KEY (admin_id) REFERENCES admin(admin_id)
);

CREATE TABLE IF NOT EXISTS attendance (
    attendance_id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(20) NOT NULL,
    subject_id VARCHAR(20) NOT NULL,
    teacher_id VARCHAR(20) NOT NULL,
    class_id VARCHAR(20) NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present', 'Absent') NOT NULL,
    CONSTRAINT fk_att_student FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_att_subject FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE,
    CONSTRAINT fk_att_teacher FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id),
    UNIQUE KEY uk_student_subject_date (student_id, subject_id, attendance_date)
);
