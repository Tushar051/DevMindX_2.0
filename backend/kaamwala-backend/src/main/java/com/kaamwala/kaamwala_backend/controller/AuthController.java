package com.kaamwala.kaamwala_backend.controller;

import com.kaamwala.kaamwala_backend.service.AuthService;
import com.kaamwala.kaamwala_backend.dto.RegisterCustomerRequest;
import com.kaamwala.kaamwala_backend.dto.RegisterElectricianRequest;
import com.kaamwala.kaamwala_backend.dto.VerifyOtpRequest;
import com.kaamwala.kaamwala_backend.dto.LoginRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.user.OAuth2User;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;
    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String googleRedirectUri;

    @PostMapping("/register-customer")
    public ResponseEntity<?> registerCustomer(@RequestBody RegisterCustomerRequest request) {
        return authService.registerCustomer(request);
    }

    @PostMapping("/register-electrician")
    public ResponseEntity<?> registerElectrician(@RequestBody RegisterElectricianRequest request) {
        return authService.registerElectrician(request);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        return authService.verifyOtp(request);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/oauth2/authorize")
    public ResponseEntity<?> googleOAuth2Authorize() {
        String url = UriComponentsBuilder.fromUriString("https://accounts.google.com/o/oauth2/v2/auth")
                .queryParam("client_id", googleClientId)
                .queryParam("redirect_uri", googleRedirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", "openid profile email")
                .queryParam("access_type", "offline")
                .build().toUriString();
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(java.net.URI.create(url));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    @GetMapping("/oauth2/callback")
    public ResponseEntity<?> googleOAuth2Callback(@RequestParam("code") String code) {
        String jwt = authService.handleGoogleOAuth2Callback(code);
        return ResponseEntity.ok(jwt);
    }
} 