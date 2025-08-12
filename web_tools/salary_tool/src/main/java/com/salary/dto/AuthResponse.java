// AuthResponse.java
package com.salary.dto;

import com.salary.entity.User;

public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private User.Role role;
    private boolean emailVerified;

    public AuthResponse(String token, User user) {
        this.token = token;
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.emailVerified = user.isEmailVerified();
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public User.Role getRole() { return role; }
    public void setRole(User.Role role) { this.role = role; }

    public boolean isEmailVerified() { return emailVerified; }
    public void setEmailVerified(boolean emailVerified) { this.emailVerified = emailVerified; }
}