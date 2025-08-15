package com.salary.repository;

import com.salary.entity.SalaryRecord;
import com.salary.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalaryRecordRepository extends JpaRepository<SalaryRecord, Long> {
    List<SalaryRecord> findByUserAndYearAndMonth(User user, int year, int month);
    List<SalaryRecord> findByUser(User user);
}

