package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.entity.Address;
import com.hospital.hpmadmin.model.ContactPoint;
import com.hospital.hpmadmin.model.RelationshipType;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ContactResponseDto {
    private UUID id;
    private UUID patientId;
    private RelationshipType relationship;
    private String name;
    private List<ContactPoint> telecom;
    private AddressResponseDto address;
}