// AttendanceRepository.java
package com.salary.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.salary.entity.Attendance;
import com.salary.entity.User;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByUserOrderByCreatedAtDesc(User user);
    
    @Query("SELECT a FROM Attendance a WHERE a.user = :user AND a.checkInTime BETWEEN :start AND :end")
    List<Attendance> findByUserAndDateRange(
        @Param("user") User user, 
        @Param("start") LocalDateTime start, 
        @Param("end") LocalDateTime end
    );
    
    @Query("SELECT a FROM Attendance a WHERE a.user = :user AND a.status = 'CHECKED_IN'")
    Optional<Attendance> findActiveAttendance(@Param("user") User user);
    
    @Query("SELECT a FROM Attendance a WHERE YEAR(a.checkInTime) = :year AND MONTH(a.checkInTime) = :month")
    List<Attendance> findByYearAndMonth(@Param("year") int year, @Param("month") int month);
}