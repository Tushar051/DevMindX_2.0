package com.kaamwala.kaamwala_backend.controller;

import com.kaamwala.kaamwala_backend.entity.Booking;
import com.kaamwala.kaamwala_backend.entity.User;
import com.kaamwala.kaamwala_backend.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    @Autowired
    private BookingRepository bookingRepository;

    // Book an electrician (customer)
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> bookElectrician(@RequestBody Booking booking) {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        booking.setCustomerId(user.getId());
        booking.setStatus("PENDING");
        booking.setCreatedAt(java.time.LocalDateTime.now());
        bookingRepository.save(booking);
        return ResponseEntity.ok("Booking created");
    }

    // View booking history (customer)
    @GetMapping("/history")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<Booking>> getBookingHistory() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<Booking> bookings = bookingRepository.findByCustomerId(user.getId());
        return ResponseEntity.ok(bookings);
    }

    // View assigned bookings (electrician)
    @GetMapping("/assigned")
    @PreAuthorize("hasRole('ELECTRICIAN')")
    public ResponseEntity<List<Booking>> getAssignedBookings() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        List<Booking> bookings = bookingRepository.findByElectricianId(user.getId());
        return ResponseEntity.ok(bookings);
    }
} 