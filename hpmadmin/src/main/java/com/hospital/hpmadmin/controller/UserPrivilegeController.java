package com.hospital.hpmadmin.controller;

import com.hospital.hpmadmin.dto.PrivilegeAssignmentDto;
import com.hospital.hpmadmin.dto.PrivilegeOption;
import com.hospital.hpmadmin.dto.UserPrivilegeResponseDto;
import com.hospital.hpmadmin.service.UserPrivilegeService;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/user-priviledge")
@RequiredArgsConstructor
public class UserPrivilegeController {

    private final UserPrivilegeService userPrivilegeService;

    @GetMapping("/privileges/available")
    public List<PrivilegeOption> getAvailablePrivileges() {
        return userPrivilegeService.getAvailablePrivileges();
    }

    @GetMapping("/{userId}/privileges")
    public List<UserPrivilegeResponseDto> getUserPrivileges(@PathVariable UUID userId) {
        return userPrivilegeService.getUserPrivileges(userId);
    }

    @PostMapping("/{userId}/privileges")
    @ResponseStatus(HttpStatus.CREATED)
    public List<UserPrivilegeResponseDto> attachPrivileges(
            @PathVariable UUID userId,
            @Valid @RequestBody PrivilegeAssignmentDto requestDto,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        return userPrivilegeService.attachPrivileges(userId, requestDto, actorId);
    }

    @DeleteMapping("/{userId}/privileges/{privilegeName}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removePrivilege(
            @PathVariable UUID userId,
            @PathVariable String privilegeName,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        userPrivilegeService.removePrivilege(userId, privilegeName, actorId);
    }

    @DeleteMapping("/{userId}/privileges")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeAllPrivileges(
            @PathVariable UUID userId,
            @RequestHeader(AppConstants.ACTOR_ID) UUID actorId
    ) {
        userPrivilegeService.removeAllPrivileges(userId, actorId);
    }
}