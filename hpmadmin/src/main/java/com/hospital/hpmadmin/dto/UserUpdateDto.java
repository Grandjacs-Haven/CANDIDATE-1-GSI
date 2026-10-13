package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.Gender;
import com.hospital.hpmadmin.model.UserStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateDto {
    private String firstName;
    private String lastName;

    @Size(max = 15, message = "Phone number cannot exceed 15 characters")
    private String phoneNumber;

    private Gender gender;
    private UserStatus userStatus;
}