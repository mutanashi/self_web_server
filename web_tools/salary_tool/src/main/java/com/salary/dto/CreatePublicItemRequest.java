package com.salary.dto;

import jakarta.validation.constraints.NotBlank;

public class CreatePublicItemRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String content;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}

