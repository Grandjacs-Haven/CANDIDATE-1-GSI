package com.hospital.hpmadmin.repository;

import com.hospital.hpmadmin.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AddressRepository
        extends JpaRepository<Address, UUID> {
}