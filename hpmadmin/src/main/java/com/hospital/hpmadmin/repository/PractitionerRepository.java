package com.hospital.hpmadmin.repository;

import com.hospital.hpmadmin.entity.Practitioner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PractitionerRepository extends JpaRepository<Practitioner , UUID> {
}
