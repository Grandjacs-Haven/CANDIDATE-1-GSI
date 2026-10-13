package com.hospital.hpmadmin.controller;

import com.hospital.hpmadmin.dto.BillingItemResponseDto;
import com.hospital.hpmadmin.dto.BillingResponseDto;
import com.hospital.hpmadmin.service.BillingService;
import com.hospital.hpmadmin.util.AppConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/billings")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/encounters/{encounterId}/charge")
    @ResponseStatus(HttpStatus.CREATED)
    public BillingResponseDto addEncounterCharge(
            @PathVariable UUID encounterId,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return billingService.addCompletedEncounterCharge(encounterId, actorId);
    }

    @PostMapping("/procedures/{procedureId}/charge")
    @ResponseStatus(HttpStatus.CREATED)
    public BillingResponseDto addProcedureCharge(
            @PathVariable UUID procedureId,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return billingService.addCompletedProcedureCharge(procedureId, actorId);
    }

    @PutMapping("/{billingId}/issue")
    public BillingResponseDto issueBill(
            @PathVariable UUID billingId,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return billingService.issueBill(billingId, actorId);
    }

    @PutMapping("/{billingId}/pay")
    public BillingResponseDto markAsPaid(
            @PathVariable UUID billingId,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return billingService.markAsPaid(billingId, actorId);
    }

    @GetMapping("/patients/{patientId}")
    public List<BillingResponseDto> getBillsByPatient(@PathVariable UUID patientId) {
        return billingService.findBillsByPatientId(patientId);
    }

    @GetMapping("/encounters/{encounterId}")
    public BillingResponseDto getBillByEncounter(@PathVariable UUID encounterId) {
        return billingService.findBillByEncounterId(encounterId);
    }

    @GetMapping("/{billingId}/items")
    public List<BillingItemResponseDto> getItemsByBill(@PathVariable UUID billingId) {
        return billingService.findItemsByBillId(billingId);
    }
}