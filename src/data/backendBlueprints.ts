export interface CodeBlueprint {
  id: string;
  filename: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const SPRING_BOOT_DOCKER_BLUEPRINTS: CodeBlueprint[] = [
  {
    id: 'docker-compose',
    filename: 'docker-compose.yml',
    path: '/docker-compose.yml',
    language: 'yaml',
    description: 'Multi-container orchestration for MySQL 8.0, Java 17 Spring Boot REST API, and React Vite Frontend.',
    content: `version: '3.9'

services:
  mysql-db:
    image: mysql:8.0
    container_name: accenttrack-mysql
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: attendance_db
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_USER: attendance_user
      MYSQL_PASSWORD: attendance_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/src/main/resources/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-prootpassword"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - accenttrack-net

  springboot-api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: accenttrack-springboot-api
    restart: unless-stopped
    depends_on:
      mysql-db:
        condition: service_healthy
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql-db:3306/attendance_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
      SPRING_DATASOURCE_USERNAME: attendance_user
      SPRING_DATASOURCE_PASSWORD: attendance_password
      SPRING_JPA_HIBERNATE_DDL_AUTO: update
      SERVER_PORT: 8080
    ports:
      - "8080:8080"
    networks:
      - accenttrack-net

  frontend-ui:
    image: node:20-alpine
    container_name: accenttrack-frontend
    working_dir: /app
    volumes:
      - ./:/app
    command: sh -c "npm install && npm run dev -- --host 0.0.0.0 --port 3000"
    environment:
      VITE_API_BASE_URL: http://localhost:8080/api/v1
    ports:
      - "3000:3000"
    depends_on:
      - springboot-api
    networks:
      - accenttrack-net

volumes:
  mysql_data:

networks:
  accenttrack-net:
    driver: bridge`,
  },
  {
    id: 'dockerfile',
    filename: 'Dockerfile',
    path: '/backend/Dockerfile',
    language: 'dockerfile',
    description: 'Two-stage Maven & Eclipse Temurin JRE 17 container build for the Spring Boot service.',
    content: `# Stage 1: Build the Spring Boot JAR with Maven
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /workspace
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the Spring Boot application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /workspace/target/online-attendance-system-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]`,
  },
  {
    id: 'controller',
    filename: 'AttendanceController.java',
    path: '/backend/src/main/java/com/accenture/attendance/AttendanceController.java',
    language: 'java',
    description: 'Spring Boot REST Controller implementing Teacher attendance marking, Student percentage summary, and Admin CRUD endpoints.',
    content: `package com.accenture.attendance;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    // 1. Mark batch attendance for a selected Class, Subject, and Date (Teacher Module)
    @PostMapping("/mark-batch")
    public ResponseEntity<Map<String, Object>> markBatchAttendance(
            @RequestBody BatchAttendanceRequest request) {
        int savedCount = attendanceService.saveBatchAttendance(request);
        return ResponseEntity.ok(Map.of(
            "status", "COMMITTED",
            "recordsUpdated", savedCount,
            "classId", request.getClassId(),
            "subjectId", request.getSubjectId(),
            "date", request.getDate()
        ));
    }

    // 2. Get Student Attendance Summary & Percentage: (Attended / Held) * 100
    @GetMapping("/student/{studentId}/summary")
    public ResponseEntity<StudentAttendanceSummaryDTO> getStudentSummary(
            @PathVariable String studentId) {
        return ResponseEntity.ok(attendanceService.calculateStudentSummary(studentId));
    }

    // 3. Query filtered Attendance Report by Class, Subject, and Date
    @GetMapping("/reports")
    public ResponseEntity<List<AttendanceRecordDTO>> getFilteredReport(
            @RequestParam(required = false) String classId,
            @RequestParam(required = false) String subjectId,
            @RequestParam(required = false) LocalDate date) {
        return ResponseEntity.ok(attendanceService.findFilteredRecords(classId, subjectId, date));
    }
}`,
  },
  {
    id: 'schema-sql',
    filename: 'schema.sql',
    path: '/backend/src/main/resources/schema.sql',
    language: 'sql',
    description: 'Relational MySQL schema implementing all 6 ER Diagram entities: Admin, Teacher, Class, Subject, Student, and Attendance.',
    content: `-- Online Attendance Management System (ER Diagram Schema)
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
);`,
  },
  {
    id: 'pom-xml',
    filename: 'pom.xml',
    path: '/backend/pom.xml',
    language: 'xml',
    description: 'Maven configuration with Spring Boot 3.2.5 Starter Web, Spring Data JPA, Validation, and MySQL Connector/J.',
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/>
    </parent>

    <groupId>com.accenture.attendance</groupId>
    <artifactId>online-attendance-system</artifactId>
    <version>1.0.0</version>
    <name>OnlineAttendanceManagementSystem</name>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
    </dependencies>
</project>`,
  },
];
