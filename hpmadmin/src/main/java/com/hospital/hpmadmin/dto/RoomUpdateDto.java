package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.RoomStatus;
import com.hospital.hpmadmin.model.RoomType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoomUpdateDto {

    @Size(max = 30, message = "Room number must not exceed 30 characters")
    private String roomNumber;

    private RoomType roomType;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private RoomStatus status;

    private String description;
}