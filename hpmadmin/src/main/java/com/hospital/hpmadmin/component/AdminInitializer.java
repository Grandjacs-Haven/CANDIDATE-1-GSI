package com.hospital.hpmadmin.component;

import com.hospital.hpmadmin.dto.PrivilegeAssignmentDto;
import com.hospital.hpmadmin.entity.User;
import com.hospital.hpmadmin.model.UserRole;
import com.hospital.hpmadmin.model.UserStatus;
import com.hospital.hpmadmin.repository.UserRepository;
import com.hospital.hpmadmin.service.UserPrivilegeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserPrivilegeService userPrivilegeService;

    @Override
    @Transactional
    public void run(String... args) {
        String adminUsername = "harry@xpro.com";

        if (userRepository.existsByUsername(adminUsername) || userRepository.existsByEmail(adminUsername)) {
            log.info("System administrator '{}' already exists. Skipping bootstrap creation.", adminUsername);
            return;
        }

        log.info("Bootstrapping initial system administrator account for '{}'...", adminUsername);

        User adminUser = new User();
        adminUser.setUsername(adminUsername);
        adminUser.setEmail(adminUsername);
        adminUser.setPassword(passwordEncoder.encode("AdminSecurePassword123!")); // Change in production!
        adminUser.setFirstName("Harry");
        adminUser.setLastName("Administrator");
        adminUser.setRole(UserRole.ADMIN);
        adminUser.setUserStatus(UserStatus.ACTIVE);

        // Save user first so an ID is generated for audit tracking and privilege linking
        User savedUser = userRepository.save(adminUser);

        savedUser.setCreatedBy(savedUser.getId());
        savedUser.setUpdatedBy(savedUser.getId());
        savedUser = userRepository.save(savedUser);

        try {
            PrivilegeAssignmentDto privDto = new PrivilegeAssignmentDto();
            privDto.setPrivilegeNames(Set.of("ADMIN"));

            userPrivilegeService.attachPrivileges(
                    savedUser.getId(),
                    privDto,
                    savedUser.getId()
            );
            log.info("Successfully attached 'ADMIN' privilege to administrator '{}'", savedUser.getUsername());
        } catch (Exception e) {
            log.error("Failed to attach bootstrap privilege to administrator '{}'", savedUser.getUsername(), e);
            throw e;
        }

        log.info("Successfully provisioned initial system administrator: '{}'", adminUsername);
    }
}