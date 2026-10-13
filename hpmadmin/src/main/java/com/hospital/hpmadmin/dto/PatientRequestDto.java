package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.Gender;
import com.hospital.hpmadmin.model.MaritalStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PatientRequestDto {

    @NotBlank(message = "Patient number is required.")
    private String patientNumber;

    @NotBlank(message = "First name is required.")
    private String firstName;

    private String middleName;

    @NotBlank(message = "Last name is required.")
    private String lastName;

    @NotBlank(message = "Gender is required.")
    private Gender gender;

    @NotNull(message = "Birth date is required.")
    private LocalDate birthDate;

    private boolean active = true;

    private boolean alive = true;

    private MaritalStatus maritalStatus;

    private Boolean  hasMultipleBirth;

    private Integer multipleBirthOrder;
}