package com.salary.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "salary_records")
public class SalaryRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    private int year;
    private int month;
    
    private BigDecimal baseSalary;
    private BigDecimal overtime;
    private BigDecimal bonus;
    private BigDecimal deductions;
    private BigDecimal totalSalary;
    
    private int workingDays;
    private int actualWorkingDays;
    private BigDecimal totalHours;
    
    @Enumerated(EnumType.STRING)
    private Status status;
    
    private String notes;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public SalaryRecord() {}
    
    public SalaryRecord(User user, int year, int month) {
        this.user = user;
        this.year = year;
        this.month = month;
        this.status = Status.PENDING;
        this.baseSalary = BigDecimal.ZERO;
        this.overtime = BigDecimal.ZERO;
        this.bonus = BigDecimal.ZERO;
        this.deductions = BigDecimal.ZERO;
        this.totalSalary = BigDecimal.ZERO;
        this.totalHours = BigDecimal.ZERO;
    }

    // Calculate total salary
    public void calculateTotalSalary() {
        this.totalSalary = baseSalary.add(overtime).add(bonus).subtract(deductions);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }

    public BigDecimal getBaseSalary() { return baseSalary; }
    public void setBaseSalary(BigDecimal baseSalary) { 
        this.baseSalary = baseSalary;
        calculateTotalSalary();
    }

    public BigDecimal getOvertime() { return overtime; }
    public void setOvertime(BigDecimal overtime) { 
        this.overtime = overtime;
        calculateTotalSalary();
    }

    public BigDecimal getBonus() { return bonus; }
    public void setBonus(BigDecimal bonus) { 
        this.bonus = bonus;
        calculateTotalSalary();
    }

    public BigDecimal getDeductions() { return deductions; }
    public void setDeductions(BigDecimal deductions) { 
        this.deductions = deductions;
        calculateTotalSalary();
    }

    public BigDecimal getTotalSalary() { return totalSalary; }
    public void setTotalSalary(BigDecimal totalSalary) { this.totalSalary = totalSalary; }

    public int getWorkingDays() { return workingDays; }
    public void setWorkingDays(int workingDays) { this.workingDays = workingDays; }

    public int getActualWorkingDays() { return actualWorkingDays; }
    public void setActualWorkingDays(int actualWorkingDays) { this.actualWorkingDays = actualWorkingDays; }

    public BigDecimal getTotalHours() { return totalHours; }
    public void setTotalHours(BigDecimal totalHours) { this.totalHours = totalHours; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public enum Status {
        PENDING, APPROVED, PAID
    }
}