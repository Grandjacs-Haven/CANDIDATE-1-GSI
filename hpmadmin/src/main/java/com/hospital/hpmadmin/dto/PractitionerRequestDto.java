package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.PractitionerType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PractitionerRequestDto {
    private String practitionerNumber;

    @NotNull(message = "Practitioner type is required")
    private PractitionerType practitionerType;

    private String professionalTitle;
    private String licenseNumber;
    private String registrationBody;
    private String qualification;
    private String specialty;
    private boolean active = true;
}