package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.BillingStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class BillingResponseDto {
    private UUID id;
    private String billingNumber;
    private UUID patientId;
    private BillingStatus status;
    private String currency;
    private BigDecimal totalAmount;
}