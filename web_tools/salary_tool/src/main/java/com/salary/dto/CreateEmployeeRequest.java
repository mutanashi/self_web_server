// CreateEmployeeRequest.java
package com.salary.dto;

import java.util.Set;

import com.salary.entity.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class CreateEmployeeRequest {
    @NotBlank
    private String username;
    
    @Email
    @NotBlank
    private String email;
    
    private Set<User.Label> labels;

    public CreateEmployeeRequest() {}

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Set<User.Label> getLabels() { return labels; }
    public void setLabels(Set<User.Label> labels) { this.labels = labels; }
}