package com.hospital.hpmadmin.controller;

import com.hospital.hpmadmin.dto.UserRegistrationRequestDto;
import com.hospital.hpmadmin.dto.UserRequestDto;
import com.hospital.hpmadmin.dto.UserResponse;
import com.hospital.hpmadmin.dto.UserUpdateDto;
import com.hospital.hpmadmin.model.UserStatus;
import com.hospital.hpmadmin.service.UserService;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public Page<UserResponse> getAllUsers(
            @RequestParam(required = false) UserStatus status,
            Pageable pageable,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId,
            @RequestHeader(value = AppConstants.CORRELATION_ID, required = false) UUID corrId
    ) {
        return userService.getAllUsers(status, pageable);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public UserResponse getUserById(
            @PathVariable UUID id,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId,
            @RequestHeader(value = AppConstants.CORRELATION_ID, required = false) UUID corrId
    ) {
        return userService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse registerUser(
            @Valid @RequestBody UserRegistrationRequestDto requestDto,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId,
            @RequestHeader(value = AppConstants.CORRELATION_ID, required = false) UUID corrId
    ) {
        return userService.registerUser(requestDto, actorId);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public UserResponse updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserUpdateDto updateDto,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId,
            @RequestHeader(value = AppConstants.CORRELATION_ID, required = false) UUID corrId
    ) {
        return userService.updateUser(id, updateDto, actorId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(
            @PathVariable UUID id,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId,
            @RequestHeader(value = AppConstants.CORRELATION_ID, required = false) UUID corrId
    ) {
        userService.deleteUser(id, actorId);
    }
}