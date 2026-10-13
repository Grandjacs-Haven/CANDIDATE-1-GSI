package com.hospital.hpmadmin.service;

import com.hospital.hpmadmin.config.GatewaySecurityProperties;
import com.hospital.hpmadmin.dto.UserRegistrationRequestDto;
import com.hospital.hpmadmin.dto.UserResponse;
import com.hospital.hpmadmin.dto.UserUpdateDto;
import com.hospital.hpmadmin.entity.User;
import com.hospital.hpmadmin.model.UserRole;
import com.hospital.hpmadmin.model.UserStatus;
import com.hospital.hpmadmin.repository.UserRepository;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
public class UserService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final PractitionerService practitionerService;
    private final GatewaySecurityProperties gatewaySecurityProperties; // Restored
    private final HttpServletRequest request;

    public UserService(
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            @Lazy PractitionerService practitionerService,
            GatewaySecurityProperties gatewaySecurityProperties, // Restored
            HttpServletRequest request
    ) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.practitionerService = practitionerService;
        this.gatewaySecurityProperties = gatewaySecurityProperties;
        this.request = request;
    }    public UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .userStatus(user.getUserStatus())
                .gender(user.getGender())
                .build();
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(UserStatus status, Pageable pageable) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Fetching all users with status filter: {} (corrId '{}')", status, corrId);

        Page<User> users;
        if (status != null) {
            users = userRepository.findByUserStatus(status, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        return users.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public UserResponse findById(UUID userId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Fetching user by id: {} (corrId '{}')", userId, corrId);

        User user = getById(userId);
        return mapToResponse(user);
    }

    @Transactional(readOnly = true)
    public User getById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
    }

    public UserResponse registerUser(UserRegistrationRequestDto requestDto, UUID actorId) {
        // 1. Validate email domain restriction against allowed domains
        String email = requestDto.getEmail();
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }

        List<String> allowedDomains = gatewaySecurityProperties.getAllowedDomains();
        if (allowedDomains == null || allowedDomains.isEmpty()) {
            throw new IllegalArgumentException("Registration denied: No allowed email domains configured.");
        }

        String lowerEmail = email.toLowerCase(Locale.ROOT);
        boolean domainMatched = allowedDomains.stream()
                .filter(domain -> domain != null && !domain.isBlank())
                .map(domain -> "@" + domain.trim().toLowerCase(Locale.ROOT).replaceAll("^\\.", ""))
                .anyMatch(lowerEmail::endsWith);

        if (!domainMatched) {
            throw new IllegalArgumentException("Registration restricted: Email domain is not permitted for the admin portal.");
        }

        // 2. Check uniqueness constraints
        if (userRepository.existsByUsername(requestDto.getUsername())) {
            throw new IllegalArgumentException("Username is already taken.");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        // 3. Map request to User entity and encode password
        User user = new User();
        user.setUsername(requestDto.getUsername());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(requestDto.getPassword()));
        user.setFirstName(requestDto.getFirstName());
        user.setLastName(requestDto.getLastName());
        user.setPhoneNumber(requestDto.getPhoneNumber());
        user.setRole(requestDto.getRole());
        user.setUserStatus(UserStatus.ACTIVE);
        user.setGender(requestDto.getGender());

        if (actorId != null) {
            user.setCreatedBy(actorId);
            user.setUpdatedBy(actorId);
        }

        User savedUser = userRepository.save(user);

        if (savedUser.getCreatedBy() == null) {
            savedUser.setCreatedBy(savedUser.getId());
            savedUser.setUpdatedBy(savedUser.getId());
            savedUser = userRepository.save(savedUser);
        }

        log.info("Successfully registered admin user '{}' with role '{}' via actor UUID '{}'",
                savedUser.getUsername(), savedUser.getRole(), actorId);

        return mapToResponse(savedUser);
    }


    @Transactional
    public UserResponse updateUser(UUID userId, UserUpdateDto updateDto, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        User user = getById(userId);

        if (updateDto.getFirstName() != null) user.setFirstName(updateDto.getFirstName());
        if (updateDto.getLastName() != null) user.setLastName(updateDto.getLastName());
        if (updateDto.getPhoneNumber() != null) user.setPhoneNumber(updateDto.getPhoneNumber());
        if (updateDto.getGender() != null) user.setGender(updateDto.getGender());
        if (updateDto.getUserStatus() != null) user.setUserStatus(updateDto.getUserStatus());

        user.setUpdatedBy(actorId);

        log.info("Updating profile for user: {} (corrId '{}')", userId, corrId);
        return mapToResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(UUID userId, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        User user = getById(userId);

        user.setUserStatus(UserStatus.DELETED);
        user.setUpdatedBy(actorId);
        userRepository.save(user);

        // If user is a medical practitioner, clean up associated profile hooks safely
        if (user.getRole() == UserRole.PRACTITIONER) {
            try {
                UUID parsedCorrId = (corrId != null && !corrId.isBlank()) ? UUID.fromString(corrId) : null;
                practitionerService.removePractitionerProfile(userId, actorId);
            } catch (Exception e) {
                log.warn("No active practitioner profile found to clean up for user: {} (corrId '{}')", userId, corrId);
            }
        }

        log.info("User {} and associated profiles marked as deleted by actor {}. (corrId '{}')", userId, actorId, corrId);
    }

    @Transactional(readOnly = true)
    public Page<User> findUsersByRole(UserRole role, Pageable pageable) {
        return userRepository.findByRole(role, pageable);
    }

}