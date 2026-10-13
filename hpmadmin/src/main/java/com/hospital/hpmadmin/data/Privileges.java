package com.hospital.hpmadmin.data;

import java.util.Map;

public final class Privileges {

    private Privileges() {}

    public static final Map<String, String> PRIVILEGES = Map.ofEntries(

            // --- User Management ---
            Map.entry("CREATE_USER", "cuser"),
            Map.entry("READ_USER", "ruser"),
            Map.entry("UPDATE_USER", "uuser"),
            Map.entry("DELETE_USER", "duser"),

            // --- User Privileges Management ---
            Map.entry("READ_PRIVILEGE", "rpriv"),
            Map.entry("CREATE_PRIVILEGE", "cpriv"),
            Map.entry("DELETE_PRIVILEGE", "dpriv"),

            // --- Patient Management ---
            Map.entry("CREATE_PATIENT", "cpat"),
            Map.entry("READ_PATIENT", "rpat"),
            Map.entry("UPDATE_PATIENT", "upat"),
            Map.entry("DELETE_PATIENT", "dpat"),

            // --- Practitioner Management ---
            Map.entry("CREATE_PRACTITIONER", "cpract"),
            Map.entry("READ_PRACTITIONER", "rpract"),
            Map.entry("UPDATE_PRACTITIONER", "upract"),
            Map.entry("DELETE_PRACTITIONER", "dpract"),

            // --- Encounter Management ---
            Map.entry("CREATE_ENCOUNTER", "cenc"),
            Map.entry("READ_ENCOUNTER", "renc"),
            Map.entry("UPDATE_ENCOUNTER", "uenc"),
            Map.entry("DELETE_ENCOUNTER", "denc"),

            // --- Encounter Locations / History ---
            Map.entry("CREATE_ENCOUNTER_LOCATION", "celoc"),
            Map.entry("READ_ENCOUNTER_LOCATION", "reloc"),
            Map.entry("UPDATE_ENCOUNTER_LOCATION", "ueloc"),
            Map.entry("DELETE_ENCOUNTER_LOCATION", "deloc"),

            // --- Clinical Notes ---
            Map.entry("CREATE_CLINICAL_NOTE", "cnote"),
            Map.entry("READ_CLINICAL_NOTE", "rnote"),
            Map.entry("UPDATE_CLINICAL_NOTE", "unote"),
            Map.entry("DELETE_CLINICAL_NOTE", "dnote"),

            // --- Contacts Management ---
            Map.entry("CREATE_CONTACT", "ccont"),
            Map.entry("READ_CONTACT", "rcont"),
            Map.entry("UPDATE_CONTACT", "ucont"),
            Map.entry("DELETE_CONTACT", "dcont"),

            // --- Observations & Vitals ---
            Map.entry("CREATE_OBSERVATION", "cobs"),
            Map.entry("READ_OBSERVATION", "robs"),
            Map.entry("UPDATE_OBSERVATION", "uobs"),
            Map.entry("DELETE_OBSERVATION", "dobs"),

            // --- Procedures ---
            Map.entry("CREATE_PROCEDURE", "cproc"),
            Map.entry("READ_PROCEDURE", "rproc"),
            Map.entry("UPDATE_PROCEDURE", "uproc"),
            Map.entry("DELETE_PROCEDURE", "dproc"),

            // --- Procedure Performers ---
            Map.entry("CREATE_PROCEDURE_PERFORMER", "cperf"),
            Map.entry("READ_PROCEDURE_PERFORMER", "rperf"),
            Map.entry("UPDATE_PROCEDURE_PERFORMER", "uperf"),
            Map.entry("DELETE_PROCEDURE_PERFORMER", "dperf"),

            // --- Appointments ---
            Map.entry("CREATE_APPOINTMENT", "cappt"),
            Map.entry("READ_APPOINTMENT", "rapp"),
            Map.entry("UPDATE_APPOINTMENT", "uappt"),
            Map.entry("DELETE_APPOINTMENT", "dappt"),

            // --- Wards & Rooms ---
            Map.entry("CREATE_WARD", "cward"),
            Map.entry("READ_WARD", "rward"),
            Map.entry("UPDATE_WARD", "uward"),
            Map.entry("DELETE_WARD", "dward"),
            Map.entry("CREATE_ROOM", "croom"),
            Map.entry("READ_ROOM", "rroom"),
            Map.entry("UPDATE_ROOM", "uroom"),
            Map.entry("DELETE_ROOM", "droom"),

            // --- Addresses ---
            Map.entry("CREATE_ADDRESS", "cadd"),
            Map.entry("READ_ADDRESS", "radd"),
            Map.entry("UPDATE_ADDRESS", "uadd"),
            Map.entry("DELETE_ADDRESS", "dadd"),

            // --- Organisation Management ---
            Map.entry("CREATE_ORGANISATION", "corg"),
            Map.entry("READ_ORGANISATION", "rorg"),
            Map.entry("UPDATE_ORGANISATION", "uorg"),

            // --- Billing ---
            Map.entry("CREATE_BILLING", "cbill"),
            Map.entry("READ_BILLING", "rbill"),
            Map.entry("UPDATE_BILLING", "ubill"),
            Map.entry("APPROVE_BILLING", "abill"),

// --- System Administration & Audit ---
            Map.entry("ADMIN", "admin"), // <-- Master admin privilege mapped to the "admin" scope
            Map.entry("READ_AUDIT_LOGS", "raudit"),
            Map.entry("UPDATE_SECURITY_CONFIG", "uconfig"),

            // --- Bed Management ---
            Map.entry("CREATE_BED", "cbed"),
            Map.entry("READ_BED", "rbed"),
            Map.entry("UPDATE_BED", "ubed"),
            Map.entry("DELETE_BED", "dbed")


    );
}