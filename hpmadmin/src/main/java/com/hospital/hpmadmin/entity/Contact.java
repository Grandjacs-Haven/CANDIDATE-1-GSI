package com.hospital.hpmadmin.entity;

import com.hospital.hpmadmin.entity.Address;
import com.hospital.hpmadmin.model.Auditable;
import com.hospital.hpmadmin.model.ContactPoint;
import com.hospital.hpmadmin.model.RelationshipType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "contacts")
public class Contact extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    private RelationshipType relationshipType;

    @ElementCollection
    @CollectionTable(
            name = "contact_telecoms",
            joinColumns = @JoinColumn(name = "contact_id")
    )
    private List<ContactPoint> telecom = new ArrayList<>();

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "address_id")
    private Address address;
}