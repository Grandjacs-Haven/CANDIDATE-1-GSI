package com.hospital.hpmadmin.service;

import com.hospital.hpmadmin.dto.BillingItemResponseDto;
import com.hospital.hpmadmin.dto.BillingResponseDto;
import com.hospital.hpmadmin.entity.Appointment;
import com.hospital.hpmadmin.entity.Billing;
import com.hospital.hpmadmin.entity.BillingItem;
import com.hospital.hpmadmin.entity.Encounter;

import com.hospital.hpmadmin.entity.Procedure;
import com.hospital.hpmadmin.model.BillingChargeType;
import com.hospital.hpmadmin.model.BillingStatus;
import com.hospital.hpmadmin.model.EncounterStatus;
import com.hospital.hpmadmin.model.ProcedureStatus;
import com.hospital.hpmadmin.repository.AppointmentRepository;
import com.hospital.hpmadmin.repository.BillingItemRepository;
import com.hospital.hpmadmin.repository.BillingRepository;
import com.hospital.hpmadmin.repository.EncounterRepository;
import com.hospital.hpmadmin.repository.ProcedureRepository;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BillingService {

    private final BillingRepository billingRepository;
    private final BillingItemRepository billingItemRepository;
    private final EncounterRepository encounterRepository;
    private final
    ProcedureRepository procedureRepository;
    private final AppointmentRepository appointmentRepository;

    public BillingResponseDto mapToResponse(Billing billing) {
        return BillingResponseDto.builder()
                .id(billing.getId())
                .billingNumber(billing.getBillingNumber())
                .patientId(billing.getPatientId())
                .status(billing.getStatus())
                .currency(billing.getCurrency())
                .totalAmount(billing.getTotalAmount())
                .build();
    }

    public BillingItemResponseDto mapItemToResponse(BillingItem item) {
        return BillingItemResponseDto.builder()
                .id(item.getId())
                .billingId(item.getBilling() != null ? item.getBilling().getId() : null)
                .encounterId(item.getEncounterId())
                .procedureId(item.getProcedureId())
                .chargeType(item.getChargeType())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(item.getLineTotal())
                .build();
    }

    @Transactional
    public BillingResponseDto addCompletedEncounterCharge(
            UUID encounterId,
            UUID actorId
    ) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);

        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Encounter not found: " + encounterId));

        if (encounter.getStatus() != EncounterStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Only completed encounters can be billed.");
        }

        if (encounter.getEncounterType() == null) {
            throw new IllegalStateException(
                    "Encounter type is required for billing.");
        }

        // Idempotency: don't add the encounter charge twice.
        if (billingItemRepository.existsByEncounterIdAndChargeType(
                encounterId, BillingChargeType.ENCOUNTER)) {
            Billing existingBilling = billingItemRepository.findByEncounterId(encounterId)
                    .stream()
                    .filter(item -> item.getChargeType()
                            == BillingChargeType.ENCOUNTER)
                    .map(BillingItem::getBilling)
                    .findFirst()
                    .orElseThrow();
            return mapToResponse(existingBilling);
        }

        UUID patientId = getPatientId(encounter);

        Billing billing = getOrCreateDraftBill(
                patientId,
                encounter.getEncounterType().getCurrency(),
                actorId);

        BigDecimal price = encounter.getEncounterType().getPrice();

        BillingItem item = new BillingItem();
        item.setBilling(billing);
        item.setEncounterId(encounterId);
        item.setProcedureId(null);
        item.setChargeType(BillingChargeType.ENCOUNTER);
        item.setDescription(
                encounter.getEncounterType().name().replace('_', ' '));
        item.setQuantity(1);
        item.setUnitPrice(price);
        item.setLineTotal(price);

        billingItemRepository.save(item);

        recalculateTotal(billing, actorId);

        log.info(
                "Added encounter charge '{}' to bill '{}' for patient '{}' by actor '{}' (corrId '{}')",
                encounterId, billing.getBillingNumber(), patientId,
                actorId, corrId);

        return mapToResponse(billing);
    }

    @Transactional
    public BillingResponseDto addCompletedProcedureCharge(
            UUID procedureId,
            UUID actorId
    ) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);

        Procedure procedure = procedureRepository.findById(procedureId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Procedure not found: " + procedureId));

        if (procedure.getStatus() != ProcedureStatus.COMPLETED) {
            throw new IllegalStateException(
                    "Only completed procedures can be billed.");
        }

        if (procedure.getProcedureType() == null) {
            throw new IllegalStateException(
                    "Procedure type is required for billing.");
        }

        if (billingItemRepository.existsByProcedureId(procedureId)) {
            Billing existingBilling = billingItemRepository.findByProcedureId(procedureId)
                    .orElseThrow()
                    .getBilling();
            return mapToResponse(existingBilling);
        }

        Encounter encounter = procedure.getEncounter();

        if (encounter.getStatus() != EncounterStatus.COMPLETED) {
            throw new IllegalStateException(
                    "The encounter must be completed before billing its procedure.");
        }

        UUID patientId = getPatientId(encounter);

        Billing billing = getOrCreateDraftBill(
                patientId,
                procedure.getProcedureType().getCurrency(),
                actorId);

        BigDecimal price = procedure.getProcedureType().getPrice();

        BillingItem item = new BillingItem();
        item.setBilling(billing);
        item.setEncounterId(encounter.getId());
        item.setProcedureId(procedureId);
        item.setChargeType(BillingChargeType.PROCEDURE);
        item.setDescription(
                procedure.getProcedureType().getDisplayName());
        item.setQuantity(1);
        item.setUnitPrice(price);
        item.setLineTotal(price);

        billingItemRepository.save(item);

        recalculateTotal(billing, actorId);

        log.info(
                "Added procedure charge '{}' to bill '{}' for patient '{}' by actor '{}' (corrId '{}')",
                procedureId, billing.getBillingNumber(), patientId,
                actorId, corrId);

        return mapToResponse(billing);
    }

    @Transactional
    public BillingResponseDto issueBill(
            UUID billingId,
            UUID actorId
    ) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        Billing billing = getBilling(billingId);

        if (billing.getStatus() != BillingStatus.DRAFT) {
            throw new IllegalStateException(
                    "Only a draft bill can be issued.");
        }

        if (billingItemRepository
                .findByBilling_IdOrderByIdAsc(billingId).isEmpty()) {
            throw new IllegalStateException(
                    "Cannot issue an empty bill.");
        }

        recalculateTotal(billing, actorId);
        billing.setStatus(BillingStatus.ISSUED);
        billing.setUpdatedBy(actorId);

        Billing saved = billingRepository.save(billing);

        log.info(
                "Issued bill '{}' for patient '{}' with total '{}' {} by actor '{}' (corrId '{}')",
                saved.getBillingNumber(), saved.getPatientId(),
                saved.getTotalAmount(), saved.getCurrency(),
                actorId, corrId);

        return mapToResponse(saved);
    }

    @Transactional
    public BillingResponseDto markAsPaid(
            UUID billingId,
            UUID actorId
    ) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        Billing billing = getBilling(billingId);

        if (billing.getStatus() != BillingStatus.ISSUED) {
            throw new IllegalStateException(
                    "Only an issued bill can be marked as paid.");
        }

        billing.setStatus(BillingStatus.PAID);
        billing.setUpdatedBy(actorId);

        Billing saved = billingRepository.save(billing);

        log.info(
                "Marked bill '{}' as PAID by actor '{}' (corrId '{}')",
                saved.getBillingNumber(), actorId, corrId);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BillingResponseDto> findBillsByPatientId(UUID patientId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        List<BillingResponseDto> bills =
                billingRepository.findByPatientIdOrderByIdDesc(patientId).stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList());

        log.info(
                "Retrieved '{}' bills for patient '{}' (corrId '{}')",
                bills.size(), patientId, corrId);

        return bills;
    }

    @Transactional(readOnly = true)
    public BillingResponseDto findBillByEncounterId(UUID encounterId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        List<BillingItem> items =
                billingItemRepository.findByEncounterId(encounterId);

        Billing billing = items.stream()
                .filter(item -> item.getChargeType()
                        == BillingChargeType.ENCOUNTER)
                .map(BillingItem::getBilling)
                .findFirst()
                .orElseGet(() -> items.stream()
                        .map(BillingItem::getBilling)
                        .findFirst()
                        .orElseThrow(() -> new EntityNotFoundException(
                                "No bill found for encounter: " + encounterId)));

        log.info(
                "Retrieved bill '{}' for encounter '{}' (corrId '{}')",
                billing.getId(), encounterId, corrId);

        return mapToResponse(billing);
    }

    @Transactional(readOnly = true)
    public List<BillingItemResponseDto> findItemsByBillId(UUID billingId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        getBilling(billingId);

        List<BillingItemResponseDto> items =
                billingItemRepository.findByBilling_IdOrderByIdAsc(billingId).stream()
                        .map(this::mapItemToResponse)
                        .collect(Collectors.toList());

        log.info(
                "Retrieved '{}' items for bill '{}' (corrId '{}')",
                items.size(), billingId, corrId);

        return items;
    }

    private Billing getOrCreateDraftBill(
            UUID patientId,
            String currency,
            UUID actorId
    ) {
        return billingRepository
                .findFirstByPatientIdAndStatusOrderByIdAsc(
                        patientId, BillingStatus.DRAFT)
                .orElseGet(() -> {
                    Billing billing = new Billing();
                    billing.setBillingNumber(generateBillingNumber());
                    billing.setPatientId(patientId);
                    billing.setStatus(BillingStatus.DRAFT);
                    billing.setCurrency(currency);
                    billing.setTotalAmount(BigDecimal.ZERO);
                    billing.setCreatedBy(actorId);
                    billing.setUpdatedBy(actorId);
                    return billingRepository.save(billing);
                });
    }

    private void recalculateTotal(Billing billing, UUID actorId) {
        List<BillingItem> items =
                billingItemRepository.findByBilling_IdOrderByIdAsc(
                        billing.getId());

        BigDecimal total = items.stream()
                .map(BillingItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        billing.setTotalAmount(total);
        billing.setUpdatedBy(actorId);
        billingRepository.save(billing);
    }

    private UUID getPatientId(Encounter encounter) {
        Appointment appointment = appointmentRepository
                .findById(encounter.getAppointmentId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Appointment not found: "
                                + encounter.getAppointmentId()));

        return appointment.getPatientId();
    }

    private Billing getBilling(UUID billingId) {
        return billingRepository.findById(billingId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Bill not found: " + billingId));
    }

    private String generateBillingNumber() {
        return "INV-" + UUID.randomUUID()
                .toString().replace("-", "")
                .substring(0, 12).toUpperCase();
    }
}