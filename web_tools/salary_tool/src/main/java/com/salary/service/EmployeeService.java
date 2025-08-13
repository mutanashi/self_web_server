package com.salary.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.salary.entity.Attendance;
import com.salary.entity.PublicItem;
import com.salary.entity.SalaryRecord;
import com.salary.entity.User;
import com.salary.repository.AttendanceRepository;
import com.salary.repository.PublicItemRepository;
import com.salary.repository.SalaryRecordRepository;
import com.salary.repository.UserRepository;

@Service
public class EmployeeService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private PublicItemRepository publicItemRepository;

    @Autowired
    private SalaryRecordRepository salaryRecordRepository;

    public Attendance checkIn(String username, Long itemId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用戶不存在"));

        PublicItem item = publicItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("工作項目不存在"));

        // Check if already checked in
        if (attendanceRepository.findActiveAttendance(user).isPresent()) {
            throw new RuntimeException("您已經打卡，請先簽退");
        }

        Attendance attendance = new Attendance(user, item);
        return attendanceRepository.save(attendance);
    }

    public Attendance checkOut(String username, Long attendanceId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用戶不存在"));

        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("打卡記錄不存在"));

        if (!attendance.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("無權限操作此打卡記錄");
        }

        if (attendance.getStatus() != Attendance.Status.CHECKED_IN) {
            throw new RuntimeException("此記錄已簽退");
        }

        attendance.setCheckOutTime(LocalDateTime.now());
        attendance.setStatus(Attendance.Status.CHECKED_OUT);

        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getMyAttendances(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用戶不存在"));

        return attendanceRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<PublicItem> getActivePublicItems() {
        return publicItemRepository.findActiveItems(LocalDateTime.now());
    }

    public List<SalaryRecord> getMySalaryRecords(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用戶不存在"));

        return salaryRecordRepository.findByUserOrderByYearDescMonthDesc(user);
    }

    public SalaryRecord getMonthlySalary(String username, int year, int month) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用戶不存在"));

        return salaryRecordRepository.findByUserAndYearAndMonth(user, year, month)
                .orElseThrow(() -> new RuntimeException("該月份薪資記錄不存在"));
    }
}