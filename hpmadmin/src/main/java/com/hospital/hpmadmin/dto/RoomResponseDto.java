package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.RoomStatus;
import com.hospital.hpmadmin.model.RoomType;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class RoomResponseDto {
    private UUID id;
    private UUID wardId;
    private String wardName;
    private String roomNumber;
    private RoomType roomType;      // Adjust to your RoomType enum if you use one
    private Integer capacity;
    private RoomStatus status;        // Adjust to your RoomStatus/OperationalStatus enum if you use one
    private String description;
}