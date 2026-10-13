package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.Gender;
import com.hospital.hpmadmin.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserRegistrationRequestDto {

    @NotBlank(message = "Username is required.")
    private String username;

    @NotBlank(message = "Email is required.")
    @Email(message = "Invalid email format.")
    private String email;

    @NotBlank(message = "Password is required.")
    private String password;

    @NotBlank(message = "First name is required.")
    private String firstName;

    @NotBlank(message = "Last name is required.")
    private String lastName;

    private String phoneNumber;

    @NotNull(message = "User role is required.")
    private UserRole role;

    private Gender gender;
}