package com.hospital.hpmadmin.dto;

import com.hospital.hpmadmin.model.BillingChargeType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class BillingItemResponseDto {
    private UUID id;
    private UUID billingId;
    private UUID encounterId;
    private UUID procedureId;
    private BillingChargeType chargeType;
    private String description;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}