package com.kaamwala.kaamwala_backend.service;

import com.kaamwala.kaamwala_backend.repository.UserRepository;
import com.kaamwala.kaamwala_backend.dto.RegisterCustomerRequest;
import com.kaamwala.kaamwala_backend.dto.RegisterElectricianRequest;
import com.kaamwala.kaamwala_backend.dto.VerifyOtpRequest;
import com.kaamwala.kaamwala_backend.dto.LoginRequest;
import com.kaamwala.kaamwala_backend.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.kaamwala.kaamwala_backend.config.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.Map;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JavaMailSender mailSender;
    @Autowired
    private JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final SecureRandom random = new SecureRandom();
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;
    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;
    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String googleRedirectUri;

    private String generateOtp() {
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    private void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your Kaamwala OTP");
        message.setText("Your OTP is: " + otp);
        mailSender.send(message);
    }

    public ResponseEntity<?> registerCustomer(RegisterCustomerRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setMobile(request.getMobile());
        user.setRole("CUSTOMER");
        user.setProvider("manual");
        user.setVerified(false);
        user.setCreatedAt(LocalDateTime.now());
        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpGeneratedAt(LocalDateTime.now());
        userRepository.save(user);
        sendOtpEmail(user.getEmail(), otp);
        return ResponseEntity.ok("OTP sent to email");
    }

    public ResponseEntity<?> registerElectrician(RegisterElectricianRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setMobile(request.getMobile());
        user.setRole("ELECTRICIAN");
        user.setProvider("manual");
        user.setAge(request.getAge());
        user.setAadhaar(request.getAadhaar());
        user.setVerified(false);
        user.setCreatedAt(LocalDateTime.now());
        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpGeneratedAt(LocalDateTime.now());
        userRepository.save(user);
        sendOtpEmail(user.getEmail(), otp);
        return ResponseEntity.ok("OTP sent to email");
    }

    public ResponseEntity<?> verifyOtp(VerifyOtpRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User user = userOpt.get();
        if (user.isVerified()) {
            return ResponseEntity.badRequest().body("User already verified");
        }
        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
            return ResponseEntity.badRequest().body("Invalid OTP");
        }
        if (user.getOtpGeneratedAt().plusMinutes(10).isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("OTP expired");
        }
        user.setVerified(true);
        user.setOtp(null);
        user.setOtpGeneratedAt(null);
        userRepository.save(user);
        return ResponseEntity.ok("User verified successfully");
    }

    public ResponseEntity<?> login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
        User user = userOpt.get();
        if (!user.isVerified()) {
            return ResponseEntity.badRequest().body("User not verified");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        return ResponseEntity.ok().body(token);
    }

    public String handleGoogleOAuth2Callback(String code) {
        RestTemplate restTemplate = new RestTemplate();
        // 1. Exchange code for access token
        String tokenUrl = "https://oauth2.googleapis.com/token";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        String body = "code=" + code +
                "&client_id=" + googleClientId +
                "&client_secret=" + googleClientSecret +
                "&redirect_uri=" + googleRedirectUri +
                "&grant_type=authorization_code";
        HttpEntity<String> request = new HttpEntity<>(body, headers);
        Map<String, Object> tokenResponse = restTemplate.postForObject(tokenUrl, request, Map.class);
        String accessToken = (String) tokenResponse.get("access_token");
        // 2. Get user info
        HttpHeaders userHeaders = new HttpHeaders();
        userHeaders.setBearerAuth(accessToken);
        HttpEntity<String> userRequest = new HttpEntity<>(userHeaders);
        Map<String, Object> userInfo = restTemplate.postForObject(
            "https://openidconnect.googleapis.com/v1/userinfo", userRequest, Map.class);
        String email = (String) userInfo.get("email");
        String name = (String) userInfo.get("name");
        // 3. Create user if not exists
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setRole("CUSTOMER");
            newUser.setProvider("google");
            newUser.setVerified(true);
            newUser.setCreatedAt(LocalDateTime.now());
            return userRepository.save(newUser);
        });
        // 4. Issue JWT
        return jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
    }
} 