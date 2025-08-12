package com.salary.controller;

import com.salary.entity.Attendance;
import com.salary.entity.SalaryRecord;
import com.salary.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('EMPLOYEE')")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @PostMapping("/check-in/{itemId}")
    public ResponseEntity<?> checkIn(@PathVariable Long itemId, Authentication auth) {
        try {
            Attendance attendance = employeeService.checkIn(auth.getName(), itemId);
            return ResponseEntity.ok(attendance);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/check-out/{attendanceId}")
    public ResponseEntity<?> checkOut(@PathVariable Long attendanceId, Authentication auth) {
        try {
            Attendance attendance = employeeService.checkOut(auth.getName(), attendanceId);
            return ResponseEntity.ok(attendance);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/attendances")
    public ResponseEntity<List<Attendance>> getMyAttendances(Authentication auth) {
        List<Attendance> attendances = employeeService.getMyAttendances(auth.getName());
        return ResponseEntity.ok(attendances);
    }

    @GetMapping("/public-items")
    public ResponseEntity<?> getActivePublicItems() {
        var items = employeeService.getActivePublicItems();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/salary-records")
    public ResponseEntity<List<SalaryRecord>> getMySalaryRecords(Authentication auth) {
        List<SalaryRecord> records = employeeService.getMySalaryRecords(auth.getName());
        return ResponseEntity.ok(records);
    }

    @GetMapping("/salary-records/{year}/{month}")
    public ResponseEntity<?> getMonthlySalary(
            @PathVariable int year, 
            @PathVariable int month, 
            Authentication auth) {
        try {
            SalaryRecord record = employeeService.getMonthlySalary(auth.getName(), year, month);
            return ResponseEntity.ok(record);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}