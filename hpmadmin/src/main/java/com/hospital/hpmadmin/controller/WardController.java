package com.hospital.hpmadmin.controller;

import com.hospital.hpmadmin.dto.WardRequestDto;
import com.hospital.hpmadmin.dto.WardResponseDto;
import com.hospital.hpmadmin.dto.WardUpdateDto;
import com.hospital.hpmadmin.service.WardService;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/wards")
@RequiredArgsConstructor
public class WardController {

    private final WardService wardService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WardResponseDto createWard(
            @Valid @RequestBody WardRequestDto requestDto,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return wardService.create(requestDto, actorId);
    }

    @GetMapping
    public List<WardResponseDto> getAllWards() {
        return wardService.findAll();
    }

    @GetMapping("/{id}")
    public WardResponseDto getWardById(@PathVariable UUID id) {
        return wardService.findById(id);
    }

    @PutMapping("/{id}")
    public WardResponseDto updateWard(
            @PathVariable UUID id,
            @Valid @RequestBody WardUpdateDto requestDto,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return wardService.update(id, requestDto, actorId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteWard(
            @PathVariable UUID id,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        wardService.delete(id, actorId);
    }
}