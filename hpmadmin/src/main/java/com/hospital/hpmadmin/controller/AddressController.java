package com.hospital.hpmadmin.controller;

import com.hospital.hpmadmin.dto.AddressRequest;
import com.hospital.hpmadmin.dto.AddressResponseDto;
import com.hospital.hpmadmin.service.AddressService;
import com.hospital.hpmadmin.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AddressResponseDto createAddress(@Valid @RequestBody AddressRequest request, @RequestHeader(value = AppConstants.ACTOR_ID, required = false) UUID actorId) {
        return addressService.saveAddress(request, actorId);
    }

    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public AddressResponseDto getAddress(@PathVariable UUID id) {
        return addressService.findById(id );
    }

    @PatchMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public AddressResponseDto updateAddress(@PathVariable UUID id, @Valid @RequestBody AddressRequest request, @RequestHeader(value = AppConstants.ACTOR_ID, required = false) UUID actorId) {
        return addressService.updateAddress(id, request, actorId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAddress(@PathVariable UUID id, @RequestHeader(value = AppConstants.ACTOR_ID, required = false) UUID actorId) {
        addressService.deleteAddress(id, actorId);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<AddressResponseDto> getAllAddresses() {
        return addressService.findAll();
    }
}