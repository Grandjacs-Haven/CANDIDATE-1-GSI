package com.hospital.hpmadmin.repository;

import com.hospital.hpmadmin.entity.BillingItem;
import com.hospital.hpmadmin.model.BillingChargeType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BillingItemRepository
        extends JpaRepository<BillingItem, UUID> {

    List<BillingItem> findByBilling_IdOrderByIdAsc(UUID billingId);

    List<BillingItem> findByEncounterId(UUID encounterId);

    Optional<BillingItem> findByProcedureId(UUID procedureId);

    boolean existsByEncounterIdAndChargeType(
            UUID encounterId,
            BillingChargeType chargeType
    );

    boolean existsByProcedureId(UUID procedureId);
}