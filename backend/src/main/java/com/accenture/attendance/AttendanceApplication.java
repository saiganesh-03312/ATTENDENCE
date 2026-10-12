package com.accenture.attendance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@SpringBootApplication
@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class AttendanceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AttendanceApplication.class, args);
    }

    @GetMapping("/health")
    public Map<String, Object> healthCheck() {
        return Map.of(
            "service", "Online Attendance Management System API",
            "runtime", "Java 17 / Spring Boot 3.2.5",
            "status", "UP",
            "timestamp", LocalDate.now().toString()
        );
    }
}
