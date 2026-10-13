package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.Gender;
import com.hospital.hpmadmin.model.MaritalStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PatientResponseDto {
    private UUID id;
    private String patientNumber;
    private String firstName;
    private String middleName;
    private String lastName;
    private Gender gender;
    private LocalDate birthDate;
    private boolean active;
    private boolean alive;
    private List<AddressResponseDto> address;
    private List<ContactResponseDto> contacts;
    private List<ContactResponseDto> nextOfKinContacts;
    private MaritalStatus maritalStatus;
    private Boolean hasMultipleBirth;
    private Integer multipleBirthOrder;
}