package com.hospital.hpmadmin.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class ContactPoint {

    @Enumerated(EnumType.STRING)
    @Column(name = "medium")
    private ContactMedium medium;

    @Column(name = "contact_value")
    private String value;

    @Enumerated(EnumType.STRING)
    @Column(name = "contact_use")
    private ContactUse use;

    @Column(name = "is_primary")
    private boolean primary;

    @Column(name = "is_verified")
    private boolean verified;
}