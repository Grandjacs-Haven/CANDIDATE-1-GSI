package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.entity.Address;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AddressResponseDto  {
    private UUID id;
    private String street;
    private String city;
    private String district;
    private String country;
}