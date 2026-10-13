package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.Gender;
import com.hospital.hpmadmin.model.PractitionerType;
import com.hospital.hpmadmin.model.UserRole;
import com.hospital.hpmadmin.model.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PractitionerResponseDto {
    private UUID id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private UserRole role;
    private UserStatus userStatus;
    private Gender gender;

    private String practitionerNumber;
    private PractitionerType practitionerType;
    private String professionalTitle;
    private String licenseNumber;
    private String registrationBody;
    private String qualification;
    private String specialty;
    private boolean active;
}