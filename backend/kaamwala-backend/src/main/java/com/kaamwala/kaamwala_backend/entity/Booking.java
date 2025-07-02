package com.kaamwala.kaamwala_backend.entity;

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

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public String getElectricianId() { return electricianId; }
    public void setElectricianId(String electricianId) { this.electricianId = electricianId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public java.time.LocalDateTime getDateTime() { return dateTime; }
    public void setDateTime(java.time.LocalDateTime dateTime) { this.dateTime = dateTime; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Getters and setters omitted for brevity
} 