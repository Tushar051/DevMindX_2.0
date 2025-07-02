package com.kaamwala.kaamwala_backend;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;
    private String customerId;
    private String electricianId;
    private String description;
    private LocalDateTime dateTime;
    private String address;
    private String status; // e.g., PENDING, CONFIRMED, COMPLETED
    private LocalDateTime createdAt;

    // Getters and setters omitted for brevity
} 