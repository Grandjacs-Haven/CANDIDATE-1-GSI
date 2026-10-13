package com.hospital.hpmadmin.controller;

import com.hospital.hpmadmin.dto.RoomResponseDto;
import com.hospital.hpmadmin.dto.RoomUpdateDto;
import com.hospital.hpmadmin.entity.Room;
import com.hospital.hpmadmin.service.RoomService;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping("/wards/{wardId}")
    @ResponseStatus(HttpStatus.CREATED)
    public RoomResponseDto createRoom(
            @PathVariable UUID wardId,
            @Valid @RequestBody Room request,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return roomService.create(wardId, request, actorId);
    }

    @GetMapping
    public List<RoomResponseDto> getAllRooms() {
        return roomService.findAll();
    }

    @GetMapping("/wards/{wardId}")
    public List<RoomResponseDto> getRoomsByWard(@PathVariable UUID wardId) {
        return roomService.findByWard(wardId);
    }

    @GetMapping("/{id}")
    public RoomResponseDto getRoomById(@PathVariable UUID id) {
        return roomService.findById(id);
    }

    @PutMapping("/{id}/wards/{wardId}")
    public RoomResponseDto updateRoom(
            @PathVariable UUID id,
            @PathVariable UUID wardId,
            @Valid @RequestBody RoomUpdateDto request,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return roomService.update(id, wardId, request, actorId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRoom(
            @PathVariable UUID id,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        roomService.delete(id, actorId);
    }
}