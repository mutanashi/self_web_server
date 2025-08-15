package com.salary.controller;

import com.salary.dto.CreateEmployeeRequest;
import com.salary.dto.CreatePublicItemRequest;
import com.salary.dto.ExportRequest;
import com.salary.entity.PublicItem;
import com.salary.entity.User;
import com.salary.service.BossService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;

@RestController
@RequestMapping("/api/boss")
@PreAuthorize("hasRole('BOSS')")
public class BossController {
    private final BossService bossService;

    public BossController(BossService bossService) {
        this.bossService = bossService;
    }

    @PostMapping("/employees")
    public ResponseEntity<User> createEmployee(@Valid @RequestBody CreateEmployeeRequest req) {
        return ResponseEntity.ok(bossService.createEmployee(req));
    }

    @PostMapping("/public-items")
    public ResponseEntity<PublicItem> createPublicItem(@Valid @RequestBody CreatePublicItemRequest req) {
        return ResponseEntity.ok(bossService.createPublicItem(req));
    }

    @PostMapping("/export")
    public ResponseEntity<String> export(@Valid @RequestBody ExportRequest req) throws Exception {
        Path path = bossService.exportEmployees(req);
        return ResponseEntity.ok(path.toString());
    }
}

