package com.hospital.hpmadmin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {

    private UUID personid;       // Used for Patients
    private UUID practitionerId; // Used for Practitioners

    @NotBlank(message = "Street information is required")
    private String street;

    @NotBlank(message = "City is required")
    private String city;

    private String district;

    private String state;

    @NotBlank(message = "Country is required")
    private String country;
}