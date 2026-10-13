package com.hospital.hpmadmin.entity;

import com.hospital.hpmadmin.entity.Address;
import com.hospital.hpmadmin.entity.Contact;
import com.hospital.hpmadmin.model.Auditable;
import com.hospital.hpmadmin.model.Gender;
import com.hospital.hpmadmin.model.MaritalStatus;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(
        name = "patients"
)
public class Patient extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "patient_number", nullable = false)
    private String patientNumber;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "middle_name")
    private String middleName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "life_status", nullable = false)
    private boolean isAlive;

    @Enumerated(EnumType.STRING)
    @Column(name = "marital_status")
    private MaritalStatus maritalStatus;

    @Column(name = "multiple_birth")
    private Boolean multipleBirth;

    @Column(name = "multiple_birth_order")
    private Integer multipleBirthOrder;


    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "patient_id")
    private List<Address> addresses = new ArrayList<>();

    @OneToMany(
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JoinColumn(name = "patient_id")
    private List<Contact> patientContact = new ArrayList<>();

    @OneToMany(
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JoinColumn(name = "next_of_kin_patient_id")
    private List<Contact> nextOfKinContact = new ArrayList<>();
}