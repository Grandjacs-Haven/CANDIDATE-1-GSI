package com.hospital.hpmadmin.controller;

import com.hospital.hpmadmin.dto.ProcedureRequestDto;
import com.hospital.hpmadmin.dto.ProcedureResponseDto;
import com.hospital.hpmadmin.dto.ProcedureUpdateDto;
import com.hospital.hpmadmin.service.ProcedureService;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/procedures")
@RequiredArgsConstructor
public class ProcedureController {

    private final ProcedureService procedureService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProcedureResponseDto createProcedure(
            @Valid @RequestBody ProcedureRequestDto requestDto,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return procedureService.create(requestDto, actorId);
    }

    @GetMapping
    public List<ProcedureResponseDto> getAllProcedures() {
        return procedureService.findAll();
    }

    @GetMapping("/{id}")
    public ProcedureResponseDto getProcedureById(@PathVariable UUID id) {
        return procedureService.findById(id);
    }

    @GetMapping("/encounters/{encounterId}")
    public List<ProcedureResponseDto> getProceduresByEncounter(@PathVariable UUID encounterId) {
        return procedureService.findByEncounterId(encounterId);
    }

    @PutMapping("/{id}")
    public ProcedureResponseDto updateProcedure(
            @PathVariable UUID id,
            @Valid @RequestBody ProcedureUpdateDto requestDto,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return procedureService.update(id, requestDto, actorId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProcedure(
            @PathVariable UUID id,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        procedureService.delete(id, actorId);
    }
}