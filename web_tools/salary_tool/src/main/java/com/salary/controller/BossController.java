package com.salary.controller;

import com.salary.dto.CreateEmployeeRequest;
import com.salary.dto.CreatePublicItemRequest;
import com.salary.dto.ExportRequest;
import com.salary.entity.User;
import com.salary.service.BossService;
import com.salary.service.ExcelExportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boss")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('BOSS')")
public class BossController {

    @Autowired
    private BossService bossService;

    @Autowired
    private ExcelExportService excelExportService;

    @PostMapping("/employees")
    public ResponseEntity<?> createEmployee(@Valid @RequestBody CreateEmployeeRequest request) {
        try {
            User employee = bossService.createEmployee(request);
            return ResponseEntity.ok(employee);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/employees")
    public ResponseEntity<List<User>> getAllEmployees() {
        List<User> employees = bossService.getAllEmployees();
        return ResponseEntity.ok(employees);
    }

    @PutMapping("/employees/{id}/labels")
    public ResponseEntity<?> updateEmployeeLabels(
            @PathVariable Long id, 
            @RequestBody List<User.Label> labels) {
        try {
            User employee = bossService.updateEmployeeLabels(id, labels);
            return ResponseEntity.ok(employee);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/public-items")
    public ResponseEntity<?> createPublicItem(@Valid @RequestBody CreatePublicItemRequest request) {
        try {
            var item = bossService.createPublicItem(request);
            return ResponseEntity.ok(item);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/public-items")
    public ResponseEntity<?> getAllPublicItems() {
        var items = bossService.getAllPublicItems();
        return ResponseEntity.ok(items);
    }

    @PostMapping("/export")
    public ResponseEntity<Resource> exportExcel(@Valid @RequestBody ExportRequest request) {
        try {
            Resource resource = excelExportService.exportSalaryData(request);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=salary_report.xlsx")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/attendances")
    public ResponseEntity<?> getAllAttendances() {
        var attendances = bossService.getAllAttendances();
        return ResponseEntity.ok(attendances);
    }

    @GetMapping("/salary-records")
    public ResponseEntity<?> getAllSalaryRecords() {
        var records = bossService.getAllSalaryRecords();
        return ResponseEntity.ok(records);
    }
}