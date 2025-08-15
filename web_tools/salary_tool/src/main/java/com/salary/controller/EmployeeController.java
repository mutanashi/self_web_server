package com.salary.controller;

import com.salary.dto.SendEmailRequest;
import com.salary.entity.Attendance;
import com.salary.entity.SalaryRecord;
import com.salary.service.EmployeeService;
import com.salary.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {
    private final EmployeeService employeeService;
    private final EmailService emailService;

    public EmployeeController(EmployeeService employeeService, EmailService emailService) {
        this.employeeService = employeeService;
        this.emailService = emailService;
    }

    @PostMapping("/clock-in")
    public ResponseEntity<Attendance> clockIn(Authentication auth) {
        String email = auth.getName();
        return ResponseEntity.ok(employeeService.clockIn(email));
    }

    @GetMapping("/salaries")
    public ResponseEntity<List<SalaryRecord>> salaries(Authentication auth,
                                                       @RequestParam(value = "year", required = false) Integer year,
                                                       @RequestParam(value = "month", required = false) Integer month) {
        String email = auth.getName();
        return ResponseEntity.ok(employeeService.listSalaries(email, year, month));
    }

    @GetMapping("/attendances")
    public ResponseEntity<List<Attendance>> attendances(Authentication auth,
                                                        @RequestParam("start") String start,
                                                        @RequestParam("end") String end) {
        String email = auth.getName();
        return ResponseEntity.ok(employeeService.listAttendances(email, LocalDate.parse(start), LocalDate.parse(end)));
    }

    // Public items feed for employees
    @GetMapping("/public-items")
    public ResponseEntity<?> publicItems() {
        return ResponseEntity.ok(employeeService.listPublicItems());
    }

    // Send a simple email to the logged-in user's email address
    @PostMapping("/email-me")
    public ResponseEntity<?> emailMe(Authentication auth, @RequestBody(required = false) SendEmailRequest req) {
        String email = auth.getName();
        String subject = (req != null && req.getSubject() != null && !req.getSubject().isBlank())
                ? req.getSubject() : "Hello from Salary System";
        String body = (req != null && req.getBody() != null && !req.getBody().isBlank())
                ? req.getBody() : "You triggered this email from the web UI. If you didn't expect this, ignore it.";
        emailService.sendSimpleEmail(email, subject, body);
        return ResponseEntity.ok().build();
    }
}
