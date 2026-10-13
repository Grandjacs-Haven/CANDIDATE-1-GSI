package com.hospital.hpmadmin.service;

import com.hospital.hpmadmin.dto.PractitionerRequestDto;
import com.hospital.hpmadmin.dto.PractitionerResponseDto;
import com.hospital.hpmadmin.entity.Practitioner;
import com.hospital.hpmadmin.entity.User;
import com.hospital.hpmadmin.model.UserRole;
import com.hospital.hpmadmin.repository.PractitionerRepository;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
public class PractitionerService {

    private final PractitionerRepository practitionerRepository;
    private final UserService userService;

    public PractitionerService(
            PractitionerRepository practitionerRepository,
            @Lazy UserService userService
    ) {
        this.practitionerRepository = practitionerRepository;
        this.userService = userService;
    }

    @Transactional
    public Page<PractitionerResponseDto> findAllPaged(Pageable pageable) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info(
                "Fetching paginated practitioners (corrId '{}'): Page {}, Size {}",
                corrId, pageable.getPageNumber(), pageable.getPageSize()
        );

        return userService.findUsersByRole(UserRole.PRACTITIONER, pageable)
                .map(user -> findById(user.getId()));
    }

    @Transactional
    public PractitionerResponseDto findById(UUID userId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Fetching practitioner profile for user '{}' (corrId '{}')", userId, corrId);

        User masterUser = userService.getById(userId);
        if (masterUser.getRole() != UserRole.PRACTITIONER) {
            throw new IllegalStateException("User does not hold the PRACTITIONER role");
        }

        Practitioner practitioner = practitionerRepository.findById(userId)
                .orElseGet(() -> {
                    log.info("Lazy initializing Practitioner profile for user: {} (corrId '{}')", userId, corrId);
                    Practitioner newPractitioner = new Practitioner();
                    newPractitioner.setId(userId);
                    newPractitioner.setUser(masterUser);
                    newPractitioner.setPractitionerNumber("PRAC-" + userId.toString().substring(0, 8).toUpperCase());
                    return newPractitioner;
                });

        if (practitioner.getUser() == null) {
            practitioner.setUser(masterUser);
        }

        Practitioner saved = practitionerRepository.save(practitioner);
        return mapToDto(saved);
    }

    @Transactional
    public PractitionerResponseDto updatePractitionerProfile(
            UUID userId,
            PractitionerRequestDto requestDto,
            UUID actorId
    ) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);

        // Leverage findById to ensure safe lazy-creation & session management
        PractitionerResponseDto currentProfile = findById(userId);

        // Fetch the managed entity directly for updates
        Practitioner existing = practitionerRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Practitioner profile not found for user: " + userId));

        if (requestDto.getPractitionerNumber() != null) {
            existing.setPractitionerNumber(requestDto.getPractitionerNumber());
        }
        if (requestDto.getPractitionerType() != null) {
            existing.setPractitionerType(requestDto.getPractitionerType());
        }
        if (requestDto.getProfessionalTitle() != null) {
            existing.setProfessionalTitle(requestDto.getProfessionalTitle());
        }
        if (requestDto.getLicenseNumber() != null) {
            existing.setLicenseNumber(requestDto.getLicenseNumber());
        }
        if (requestDto.getRegistrationBody() != null) {
            existing.setRegistrationBody(requestDto.getRegistrationBody());
        }
        if (requestDto.getQualification() != null) {
            existing.setQualification(requestDto.getQualification());
        }
        if (requestDto.getSpecialty() != null) {
            existing.setSpecialty(requestDto.getSpecialty());
        }
        existing.setActive(requestDto.isActive());
        existing.setUpdatedBy(actorId);

        Practitioner saved = practitionerRepository.save(existing);

        log.info(
                "Updated practitioner profile '{}' by actor '{}' (corrId '{}')",
                saved.getId(), actorId, corrId
        );

        return mapToDto(saved);
    }

    @Transactional
    public void removePractitionerProfile(UUID userId, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        if (!practitionerRepository.existsById(userId)) {
            throw new EntityNotFoundException("Cannot remove: Practitioner profile does not exist");
        }

        practitionerRepository.deleteById(userId);

        log.info("Removed Practitioner profile for user '{}' by actor '{}' (corrId '{}')", userId, actorId, corrId);
    }

    private PractitionerResponseDto mapToDto(Practitioner practitioner) {
        var user = practitioner.getUser();
        return PractitionerResponseDto.builder()
                .id(practitioner.getId())
                .username(user != null ? user.getUsername() : null)
                .email(user != null ? user.getEmail() : null)
                .firstName(user != null ? user.getFirstName() : null)
                .lastName(user != null ? user.getLastName() : null)
                .phoneNumber(user != null ? user.getPhoneNumber() : null)
                .role(user != null ? user.getRole() : null)
                .userStatus(user != null ? user.getUserStatus() : null)
                .gender(user != null ? user.getGender() : null)
                .practitionerNumber(practitioner.getPractitionerNumber())
                .practitionerType(practitioner.getPractitionerType())
                .professionalTitle(practitioner.getProfessionalTitle())
                .licenseNumber(practitioner.getLicenseNumber())
                .registrationBody(practitioner.getRegistrationBody())
                .qualification(practitioner.getQualification())
                .specialty(practitioner.getSpecialty())
                .active(practitioner.isActive())
                .build();
    }
}