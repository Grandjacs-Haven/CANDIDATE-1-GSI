package com.hospital.hpmadmin.controller;

import com.hospital.hpmadmin.dto.ProcedurePerformerRequestDto;
import com.hospital.hpmadmin.dto.ProcedurePerformerResponseDto;
import com.hospital.hpmadmin.dto.ProcedurePerformerUpdateDto;
import com.hospital.hpmadmin.model.ProcedurePerformerRole;
import com.hospital.hpmadmin.service.ProcedurePerformerService;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/procedure-performers")
@RequiredArgsConstructor
public class ProcedurePerformerController {

    private final ProcedurePerformerService performerService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProcedurePerformerResponseDto create(
            @Valid @RequestBody ProcedurePerformerRequestDto requestDto,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return performerService.create(requestDto, actorId);
    }

    @GetMapping("/{id}")
    public ProcedurePerformerResponseDto findById(@PathVariable UUID id) {
        return performerService.findById(id);
    }

    @GetMapping("/procedure/{procedureId}")
    public List<ProcedurePerformerResponseDto> findByProcedureId(@PathVariable UUID procedureId) {
        return performerService.findByProcedureId(procedureId);
    }

    @GetMapping("/practitioner/{practitionerId}")
    public List<ProcedurePerformerResponseDto> findByPractitionerId(@PathVariable UUID practitionerId) {
        return performerService.findByPractitionerId(practitionerId);
    }

    @PutMapping("/{id}")
    public ProcedurePerformerResponseDto update(
            @PathVariable UUID id,
            @Valid @RequestBody ProcedurePerformerUpdateDto requestDto,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return performerService.update(id, requestDto, actorId);
    }

    @PatchMapping("/{id}/role")
    public ProcedurePerformerResponseDto updateRole(
            @PathVariable UUID id,
             @RequestParam ProcedurePerformerRole role,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return performerService.updateRole(id, role, actorId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable UUID id,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        performerService.delete(id, actorId);
    }
}