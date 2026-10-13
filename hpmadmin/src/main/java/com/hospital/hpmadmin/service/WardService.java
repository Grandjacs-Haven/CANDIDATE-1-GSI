package com.hospital.hpmadmin.service;

import com.hospital.hpmadmin.dto.WardRequestDto;
import com.hospital.hpmadmin.dto.WardResponseDto;
import com.hospital.hpmadmin.dto.WardUpdateDto;
import com.hospital.hpmadmin.entity.Ward;
import com.hospital.hpmadmin.repository.EncounterLocationRepository;
import com.hospital.hpmadmin.repository.RoomRepository;
import com.hospital.hpmadmin.repository.WardRepository;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class WardService {

    private final WardRepository wardRepository;
    private final RoomRepository roomRepository;
    private final EncounterLocationRepository encounterLocationRepository;

    public WardResponseDto create(WardRequestDto request, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);

        if (wardRepository.existsByCodeIgnoreCase(request.getCode())) {
            throw new IllegalArgumentException("A ward with this code already exists.");
        }

        Ward ward = new Ward();
        ward.setCode(request.getCode());
        ward.setName(request.getName());
        ward.setWardType(request.getWardType());
        ward.setStatus(request.getStatus());
        ward.setDescription(request.getDescription());

        // Audit fields population
        ward.setCreatedBy(actorId);
        ward.setUpdatedBy(actorId);

        Ward saved = wardRepository.save(ward);

        log.info(
                "Created ward '{}' with ID '{}' by actor '{}' (corrId '{}')",
                saved.getName(), saved.getId(), actorId, corrId
        );

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<WardResponseDto> findAll() {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);

        List<WardResponseDto> wards = wardRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        log.info("Retrieved '{}' wards (corrId '{}')", wards.size(), corrId);
        return wards;
    }

    @Transactional(readOnly = true)
    public WardResponseDto findById(UUID id) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);

        Ward ward = getWardEntity(id);
        log.info("Retrieved ward '{}' with ID '{}' (corrId '{}')", ward.getName(), ward.getId(), corrId);
        return mapToDto(ward);
    }

    public WardResponseDto update(UUID id, WardUpdateDto request, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);

        Ward ward = getWardEntity(id);

        // Only validate and update code if it is provided and different from the current one
        if (request.getCode() != null && !request.getCode().isBlank()) {
            if (!ward.getCode().equalsIgnoreCase(request.getCode())) {
                if (wardRepository.existsByCodeIgnoreCaseAndIdNot(request.getCode(), id)) {
                    throw new IllegalArgumentException("Another ward already uses this code.");
                }
            }
            ward.setCode(request.getCode());
        }

        // Safely update remaining fields only if they are not null
        if (request.getName() != null) {
            ward.setName(request.getName());
        }
        if (request.getWardType() != null) {
            ward.setWardType(request.getWardType());
        }
        if (request.getStatus() != null) {
            ward.setStatus(request.getStatus());
        }
        if (request.getDescription() != null) {
            ward.setDescription(request.getDescription());
        }

        // Audit field update
        ward.setUpdatedBy(actorId);

        Ward saved = wardRepository.save(ward);

        log.info(
                "Updated ward '{}' with ID '{}' by actor '{}' (corrId '{}')",
                saved.getName(), saved.getId(), actorId, corrId
        );

        return mapToDto(saved);
    }

    public void delete(UUID id, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);

        Ward ward = getWardEntity(id);

        if (roomRepository.existsByWard_Id(id)) {
            throw new IllegalStateException("Cannot delete a ward that contains rooms.");
        }

        if (encounterLocationRepository.existsByWardId(id)) {
            throw new IllegalStateException("Cannot delete a ward referenced by encounter locations.");
        }

        String wardName = ward.getName();
        wardRepository.delete(ward);

        log.info("Deleted ward '{}' with ID '{}' by actor '{}' (corrId '{}')", wardName, id, actorId, corrId);
    }

    private Ward getWardEntity(UUID id) {
        return wardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ward not found: " + id));
    }

    private WardResponseDto mapToDto(Ward ward) {
        return WardResponseDto.builder()
                .id(ward.getId())
                .code(ward.getCode())
                .name(ward.getName())
                .wardType(ward.getWardType())
                .status(ward.getStatus())
                .description(ward.getDescription())
                .build();
    }
}