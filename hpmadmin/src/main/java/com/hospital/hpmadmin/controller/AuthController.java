package com.hospital.hpmadmin.controller;


import com.hospital.hpmadmin.dto.LoginRequest;
import com.hospital.hpmadmin.dto.PasswordChangeRequest;
import com.hospital.hpmadmin.model.AuthResponse;
import com.hospital.hpmadmin.security.UserPrincipal;
import com.hospital.hpmadmin.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody PasswordChangeRequest request) {

        authService.changePassword(principal.getId(), request);
        return ResponseEntity.ok().build();
    }
}