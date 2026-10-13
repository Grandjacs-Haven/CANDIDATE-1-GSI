package com.hospital.hpmadmin.controller;

import com.hospital.hpmadmin.dto.PractitionerRequestDto;
import com.hospital.hpmadmin.dto.PractitionerResponseDto;
import com.hospital.hpmadmin.service.PractitionerService;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/practitioners")
@RequiredArgsConstructor
public class PractitionerController {

    private final PractitionerService practitionerService;

    @GetMapping("/paged")
    public Page<PractitionerResponseDto> getPagedPractitioners(Pageable pageable) {
        return practitionerService.findAllPaged(pageable);
    }

    @GetMapping("/{id}")
    public PractitionerResponseDto getPractitionerById(@PathVariable UUID id) {
        return practitionerService.findById(id);
    }

    @PutMapping("/{id}")
    public PractitionerResponseDto updatePractitioner(
            @PathVariable UUID id,
            @Valid @RequestBody PractitionerRequestDto requestDto,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return practitionerService.updatePractitionerProfile(id, requestDto, actorId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePractitioner(
            @PathVariable UUID id,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        practitionerService.removePractitionerProfile(id, actorId);
    }
}