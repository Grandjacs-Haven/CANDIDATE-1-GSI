package com.hospital.hpmadmin.security;

import com.hospital.hpmadmin.entity.User;
import com.hospital.hpmadmin.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) {
        log.debug("Loading user for authentication");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.info("User not found during login attempt");
                    return new UsernameNotFoundException("Invalid email or password");
                });

        log.debug("User found for authentication");
        return UserPrincipal.createUser(user);
    }

    public UserPrincipal loadUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.info("User with id {} not found", id);
                    return new UsernameNotFoundException("User not found");
                });

        log.debug("User with id {} found", id);
        return UserPrincipal.createUser(user);
    }
}