package com.hospital.hpmadmin.repository;

import com.hospital.hpmadmin.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;


public interface RoomRepository extends JpaRepository<Room, UUID> {

    List<Room> findByWard_IdOrderByRoomNumberAsc(UUID wardId);

    boolean existsByWard_Id(UUID wardId);

    boolean existsByWard_IdAndRoomNumberIgnoreCase(
            UUID wardId, String roomNumber);

    boolean existsByWard_IdAndRoomNumberIgnoreCaseAndIdNot(
            UUID wardId, String roomNumber, UUID id);
}