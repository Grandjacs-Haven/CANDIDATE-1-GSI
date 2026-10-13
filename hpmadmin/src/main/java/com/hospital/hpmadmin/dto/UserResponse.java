package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.Gender;
import com.hospital.hpmadmin.model.UserRole;
import com.hospital.hpmadmin.model.UserStatus;
import lombok.Builder;

import java.util.UUID;

@Builder
public record UserResponse(
        UUID id,
        String username,
        String email,
        String firstName,
        String lastName,
        String phoneNumber,
        UserRole role,
        UserStatus userStatus,
        Gender gender

) {}