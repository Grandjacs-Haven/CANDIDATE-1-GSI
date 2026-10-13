package com.hospital.hpmadmin.entity;

import com.hospital.hpmadmin.entity.BillingItem;
import com.hospital.hpmadmin.model.Auditable;
import com.hospital.hpmadmin.model.BillingStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "billings")
@Getter
@Setter
public class Billing extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "billing_number", nullable = false, unique = true)
    private String billingNumber;

    // Groups charges belonging to the same patient.
    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BillingStatus status = BillingStatus.DRAFT;

    @Column(nullable = false, length = 3)
    private String currency = "UGX";

    @Column(name = "total_amount", nullable = false,
            precision = 19, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @OneToMany(mappedBy = "billing",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<BillingItem> items = new ArrayList<>();
}
