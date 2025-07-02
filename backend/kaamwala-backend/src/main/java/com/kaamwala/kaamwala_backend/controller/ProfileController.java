package com.kaamwala.kaamwala_backend.controller;

import com.kaamwala.kaamwala_backend.entity.User;
import com.kaamwala.kaamwala_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ELECTRICIAN')")
    public ResponseEntity<User> getProfile() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(user);
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ELECTRICIAN')")
    public ResponseEntity<User> updateProfile(@RequestBody User updated) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        user.setName(updated.getName());
        user.setMobile(updated.getMobile());
        // Only allow updating certain fields
        if (user.getRole().equals("ELECTRICIAN")) {
            user.setAge(updated.getAge());
            user.setAadhaar(updated.getAadhaar());
            user.setAvailable(updated.isAvailable());
        }
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }
} 