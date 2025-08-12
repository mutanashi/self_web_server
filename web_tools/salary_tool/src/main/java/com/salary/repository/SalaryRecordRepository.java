// SalaryRecordRepository.java
package com.salary.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.salary.entity.SalaryRecord;
import com.salary.entity.User;

@Repository
public interface SalaryRecordRepository extends JpaRepository<SalaryRecord, Long> {
    List<SalaryRecord> findByUserOrderByYearDescMonthDesc(User user);
    
    Optional<SalaryRecord> findByUserAndYearAndMonth(User user, int year, int month);
    
    @Query("SELECT s FROM SalaryRecord s WHERE s.year = :year AND s.month = :month")
    List<SalaryRecord> findByYearAndMonth(@Param("year") int year, @Param("month") int month);
    
    @Query("SELECT s FROM SalaryRecord s WHERE s.user IN :users AND s.year = :year AND s.month = :month")
    List<SalaryRecord> findByUsersAndYearAndMonth(
        @Param("users") List<User> users, 
        @Param("year") int year, 
        @Param("month") int month
    );
}