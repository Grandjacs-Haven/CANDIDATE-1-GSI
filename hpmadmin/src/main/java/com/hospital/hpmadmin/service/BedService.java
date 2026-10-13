package com.hospital.hpmadmin.service;

import com.hospital.hpmadmin.dto.BedResponseDto;
import com.hospital.hpmadmin.dto.BedUpdateDto;
import com.hospital.hpmadmin.dto.RoomResponseDto;
import com.hospital.hpmadmin.entity.Bed;
import com.hospital.hpmadmin.entity.Room;
import com.hospital.hpmadmin.repository.BedRepository;
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
public class BedService {

    private final BedRepository bedRepository;
    private final RoomService roomService; // Reusing RoomService instead of RoomRepository directly!

    public BedResponseDto mapToResponse(Bed bed) {
        return BedResponseDto.builder()
                .id(bed.getId())
                .roomId(bed.getRoom() != null ? bed.getRoom().getId() : null)
                .roomName(bed.getRoom() != null ? bed.getRoom().getRoomNumber() : null)
                .bedNumber(bed.getBedNumber())
                .operationalStatus(bed.getBedStatus())
                .description(bed.getDescription())
                .build();
    }

    public BedResponseDto create(UUID roomId, Bed request, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Creating bed for room '{}' by actor '{}' (corrId '{}')", roomId, actorId, corrId);

        // Reusing RoomService's validation lookup
        Room room = roomService.findRoom(roomId);
        validateBedNumber(roomId, request.getBedNumber(), null);

        request.setId(null);
        request.setRoom(room);

        // Populate audit tracking fields for creation
        request.setCreatedBy(actorId);
        request.setUpdatedBy(actorId);

        Bed savedBed = bedRepository.save(request);
        log.info("Successfully created bed '{}' in room '{}' by actor '{}' (corrId '{}')", savedBed.getId(), roomId, actorId, corrId);

        return mapToResponse(savedBed);
    }

    @Transactional(readOnly = true)
    public List<BedResponseDto> findAll() {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Fetching all hospital beds (corrId '{}')", corrId);

        return bedRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BedResponseDto> findByRoom(UUID roomId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Fetching beds for room '{}' (corrId '{}')", roomId, corrId);

        // Ensures room exists first
        roomService.findRoom(roomId);
        return bedRepository.findByRoom_IdOrderByBedNumberAsc(roomId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BedResponseDto findById(UUID id) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Fetching bed by id: '{}' (corrId '{}')", id, corrId);

        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bed not found: " + id));

        return mapToResponse(bed);
    }

    @Transactional
    public BedResponseDto update(UUID id, UUID roomId, BedUpdateDto request, UUID actorId) {
        // 1. Fetch existing bed
        Bed existingBed = bedRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Bed not found with id: " + id));

        // 2. Fetch and assign new Room if room changed
        Room room = roomService.findByIdInternal(roomId);

        existingBed.setRoom(room);

        // 3. Conditionally update fields to protect against null overwrites
        if (request.getBedNumber() != null) {
            existingBed.setBedNumber(request.getBedNumber());
        }
        if (request.getBedStatus() != null) {
            existingBed.setBedStatus(request.getBedStatus());
        }
        existingBed.setDescription(request.getDescription());

        // 4. Audit trail and save
        existingBed.setUpdatedBy(actorId);
        Bed savedBed = bedRepository.save(existingBed);

        return mapToResponse(savedBed);
    }

    public void delete(UUID id, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Deleting bed '{}' by actor '{}' (corrId '{}')", id, actorId, corrId);

        Bed bed = bedRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Bed not found: " + id));

        bedRepository.delete(bed);
        log.info("Successfully deleted bed '{}' by actor '{}' (corrId '{}')", id, actorId, corrId);
    }

    private void validateBedNumber(UUID roomId, String bedNumber, UUID excludedBedId) {
        boolean exists = excludedBedId == null
                ? bedRepository.existsByRoom_IdAndBedNumberIgnoreCase(roomId, bedNumber)
                : bedRepository.existsByRoom_IdAndBedNumberIgnoreCaseAndIdNot(roomId, bedNumber, excludedBedId);

        if (exists) {
            String corrId = MDC.get(AppConstants.CORRELATION_ID);
            log.warn("Bed validation failed: Bed number '{}' already exists in room '{}' (corrId '{}')", bedNumber, roomId, corrId);
            throw new IllegalArgumentException("This bed number already exists in the selected room.");
        }
    }
}