package com.hospital.hpmadmin.service;

import com.hospital.hpmadmin.dto.RoomResponseDto;
import com.hospital.hpmadmin.dto.RoomUpdateDto;
import com.hospital.hpmadmin.entity.Room;
import com.hospital.hpmadmin.entity.Ward;
import com.hospital.hpmadmin.repository.BedRepository;
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
public class RoomService {

    private final RoomRepository roomRepository;
    private final WardRepository wardRepository;
    private final BedRepository bedRepository;

    // Helper method to convert Entity -> DTO (DRY Principle)
    public RoomResponseDto mapToResponse(Room room) {
        return RoomResponseDto.builder()
                .id(room.getId())
                .wardId(room.getWard() != null ? room.getWard().getId() : null)
                .wardName(room.getWard() != null ? room.getWard().getName() : null)
                .roomNumber(room.getRoomNumber())
                .roomType(room.getRoomType())
                .capacity(room.getCapacity())
                .status(room.getStatus())
                .description(room.getDescription())
                .build();
    }

    public RoomResponseDto create(UUID wardId, Room request, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Creating room for ward '{}' by actor '{}' (corrId '{}')", wardId, actorId, corrId);

        Ward ward = findWard(wardId);

        validateRoomNumber(wardId, request.getRoomNumber(), null);
        validateCapacity(request.getCapacity());

        request.setId(null);
        request.setWard(ward);

        // Populate audit tracking fields for creation
        request.setCreatedBy(actorId);
        request.setUpdatedBy(actorId);

        Room savedRoom = roomRepository.save(request);
        log.info("Successfully created room '{}' in ward '{}' by actor '{}' (corrId '{}')", savedRoom.getId(), wardId, actorId, corrId);

        return mapToResponse(savedRoom);
    }

    @Transactional(readOnly = true)
    public List<RoomResponseDto> findAll() {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Fetching all hospital rooms (corrId '{}')", corrId);

        return roomRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RoomResponseDto> findByWard(UUID wardId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Fetching rooms for ward '{}' (corrId '{}')", wardId, corrId);

        findWard(wardId);
        return roomRepository.findByWard_IdOrderByRoomNumberAsc(wardId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoomResponseDto findById(UUID id) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Fetching room by id: '{}' (corrId '{}')", id, corrId);

        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + id));

        return mapToResponse(room);
    }

    @Transactional(readOnly = true)
    public Room findByIdInternal(UUID id) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Fetching room by id: '{}' (corrId '{}')", id, corrId);

        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + id));

        return room;
    }

    @Transactional
    public RoomResponseDto update(UUID id, UUID wardId, RoomUpdateDto request, UUID actorId) {
        Room existingRoom = roomRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Room not found with id: " + id));

        // 2. Fetch and assign the new Ward if wardId changed
        Ward ward = wardRepository.findById(wardId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Ward not found with id: " + wardId));
        existingRoom.setWard(ward);

        // 3. Conditionally update fields only if provided in the DTO
        if (request.getRoomNumber() != null) {
            existingRoom.setRoomNumber(request.getRoomNumber());
        }
        if (request.getRoomType() != null) {
            existingRoom.setRoomType(request.getRoomType());
        }
        if (request.getCapacity() != null) {
            existingRoom.setCapacity(request.getCapacity());
        }
        if (request.getStatus() != null) {
            existingRoom.setStatus(request.getStatus());
        }

        // Description can be explicitly cleared or updated
        existingRoom.setDescription(request.getDescription());

        // 4. Update audit fields and save
        existingRoom.setUpdatedBy(actorId);
        Room savedRoom = roomRepository.save(existingRoom);

        return mapToResponse(savedRoom);
    }

    public void delete(UUID id, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Deleting room '{}' by actor '{}' (corrId '{}')", id, actorId, corrId);

        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + id));

        if (bedRepository.existsByRoom_Id(id)) {
            log.warn("Room deletion failed: Room '{}' still contains active beds by actor '{}' (corrId '{}')", id, actorId, corrId);
            throw new IllegalStateException("Cannot delete a room that contains beds.");
        }

        roomRepository.delete(room);
        log.info("Successfully deleted room '{}' by actor '{}' (corrId '{}')", id, actorId, corrId);
    }

    // Make this public so BedService (and other services) can reuse it
    public Room findRoom(UUID roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Room not found: " + roomId));
    }

    private Ward findWard(UUID wardId) {
        return wardRepository.findById(wardId)
                .orElseThrow(() -> new EntityNotFoundException("Ward not found: " + wardId));
    }

    private void validateRoomNumber(UUID wardId, String roomNumber, UUID excludedRoomId) {
        boolean exists = excludedRoomId == null
                ? roomRepository.existsByWard_IdAndRoomNumberIgnoreCase(wardId, roomNumber)
                : roomRepository.existsByWard_IdAndRoomNumberIgnoreCaseAndIdNot(wardId, roomNumber, excludedRoomId);

        if (exists) {
            String corrId = MDC.get(AppConstants.CORRELATION_ID);
            log.warn("Room validation failed: Room number '{}' already exists in ward '{}' (corrId '{}')", roomNumber, wardId, corrId);
            throw new IllegalArgumentException("This room number already exists in the selected ward.");
        }
    }

    private void validateCapacity(Integer capacity) {
        if (capacity == null || capacity < 1) {
            throw new IllegalArgumentException("Room capacity must be at least 1.");
        }
    }
}