package com.hospital.hpmadmin.model;

public enum ObservationType {

    // --- Vital Signs ---
    HEART_RATE("Heart Rate", "bpm"),
    PULSE_RATE("Pulse Rate", "bpm"),
    SYSTOLIC_BP("Systolic Blood Pressure", "mmHg"),
    DIASTOLIC_BP("Diastolic Blood Pressure", "mmHg"),
    MEAN_ARTERIAL_PRESSURE("Mean Arterial Pressure", "mmHg"),
    BODY_TEMPERATURE("Body Temperature", "°C"),
    RESPIRATORY_RATE("Respiratory Rate", "breaths/min"),
    OXYGEN_SATURATION("Oxygen Saturation", "%"),
    PAIN_SCORE("Pain Score", "scale 0-10"),

    // --- Anthropometric & Physical Measurements ---
    BODY_WEIGHT("Body Weight", "kg"),
    BODY_HEIGHT("Body Height", "cm"),
    BODY_MASS_INDEX("Body Mass Index (BMI)", "kg/m2"),
    HEAD_CIRCUMFERENCE("Head Circumference", "cm"),
    WAIST_CIRCUMFERENCE("Waist Circumference", "cm"),

    // --- Blood Glucose & Metabolism ---
    BLOOD_GLUCOSE_FASTING("Fasting Blood Glucose", "mg/dL"),
    BLOOD_GLUCOSE_RANDOM("Random Blood Glucose", "mg/dL"),
    HBA1C("Glycated Hemoglobin (HbA1c)", "%"),

    // --- Hematology (Blood Counts) ---
    HEMOGLOBIN("Hemoglobin", "g/dL"),
    HEMATOCRIT("Hematocrit", "%"),
    WHITE_BLOOD_CELL_COUNT("White Blood Cell Count", "10*3/uL"),
    RED_BLOOD_CELL_COUNT("Red Blood Cell Count", "10*6/uL"),
    PLATELET_COUNT("Platelet Count", "10*3/uL"),

    // --- Renal & Electrolytes ---
    SERUM_CREATININE("Serum Creatinine", "mg/dL"),
    BLOOD_UREA_NITROGEN("Blood Urea Nitrogen (BUN)", "mg/dL"),
    SODIUM("Serum Sodium", "mmol/L"),
    POTASSIUM("Serum Potassium", "mmol/L"),
    CHLORIDE("Serum Chloride", "mmol/L"),
    BICARBONATE("Serum Bicarbonate", "mmol/L"),

    // --- Liver Function ---
    ALT("Alanine Aminotransferase (ALT)", "U/L"),
    AST("Aspartate Aminotransferase (AST)", "U/L"),
    TOTAL_BILIRUBIN("Total Bilirubin", "mg/dL"),
    ALBUMIN("Serum Albumin", "g/dL"),

    // --- Clinical Scoring & Output ---
    GLASGOW_COMA_SCALE("Glasgow Coma Scale (GCS)", "score"),
    URINE_OUTPUT("Urine Output", "mL"),
    AVPU_SCORE("AVPU Scale", "score");

    private final String displayName;
    private final String defaultUnit;

    ObservationType(String displayName, String defaultUnit) {
        this.displayName = displayName;
        this.defaultUnit = defaultUnit;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDefaultUnit() {
        return defaultUnit;
    }
}