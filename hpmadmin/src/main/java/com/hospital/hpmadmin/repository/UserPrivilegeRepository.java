package com.hospital.hpmadmin.repository;

import com.hospital.hpmadmin.entity.UserPrivilege;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserPrivilegeRepository
        extends JpaRepository<UserPrivilege, UUID> {

    List<UserPrivilege> findByUserId(UUID userId);

    Optional<UserPrivilege> findByUserIdAndPrivilegeName(
            UUID userId,
            String privilegeName
    );

    boolean existsByUserIdAndPrivilegeName(
            UUID userId,
            String privilegeName
    );

    void deleteByUserIdAndPrivilegeName(
            UUID userId,
            String privilegeName
    );

    void deleteByUserId(UUID userId);
}