package com.salary.service;

import com.salary.dto.AuthRequest;
import com.salary.dto.AuthResponse;
import com.salary.dto.RegisterRequest;
import com.salary.entity.User;
import com.salary.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final TemporaryTokenService tempTokenService;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService, EmailService emailService, TemporaryTokenService tempTokenService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.tempTokenService = tempTokenService;
    }

    @Transactional
    public void register(RegisterRequest req) {
        users.findByEmail(req.getEmail().toLowerCase()).ifPresent(u -> { throw new IllegalArgumentException("Email already exists"); });
        users.findByUsername(req.getUsername()).ifPresent(u -> { throw new IllegalArgumentException("Username already exists"); });
        User u = new User();
        u.setEmail(req.getEmail().toLowerCase());
        u.setUsername(req.getUsername());
        u.setPassword(passwordEncoder.encode(req.getPassword()));
        u.setEnabled(false);
        String token = UUID.randomUUID().toString().replaceAll("-", "");
        u.setVerificationToken(token);
        users.save(u);
        emailService.sendVerificationEmail(u.getEmail(), token);
    }

    @Transactional
    public String verify(String token) {
        Optional<User> ou = users.findByVerificationToken(token);
        if (ou.isEmpty()) return "Invalid token";
        User u = ou.get();
        u.setEnabled(true);
        u.setVerificationToken(null);
        users.save(u);
        return "Verified";
    }

    public AuthResponse login(AuthRequest req) {
        User u = users.findByEmail(req.getEmail().toLowerCase())
                .orElseThrow(() -> new BadCredentialsException("Bad credentials"));
        if (!u.isEnabled()) {
            throw new BadCredentialsException("Account not verified");
        }
        if (!passwordEncoder.matches(req.getPassword(), u.getPassword())) {
            throw new BadCredentialsException("Bad credentials");
        }
        String token = jwtService.generateToken(u.getEmail());
        String tempToken = tempTokenService.issue(u.getEmail());
        return new AuthResponse(token, tempToken);
    }
}
