package com.kaamwala.kaamwala_backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    // Customer registration
    @PostMapping("/register-customer")
    public ResponseEntity<?> registerCustomer(@RequestBody RegisterCustomerRequest request) {
        return authService.registerCustomer(request);
    }

    // Electrician registration
    @PostMapping("/register-electrician")
    public ResponseEntity<?> registerElectrician(@RequestBody RegisterElectricianRequest request) {
        return authService.registerElectrician(request);
    }

    // OTP verification
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        return authService.verifyOtp(request);
    }

    // Login (manual)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    // Google OAuth2 endpoints will be added later
} 