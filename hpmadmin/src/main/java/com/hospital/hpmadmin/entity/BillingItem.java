package com.hospital.hpmadmin.entity;

import com.hospital.hpmadmin.model.Auditable;
import com.hospital.hpmadmin.model.BillingChargeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "billing_items")
@Getter
@Setter
public class BillingItem extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "billing_id", nullable = false)
    private Billing billing;

    @Column(name = "encounter_id")
    private UUID encounterId;

    @Column(name = "procedure_id")
    private UUID procedureId;

    @Enumerated(EnumType.STRING)
    @Column(name = "charge_type", nullable = false, length = 30)
    private BillingChargeType chargeType; // ENCOUNTER, PROCEDURE, etc.

    @Column(name = "description", nullable = false, length = 200)
    private String description;

    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false, precision = 19, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "line_total", nullable = false, precision = 19, scale = 2)
    private BigDecimal lineTotal;
}