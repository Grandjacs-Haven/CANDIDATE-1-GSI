package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.ContactPoint;
import com.hospital.hpmadmin.model.RelationshipType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactRequestDto {

    private UUID patientId;         // For patient primary contact
    private UUID nextOfKinPatientId;// For patient next of kin contact
    private UUID practitionerId;    // For practitioner related contacts

    @NotBlank(message = "Name is required")
    private String name;

    private RelationshipType relationshipType;

    private List<ContactPoint> telecom = new ArrayList<>();

    // Optional nested address if you want to create/attach an address directly with the contact
    private AddressRequest address;
}