// ExportRequest.java
package com.salary.dto;

import java.util.List;

import com.salary.entity.User;

public class ExportRequest {
    private int year;
    private int month;
    private List<User.Label> labels;
    private List<Long> employeeIds;

    public ExportRequest() {}

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }

    public List<User.Label> getLabels() { return labels; }
    public void setLabels(List<User.Label> labels) { this.labels = labels; }

    public List<Long> getEmployeeIds() { return employeeIds; }
    public void setEmployeeIds(List<Long> employeeIds) { this.employeeIds = employeeIds; }
}