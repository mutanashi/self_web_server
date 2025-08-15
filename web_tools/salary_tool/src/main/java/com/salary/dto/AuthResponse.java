package com.salary.dto;

public class AuthResponse {
    private String token; // JWT for protected APIs
    private String tempToken; // short-lived opaque token

    public AuthResponse() {}

    public AuthResponse(String token, String tempToken) {
        this.token = token;
        this.tempToken = tempToken;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTempToken() { return tempToken; }
    public void setTempToken(String tempToken) { this.tempToken = tempToken; }
}
