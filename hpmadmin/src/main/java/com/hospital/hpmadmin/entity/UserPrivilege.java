package com.hospital.hpmadmin.entity;

import com.hospital.hpmadmin.model.Auditable;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(
        name = "user_privilege",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_user_privilege",
                columnNames = {"user_id", "privilege_name"}
        )
)
@Getter
@Setter
public class UserPrivilege extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "privilege_name", nullable = false, length = 50)
    private String privilegeName;

    @Column(name = "scope", nullable = false, length = 30)
    private String scope;
}