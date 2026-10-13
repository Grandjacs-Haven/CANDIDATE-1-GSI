package com.hospital.hpmadmin.model;

import java.math.BigDecimal;

public enum ProcedureType {

    // Emergency & bedside procedures
    WOUND_SUTURING(
            "Wound Suturing & Repair", "50000.00"),
    WOUND_DEBRIDEMENT(
            "Wound Debridement", "60000.00"),
    ENDOTRACHEAL_INTUBATION(
            "Endotracheal Intubation", "100000.00"),
    CHEST_TUBE_INSERTION(
            "Chest Tube Insertion (Thoracostomy)", "150000.00"),
    CENTRAL_VENOUS_CATHETER(
            "Central Venous Catheter Insertion", "120000.00"),
    LUMBAR_PUNCTURE(
            "Lumbar Puncture (Spinal Tap)", "60000.00"),
    CARDIOCENTESIS(
            "Pericardiocentesis", "200000.00"),
    EMERGENCY_TRACHEOSTOMY(
            "Emergency Tracheostomy", "250000.00"),
    CARDIOVERSION(
            "Electrical Cardioversion", "150000.00"),
    JOINT_ASPIRATION(
            "Joint Aspiration (Arthrocentesis)", "70000.00"),

    // General surgery
    APPENDSECTOMY(
            "Appendectomy", "500000.00"),
    CHOLECYSTECTOMY(
            "Gallbladder Removal (Cholecystectomy)", "800000.00"),
    HERNIA_REPAIR(
            "Hernia Repair (Inguinal/Umbilical)", "400000.00"),
    EXPLORATORY_LAPAROTOMY(
            "Exploratory Laparotomy", "800000.00"),
    BOWEL_RESECTION(
            "Bowel Resection", "1200000.00"),
    MASTECTOMY(
            "Mastectomy", "900000.00"),
    THYROIDECTOMY(
            "Thyroidectomy", "900000.00"),

    // Obstetrics & gynecology
    CESAREAN_SECTION(
            "Cesarean Section (C-Section)", "600000.00"),
    DILATION_AND_CURETTAGE(
            "Dilation and Curettage (D&C)", "200000.00"),
    TUBAL_LIGATION(
            "Tubal Ligation", "300000.00"),

    // Orthopedics & trauma
    CLOSED_REDUCTION(
            "Closed Fracture Reduction & Casting", "150000.00"),
    OPEN_REDUCTION_INTERNAL_FIXATION(
            "Open Reduction Internal Fixation (ORIF)", "800000.00"),
    FASCIOTOMY(
            "Fasciotomy", "350000.00");

    private final String displayName;
    private final BigDecimal price;

    ProcedureType(String displayName, String price) {
        this.displayName = displayName;
        this.price = new BigDecimal(price);
    }

    public String getDisplayName() {
        return displayName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public String getCurrency() {
        return "UGX";
    }
}