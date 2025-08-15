package com.salary.dto;

import java.util.Set;

public class ExportRequest {
    private Set<String> labelNames; // optional
    private Integer year; // optional filter
    private Integer month; // optional filter

    public Set<String> getLabelNames() { return labelNames; }
    public void setLabelNames(Set<String> labelNames) { this.labelNames = labelNames; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
}
