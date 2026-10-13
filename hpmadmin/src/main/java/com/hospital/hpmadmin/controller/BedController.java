package com.hospital.hpmadmin.controller;

import com.hospital.hpmadmin.dto.BedResponseDto;
import com.hospital.hpmadmin.dto.BedUpdateDto;
import com.hospital.hpmadmin.entity.Bed;
import com.hospital.hpmadmin.service.BedService;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/beds")
@RequiredArgsConstructor
public class BedController {

    private final BedService bedService;

    @PostMapping("/rooms/{roomId}")
    @ResponseStatus(HttpStatus.CREATED)
    public BedResponseDto createBed(
            @PathVariable UUID roomId,
            @Valid @RequestBody Bed request,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return bedService.create(roomId, request, actorId);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<BedResponseDto> getAllBeds() {
        return bedService.findAll();
    }

    @GetMapping("/rooms/{roomId}")
    @ResponseStatus(HttpStatus.OK)
    public List<BedResponseDto> getBedsByRoom(@PathVariable UUID roomId) {
        return bedService.findByRoom(roomId);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public BedResponseDto getBedById(@PathVariable UUID id) {
        return bedService.findById(id);
    }

    @PutMapping("/{id}/rooms/{roomId}")
    @ResponseStatus(HttpStatus.OK)
    public BedResponseDto updateBed(
            @PathVariable UUID id,
            @PathVariable UUID roomId,
            @Valid @RequestBody BedUpdateDto request,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return bedService.update(id, roomId, request, actorId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBed(
            @PathVariable UUID id,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        bedService.delete(id, actorId);
    }
}