package com.salary.service;

import com.salary.dto.CreateEmployeeRequest;
import com.salary.dto.CreatePublicItemRequest;
import com.salary.dto.ExportRequest;
import com.salary.entity.Label;
import com.salary.entity.PublicItem;
import com.salary.entity.Role;
import com.salary.entity.User;
import com.salary.repository.LabelRepository;
import com.salary.repository.PublicItemRepository;
import com.salary.repository.UserRepository;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class BossService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LabelRepository labelRepository;
    private final PublicItemRepository publicItemRepository;

    public BossService(UserRepository userRepository, PasswordEncoder passwordEncoder, LabelRepository labelRepository, PublicItemRepository publicItemRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.labelRepository = labelRepository;
        this.publicItemRepository = publicItemRepository;
    }

    public User createEmployee(CreateEmployeeRequest req) {
        userRepository.findByEmail(req.getEmail()).ifPresent(u -> { throw new IllegalArgumentException("Email already registered"); });
        userRepository.findByUsername(req.getUsername()).ifPresent(u -> { throw new IllegalArgumentException("Username already registered"); });
        User user = new User();
        user.setEmail(req.getEmail());
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(Role.EMPLOYEE);
        user.setEnabled(true); // created by boss, enabled directly
        if (req.getLabels() != null && !req.getLabels().isEmpty()) {
            Set<Label> labels = new HashSet<>();
            for (String name : req.getLabels()) {
                Label label = labelRepository.findByName(name).orElseGet(() -> labelRepository.save(new Label(name)));
                labels.add(label);
            }
            user.getLabels().addAll(labels);
        }
        return userRepository.save(user);
    }

    public PublicItem createPublicItem(CreatePublicItemRequest req) {
        PublicItem item = new PublicItem();
        item.setTitle(req.getTitle());
        item.setContent(req.getContent());
        return publicItemRepository.save(item);
    }

    public Path exportEmployees(ExportRequest req) throws Exception {
        Set<String> labelNames = req.getLabelNames();
        List<User> users;
        if (labelNames == null || labelNames.isEmpty()) {
            users = userRepository.findAll().stream().filter(u -> u.getRole() == Role.EMPLOYEE).toList();
        } else {
            users = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.EMPLOYEE)
                    .filter(u -> u.getLabels().stream().anyMatch(l -> labelNames.contains(l.getName())))
                    .collect(Collectors.toList());
        }
        Workbook wb = new XSSFWorkbook();
        Sheet sheet = wb.createSheet("employees");
        int r = 0;
        Row header = sheet.createRow(r++);
        header.createCell(0).setCellValue("ID");
        header.createCell(1).setCellValue("Email");
        header.createCell(2).setCellValue("Labels");
        for (User u : users) {
            Row row = sheet.createRow(r++);
            row.createCell(0).setCellValue(u.getId());
            row.createCell(1).setCellValue(u.getEmail());
            String labels = u.getLabels().stream().map(Label::getName).collect(Collectors.joining(","));
            row.createCell(2).setCellValue(labels);
        }
        Files.createDirectories(Path.of("exports"));
        String fileName = "exports/export-" + LocalDate.now() + ".xlsx";
        try (FileOutputStream fos = new FileOutputStream(fileName)) {
            wb.write(fos);
        }
        wb.close();
        return Path.of(fileName).toAbsolutePath();
    }
}
