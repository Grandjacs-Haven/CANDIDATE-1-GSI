package com.hospital.hpmadmin.service;

import com.hospital.hpmadmin.dto.PrivilegeAssignmentDto;
import com.hospital.hpmadmin.dto.PrivilegeOption;
import com.hospital.hpmadmin.dto.UserPrivilegeResponseDto;
import com.hospital.hpmadmin.entity.UserPrivilege;
import com.hospital.hpmadmin.repository.UserPrivilegeRepository;
import com.hospital.hpmadmin.repository.UserRepository;
import com.hospital.hpmadmin.data.Privileges;
import com.hospital.hpmadmin.util.AppConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserPrivilegeService {

    private final UserPrivilegeRepository userPrivilegeRepository;
    private final UserRepository userRepository;

    public UserPrivilegeResponseDto mapToResponse(UserPrivilege userPrivilege) {
        return UserPrivilegeResponseDto.builder()
                .id(userPrivilege.getId())
                .userId(userPrivilege.getUserId())
                .privilegeName(userPrivilege.getPrivilegeName())
                .scope(userPrivilege.getScope())
                .build();
    }

    /**
     * Return every privilege defined in the static Java map.
     */
    @Transactional(readOnly = true)
    public List<PrivilegeOption> getAvailablePrivileges() {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        log.info("Fetching available system privileges (corrId '{}')", corrId);

        return Privileges.PRIVILEGES.entrySet()
                .stream()
                .map(entry -> new PrivilegeOption(
                        entry.getKey(),
                        entry.getValue()
                ))
                .sorted(Comparator.comparing(
                        PrivilegeOption::privilegeName
                ))
                .toList();
    }

    /**
     * Get privileges currently assigned to a user.
     */
    @Transactional(readOnly = true)
    public List<UserPrivilegeResponseDto> getUserPrivileges(UUID userId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        ensureUserExists(userId);

        List<UserPrivilegeResponseDto> privileges = userPrivilegeRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        log.info("Retrieved '{}' privileges for user '{}' (corrId '{}')", privileges.size(), userId, corrId);
        return privileges;
    }

    /**
     * Assign one or more privileges to a user.
     * Duplicate assignments are skipped. Cache is evicted to ensure instant filter updates.
     */
    @Transactional
    @CacheEvict(value = "userPrivilegesCache", key = "#userId")
    public List<UserPrivilegeResponseDto> attachPrivileges(
            UUID userId,
            PrivilegeAssignmentDto requestdto,
            UUID actorId
    ) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        ensureUserExists(userId);

        if (requestdto.getPrivilegeNames() == null) {
            throw new IllegalArgumentException("At least one privilege must be provided");
        }

        for (String privilegeName : requestdto.getPrivilegeNames()) {
            String scope = Privileges.PRIVILEGES.get(privilegeName);

            if (scope == null) {
                throw new IllegalArgumentException("Unknown privilege: " + privilegeName);
            }

            boolean alreadyAssigned = userPrivilegeRepository
                    .existsByUserIdAndPrivilegeName(userId, privilegeName);

            if (alreadyAssigned) {
                continue;
            }

            UserPrivilege userPrivilege = new UserPrivilege();
            userPrivilege.setUserId(userId);
            userPrivilege.setPrivilegeName(privilegeName);
            userPrivilege.setScope(scope);

            // Audit fields tracking
            userPrivilege.setCreatedBy(actorId);
            userPrivilege.setUpdatedBy(actorId);

            userPrivilegeRepository.save(userPrivilege);
        }

        log.info("Attached privileges to user '{}' by actor '{}' (corrId '{}')", userId, actorId, corrId);
        return getUserPrivileges(userId);
    }

    /**
     * Check whether a user has a valid assigned privilege.
     * Cached for high performance inside the security/token filter chain.
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "userPrivilegesCache", key = "#userId + '-' + #privilegeName")
    public boolean hasPrivilege(UUID userId, String privilegeName) {
        String expectedScope = Privileges.PRIVILEGES.get(privilegeName);

        if (expectedScope == null) {
            return false;
        }

        return userPrivilegeRepository
                .findByUserIdAndPrivilegeName(userId, privilegeName)
                .map(userPrivilege -> expectedScope.equals(userPrivilege.getScope()))
                .orElse(false);
    }

    /**
     * Remove a single privilege from a user.
     */
    @Transactional
    @CacheEvict(value = "userPrivilegesCache", key = "#userId")
    public void removePrivilege(UUID userId, String privilegeName, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);

        if (!Privileges.PRIVILEGES.containsKey(privilegeName)) {
            throw new IllegalArgumentException("Unknown privilege: " + privilegeName);
        }

        ensureUserExists(userId);
        userPrivilegeRepository.deleteByUserIdAndPrivilegeName(userId, privilegeName);

        log.info("Removed privilege '{}' from user '{}' by actor '{}' (corrId '{}')", privilegeName, userId, actorId, corrId);
    }

    /**
     * Remove all privileges assigned to a user.
     */
    @Transactional
    @CacheEvict(value = "userPrivilegesCache", key = "#userId")
    public void removeAllPrivileges(UUID userId, UUID actorId) {
        String corrId = MDC.get(AppConstants.CORRELATION_ID);
        ensureUserExists(userId);

        userPrivilegeRepository.deleteByUserId(userId);

        log.info("Removed all privileges from user '{}' by actor '{}' (corrId '{}')", userId, actorId, corrId);
    }

    private void ensureUserExists(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found: " + userId);
        }
    }
}