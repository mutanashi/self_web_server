package com.salary.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.salary.entity.User;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendVerificationEmail(User user) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(user.getEmail());
        message.setSubject("薪資系統 - 郵箱驗證");
        message.setText("請點擊以下鏈接驗證您的郵箱：\n" +
                "http://localhost:8080/api/auth/verify-email?token=" + user.getVerificationToken());
        
        mailSender.send(message);
    }

    @Async
    public void sendEmployeeCredentials(User employee, String password) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(employee.getEmail());
        message.setSubject("薪資系統 - 帳號資訊");
        message.setText("您的薪資系統帳號已創建：\n" +
                "用戶名：" + employee.getUsername() + "\n" +
                "密碼：" + password + "\n" +
                "請登錄後修改密碼。");
        
        mailSender.send(message);
    }
}