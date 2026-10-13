package com.hospital.hpmadmin.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.Set;

@Data
public class PrivilegeAssignmentDto {
    @NotEmpty(message = "Privilege names cannot be empty.")
    private Set<String> privilegeNames;
}