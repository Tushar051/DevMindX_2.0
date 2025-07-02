package com.kaamwala.kaamwala_backend.controller;

import com.kaamwala.kaamwala_backend.entity.User;
import com.kaamwala.kaamwala_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/electricians")
public class ElectricianController {
    @Autowired
    private UserRepository userRepository;

    // List all electricians (for customers)
    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<User>> getAllElectricians() {
        List<User> electricians = userRepository.findAll().stream()
            .filter(u -> "ELECTRICIAN".equals(u.getRole()))
            .toList();
        return ResponseEntity.ok(electricians);
    }

    // Set availability (for electricians)
    @PostMapping("/availability")
    @PreAuthorize("hasRole('ELECTRICIAN')")
    public ResponseEntity<?> setAvailability(@RequestBody boolean available, @RequestAttribute("user") User user) {
        // TODO: Implement availability logic (add field to User if needed)
        return ResponseEntity.ok("Availability set (placeholder)");
    }
} 