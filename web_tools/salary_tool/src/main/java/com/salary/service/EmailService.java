package com.salary.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String from;

    @Value("${server.port:8080}")
    private int serverPort;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String to, String token) {
        String verifyUrl = "http://localhost:" + serverPort + "/api/auth/verify?token=" + token;
        String subject = "Verify your Salary System account";
        String text = "Welcome! Please verify your email by visiting: " + verifyUrl +
                "\nIf the link doesn't work, use this token: " + token;
        sendSimpleEmail(to, subject, text);
    }

    public void sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            if (from != null && !from.isBlank()) message.setFrom(from);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Sent email to {} with subject '{}'", to, subject);
        } catch (Exception e) {
            log.warn("Failed to send email: {}", e.getMessage());
        }
    }
}
