package com.hospital.hpmadmin.repository;

import com.hospital.hpmadmin.entity.Billing;
import com.hospital.hpmadmin.model.BillingStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BillingRepository extends JpaRepository<Billing, UUID> {

    List<Billing> findByPatientIdOrderByIdDesc(UUID patientId);

    Optional<Billing> findFirstByPatientIdAndStatusOrderByIdAsc(
            UUID patientId,
            BillingStatus status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT b FROM Billing b
        WHERE b.id = :billingId
        """)
    Optional<Billing> findByIdForUpdate(
            @Param("billingId") UUID billingId
    );
}