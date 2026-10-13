package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.BedStatus;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BedUpdateDto {

    @Size(max = 30, message = "Bed number must not exceed 30 characters")
    private String bedNumber;

    private BedStatus bedStatus;

    private String description;
}