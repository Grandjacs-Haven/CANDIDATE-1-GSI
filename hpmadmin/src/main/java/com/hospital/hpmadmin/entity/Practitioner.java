package com.hospital.hpmadmin.entity;

import com.hospital.hpmadmin.entity.Address;
import com.hospital.hpmadmin.entity.Contact;
import com.hospital.hpmadmin.model.Auditable;
import com.hospital.hpmadmin.model.PractitionerType;

import com.hospital.hpmadmin.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "practitioners",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_practitioner_number",
                        columnNames = "practitioner_number"
                )
        }
)
@Getter
@Setter
public class Practitioner extends Auditable {

    @Id
    private UUID id;

    // Existing identity and account information
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // Professional identification
    @Column(
            name = "practitioner_number",
            nullable = false,
            length = 50
    )
    private String practitionerNumber;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "practitioner_type",
            nullable = true,
            length = 40
    )
    private PractitionerType practitionerType;

    @Column(name = "professional_title", length = 100)
    private String professionalTitle;

    @Column(name = "license_number", length = 100)
    private String licenseNumber;

    @Column(name = "registration_body", length = 150)
    private String registrationBody;

    @Column(name = "qualification", length = 255)
    private String qualification;

    @Column(name = "specialty", length = 150)
    private String specialty;

    @Column(nullable = false)
    private boolean active = true;

    // Professional's addresses
    @OneToMany(
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JoinColumn(name = "practitioner_id")
    private List<Address> addresses = new ArrayList<>();

    // Relatives and emergency contacts
    @OneToMany(
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JoinColumn(name = "practitioner_id")
    private List<Contact> relatedContacts = new ArrayList<>();
}