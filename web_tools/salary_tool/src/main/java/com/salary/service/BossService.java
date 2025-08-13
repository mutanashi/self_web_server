package com.salary.service;

import com.salary.dto.CreateEmployeeRequest;
import com.salary.dto.CreatePublicItemRequest;
import com.salary.entity.Attendance;
import com.salary.entity.PublicItem;
import com.salary.entity.SalaryRecord;
import com.salary.entity.User;
import com.salary.repository.AttendanceRepository;
import com.salary.repository.PublicItemRepository;
import com.salary.repository.SalaryRecordRepository;
import com.salary.repository.UserRepository;
import com.salary.util.PasswordGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class BossService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PublicItemRepository publicItemRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private SalaryRecordRepository salaryRecordRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    public User createEmployee(CreateEmployeeRequest request) {
        // Check if username or email exists
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("用戶名已存在");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("郵箱已被註冊");
        }

        // Generate random password
        String password = PasswordGenerator.generatePassword();

        // Create employee
        User employee = new User();
        employee.setUsername(request.getUsername());
        employee.setEmail(request.getEmail());
        employee.setPassword(passwordEncoder.encode(password));
        employee.setRole(User.Role.EMPLOYEE);
        employee.setEmployeeId("EMP" + System.currentTimeMillis());
        employee.setLabels(request.getLabels());
        employee.setEmailVerified(true); // Auto verify for boss-created accounts
        employee.setVerificationToken(UUID.randomUUID().toString());

        User savedEmployee = userRepository.save(employee);

        // Send credentials email
        emailService.sendEmployeeCredentials(savedEmployee, password);

        return savedEmployee;
    }

    public List<User> getAllEmployees() {
        return userRepository.findAllEmployees();
    }

    public User updateEmployeeLabels(Long employeeId, List<User.Label> labels) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("員工不存在"));

        if (employee.getRole() != User.Role.EMPLOYEE) {
            throw new RuntimeException("只能更新員工標籤");
        }

        employee.getLabels().clear();
        employee.getLabels().addAll(labels);
        return userRepository.save(employee);
    }

    public PublicItem createPublicItem(CreatePublicItemRequest request) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User boss = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("用戶不存在"));

        PublicItem item = new PublicItem();
        item.setTitle(request.getTitle());
        item.setDescription(request.getDescription());
        item.setType(request.getType());
        item.setHourlyRate(request.getHourlyRate());
        item.setFixedAmount(request.getFixedAmount());
        item.setStartDate(request.getStartDate());
        item.setEndDate(request.getEndDate());
        item.setCreatedBy(boss);

        return publicItemRepository.save(item);
    }

    public List<PublicItem> getAllPublicItems() {
        return publicItemRepository.findByActiveTrueOrderByCreatedAtDesc();
    }

    public List<Attendance> getAllAttendances() {
        return attendanceRepository.findAll();
    }

    public List<SalaryRecord> getAllSalaryRecords() {
        return salaryRecordRepository.findAll();
    }
}