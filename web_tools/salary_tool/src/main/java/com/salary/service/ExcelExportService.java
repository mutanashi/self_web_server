package com.salary.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import com.salary.dto.ExportRequest;
import com.salary.entity.SalaryRecord;
import com.salary.entity.User;
import com.salary.repository.SalaryRecordRepository;
import com.salary.repository.UserRepository;

@Service
public class ExcelExportService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SalaryRecordRepository salaryRecordRepository;

    public Resource exportSalaryData(ExportRequest request) throws IOException {
        List<User> employees = getEmployeesToExport(request);
        List<SalaryRecord> salaryRecords = salaryRecordRepository.findByUsersAndYearAndMonth(
                employees, request.getYear(), request.getMonth());

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("薪資報表");

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"員工編號", "員工姓名", "郵箱", "標籤", "年份", "月份", 
                              "基本薪資", "加班費", "獎金", "扣款", "總薪資", "工作時數", "狀態"};
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }

            // Fill data rows
            int rowNum = 1;
            for (SalaryRecord record : salaryRecords) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(record.getUser().getEmployeeId());
                row.createCell(1).setCellValue(record.getUser().getUsername());
                row.createCell(2).setCellValue(record.getUser().getEmail());
                row.createCell(3).setCellValue(record.getUser().getLabels().toString());
                row.createCell(4).setCellValue(record.getYear());
                row.createCell(5).setCellValue(record.getMonth());
                row.createCell(6).setCellValue(record.getBaseSalary().doubleValue());
                row.createCell(7).setCellValue(record.getOvertime().doubleValue());
                row.createCell(8).setCellValue(record.getBonus().doubleValue());
                row.createCell(9).setCellValue(record.getDeductions().doubleValue());
                row.createCell(10).setCellValue(record.getTotalSalary().doubleValue());
                row.createCell(11).setCellValue(record.getTotalHours().doubleValue());
                row.createCell(12).setCellValue(record.getStatus().toString());
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            
            return new ByteArrayResource(outputStream.toByteArray());
        }
    }

    private List<User> getEmployeesToExport(ExportRequest request) {
        List<User> employees = new ArrayList<>();

        if (request.getEmployeeIds() != null && !request.getEmployeeIds().isEmpty()) {
            employees.addAll(userRepository.findEmployeesByIds(request.getEmployeeIds()));
        } else if (request.getLabels() != null && !request.getLabels().isEmpty()) {
            for (User.Label label : request.getLabels()) {
                employees.addAll(userRepository.findEmployeesByLabel(label));
            }
        } else {
            employees.addAll(userRepository.findAllEmployees());
        }

        return employees;
    }
}