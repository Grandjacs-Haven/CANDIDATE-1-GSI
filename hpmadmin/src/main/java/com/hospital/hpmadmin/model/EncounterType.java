package com.hospital.hpmadmin.model;

import java.math.BigDecimal;

public enum EncounterType {

    CONSULTATION("30000.00"),
    FOLLOW_UP("15000.00"),
    TRIAGE("10000.00"),
    SURGICAL("50000.00"),
    PREVENTIVE("20000.00"),
    DIAGNOSTIC("25000.00"),
    THERAPEUTIC("30000.00"),
    OTHER("20000.00");

    private final BigDecimal price;

    EncounterType(String price) {
        this.price = new BigDecimal(price);
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getCurrency() {
        return "UGX";
    }
}