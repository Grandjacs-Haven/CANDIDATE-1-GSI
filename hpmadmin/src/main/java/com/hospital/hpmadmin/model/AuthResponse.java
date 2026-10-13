package com.hospital.hpmadmin.model;

import com.hospital.hpmadmin.model.UserRole;
import lombok.Builder;
import lombok.Data;

import java.util.Date;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
public class AuthResponse {
    private String token;
    private UUID userId;
    private long expiresAt;
    private UserRole role;
    private Set<String> scopes;
}