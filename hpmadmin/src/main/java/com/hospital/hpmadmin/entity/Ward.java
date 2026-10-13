package com.hospital.hpmadmin.entity;

import com.hospital.hpmadmin.model.Auditable;

import com.hospital.hpmadmin.model.WardStatus;
import com.hospital.hpmadmin.model.WardType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(
        name = "wards",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_ward_code",
                        columnNames = "code"
                )
        }
)
@Getter
@Setter
public class Ward extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "ward_type", nullable = false, length = 40)
    private WardType wardType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WardStatus status ;

    @Column(columnDefinition = "TEXT")
    private String description;
}