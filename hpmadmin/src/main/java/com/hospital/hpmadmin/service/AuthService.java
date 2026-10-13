package com.hospital.hpmadmin.service;


import com.hospital.hpmadmin.dto.LoginRequest;
import com.hospital.hpmadmin.dto.PasswordChangeRequest;
import com.hospital.hpmadmin.entity.User;
import com.hospital.hpmadmin.model.AuthResponse;
import com.hospital.hpmadmin.model.UserRole;
import com.hospital.hpmadmin.repository.UserRepository;
import com.hospital.hpmadmin.security.CustomUserDetailsService;
import com.hospital.hpmadmin.security.TokenProvider;
import com.hospital.hpmadmin.security.UserPrincipal;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final TokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public AuthResponse login(LoginRequest request) {
        // Use username if email is blank/null, or fallback accordingly
        String identifier = request.getEmail();

        if (identifier == null || identifier.isBlank()) {
            throw new IllegalArgumentException("Username or email is required for login.");
        }

        // 1. Fetch Principal
        UserPrincipal principal = (UserPrincipal) userDetailsService.loadUserByUsername(identifier);

        // 2. Verify Encrypted Password
        if (!passwordEncoder.matches(request.getPassword(), principal.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        // 3. Validate Role Access (`PRACTITIONER`, `ADMIN`, `HOSPITAL_ADMIN`)
        validateRoleAccess(principal.getUserRole());

        // 4. Create Authentication Token
        Authentication auth = new UsernamePasswordAuthenticationToken(
                principal, null, principal.getAuthorities()
        );

        // 5. Generate Token
        String token = tokenProvider.generateToken(auth);

        Set<String> scopes = tokenProvider.getScopesFromToken(token);

        log.info("User '{}' successfully authenticated with role '{}' and {} scopes assigned",
                principal.getEmail(), principal.getUserRole(), scopes.size());

        // 7. Return Response with Scopes included
        return AuthResponse.builder()
                .token(token)
                .userId(principal.getId())
                .expiresAt(tokenProvider.getExpiration(token))
                .role(principal.getUserRole())
                .scopes(scopes)
                .build();
    }

    public void logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        log.info("User successfully logged out and security context cleared.");
    }

    private void validateRoleAccess(UserRole role) {
        boolean isAllowed = role == UserRole.PRACTITIONER
                || role == UserRole.ADMIN
                || role == UserRole.HOSPITAL_ADMIN;

        if (!isAllowed) {
            log.warn("Access Denied: Role '{}' is not authorized for backend access.", role);
            throw new AccessDeniedException("Access denied: Unauthorized user role.");
        }
    }

    @Transactional
    public void changePassword(UUID userId, PasswordChangeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Incorrect current password.");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New passwords do not match.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password updated securely for user: {}", userId);
    }
}