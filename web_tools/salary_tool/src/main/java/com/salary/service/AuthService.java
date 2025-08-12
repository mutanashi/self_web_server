package com.salary.service;

import com.salary.dto.AuthRequest;
import com.salary.dto.AuthResponse;
import com.salary.dto.RegisterRequest;
import com.salary.entity.User;
import com.salary.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        // Check if username exists
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("用戶名已存在");
        }

        // Check if email exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("郵箱已被註冊");
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.BOSS); // First user is boss, others are employees
        user.setVerificationToken(UUID.randomUUID().toString());

        // Check if this is the first user (make them boss)
        long userCount = userRepository.count();
        if (userCount > 0) {
            user.setRole(User.Role.EMPLOYEE);
        }

        userRepository.save(user);

        // Send verification email
        emailService.sendVerificationEmail(user);

        // Generate JWT token
        String jwt = jwtService.generateToken(user);

        return new AuthResponse(jwt, user);
    }

    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );

        User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("用戶不存在"));

        if (!user.isEmailVerified()) {
            throw new RuntimeException("請先驗證郵箱");
        }

        String jwt = jwtService.generateToken(user);
        return new AuthResponse(jwt, user);
    }

    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
            .orElseThrow(() -> new RuntimeException("無效的驗證令牌"));

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);
    }

    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("用戶不存在"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("郵箱已驗證");
        }

        user.setVerificationToken(UUID.randomUUID().toString());
        userRepository.save(user);

        emailService.sendVerificationEmail(user);
    }
}