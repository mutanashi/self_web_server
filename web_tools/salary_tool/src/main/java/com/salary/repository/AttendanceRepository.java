package com.salary.repository;

import com.salary.entity.Attendance;
import com.salary.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByUserAndCheckInTimeBetween(User user, Instant start, Instant end);
}

