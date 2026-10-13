package com.hospital.hpmadmin.repository;

import com.hospital.hpmadmin.entity.User;
import com.hospital.hpmadmin.model.UserRole;
import com.hospital.hpmadmin.model.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // Validation checks during registration
    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    // Filtering users by status or role with pagination support
    Page<User> findByUserStatus(UserStatus userStatus, Pageable pageable);

    Page<User> findByRole(UserRole role, Pageable pageable);

    Optional<User> findByEmail(String email);
}