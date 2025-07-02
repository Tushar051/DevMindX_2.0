package com.kaamwala.kaamwala_backend;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String name;
    private String email;
    private String password; // hashed
    private String role; // CUSTOMER or ELECTRICIAN
    private Integer age; // for electrician
    private String aadhaar; // for electrician
    private String mobile;
    private String provider; // manual or google
    private boolean verified; // after OTP
    private String otp;
    private LocalDateTime otpGeneratedAt;
    private LocalDateTime createdAt;

    // Getters and setters omitted for brevity
} 