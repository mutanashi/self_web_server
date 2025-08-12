// CreatePublicItemRequest.java
package com.salary.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.salary.entity.PublicItem;

import jakarta.validation.constraints.NotBlank;

public class CreatePublicItemRequest {
    @NotBlank
    private String title;
    
    private String description;
    private PublicItem.ItemType type;
    private BigDecimal hourlyRate;
    private BigDecimal fixedAmount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    public CreatePublicItemRequest() {}

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public PublicItem.ItemType getType() { return type; }
    public void setType(PublicItem.ItemType type) { this.type = type; }

    public BigDecimal getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }

    public BigDecimal getFixedAmount() { return fixedAmount; }
    public void setFixedAmount(BigDecimal fixedAmount) { this.fixedAmount = fixedAmount; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
}