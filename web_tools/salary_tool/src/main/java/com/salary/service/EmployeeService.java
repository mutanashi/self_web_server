package com.salary.service;

import com.salary.entity.Attendance;
import com.salary.entity.SalaryRecord;
import com.salary.entity.PublicItem;
import com.salary.entity.User;
import com.salary.repository.AttendanceRepository;
import com.salary.repository.SalaryRecordRepository;
import com.salary.repository.UserRepository;
import com.salary.repository.PublicItemRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class EmployeeService {
    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final SalaryRecordRepository salaryRecordRepository;
    private final PublicItemRepository publicItemRepository;

    public EmployeeService(UserRepository userRepository, AttendanceRepository attendanceRepository, SalaryRecordRepository salaryRecordRepository, PublicItemRepository publicItemRepository) {
        this.userRepository = userRepository;
        this.attendanceRepository = attendanceRepository;
        this.salaryRecordRepository = salaryRecordRepository;
        this.publicItemRepository = publicItemRepository;
    }

    public Attendance clockIn(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Attendance a = new Attendance();
        a.setUser(user);
        a.setCheckInTime(Instant.now());
        return attendanceRepository.save(a);
    }

    public List<SalaryRecord> listSalaries(String email, Integer year, Integer month) {
        User user = userRepository.findByEmail(email).orElseThrow();
        if (year != null && month != null) {
            return salaryRecordRepository.findByUserAndYearAndMonth(user, year, month);
        }
        return salaryRecordRepository.findByUser(user);
    }

    public List<Attendance> listAttendances(String email, LocalDate start, LocalDate end) {
        User user = userRepository.findByEmail(email).orElseThrow();
        Instant s = start.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant e = end.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        return attendanceRepository.findByUserAndCheckInTimeBetween(user, s, e);
    }

    public List<PublicItem> listPublicItems() {
        return publicItemRepository.findAll();
    }
}
